import Groq from 'groq-sdk';
import { ParsedJobDescription } from './jobAnalyzer.service';
import { RAGResult } from './rag.service';
import { AnalysisResult, AnalysisResultSchema } from '../schemas/analysis.schema';

export class GroqService {
  private client: Groq;
  private model: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }

    this.client = new Groq({ apiKey });
    this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  async evaluateResumeMatch(
    jobDescription: ParsedJobDescription,
    ragResult: RAGResult,
    resumeText: string
  ): Promise<AnalysisResult> {
    const evidenceContext = this.buildEvidenceContext(ragResult);
    const prompt = this.buildEvaluationPrompt(jobDescription, evidenceContext, resumeText);

    console.log(`[Groq] Sending evaluation request to ${this.model}...`);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new Error('Empty response from Groq API');
      }

      console.log(`[Groq] Received response, parsing JSON...`);
      return this.parseAndValidateResponse(raw, ragResult, jobDescription);
    } catch (err: unknown) {
      console.error('[Groq] Error calling API:', err);
      if (err instanceof Error) {
        throw new Error(`Groq API error: ${err.message}`);
      }
      throw new Error('Unknown error from Groq API');
    }
  }

  private getSystemPrompt(): string {
    return `You are ATSense, an expert AI resume analyst and ATS scoring system.

Your task is to evaluate how well a candidate's resume matches a given job description using ONLY the retrieved evidence chunks provided to you. Do NOT fabricate or assume any experience not found in the evidence.

CRITICAL RULES:
1. Base your entire evaluation ONLY on the retrieved resume evidence chunks.
2. If a requirement cannot be supported by evidence, mark it as "not_found" and do not assign a high score.
3. Never claim the candidate has a skill not present in the evidence.
4. Provide honest, evidence-based scoring.
5. Return ONLY valid JSON matching the specified schema.

SCORING WEIGHTS:
- Required Skills: 30 points maximum
- Experience: 20 points maximum  
- Responsibilities: 15 points maximum
- Technical Keywords: 15 points maximum
- Projects/Relevant Experience: 10 points maximum
- Education/Certifications: 5 points maximum
- ATS Readability: 5 points maximum

MATCH LEVELS:
- 90-100: Exceptional Match
- 80-89: Strong Match
- 70-79: Good Match
- 60-69: Moderate Match
- 40-59: Weak Match
- 0-39: Low Match`;
  }

  private buildEvaluationPrompt(
    jd: ParsedJobDescription,
    evidenceContext: string,
    resumeText: string
  ): string {
    const resumeSnippet = resumeText.slice(0, 500);

    return `Evaluate this resume against the job description using the RAG-retrieved evidence below.

=== JOB DESCRIPTION ANALYSIS ===
Required Skills: ${jd.requiredSkills.slice(0, 10).join(', ') || 'Not explicitly listed'}
Preferred Skills: ${jd.preferredSkills.slice(0, 8).join(', ') || 'Not specified'}
Key Responsibilities: ${jd.responsibilities.slice(0, 6).join(' | ') || 'Not specified'}
Experience Requirements: ${jd.experienceRequirements.slice(0, 4).join(' | ') || 'Not specified'}
Education Requirements: ${jd.educationRequirements.slice(0, 3).join(' | ') || 'Not specified'}
Keywords: ${jd.keywords.slice(0, 20).join(', ')}

=== RESUME BEGINNING (for ATS readability check) ===
${resumeSnippet}...

${evidenceContext}

=== YOUR TASK ===
Using ONLY the evidence above, evaluate the resume match and return this exact JSON structure:

{
  "overallScore": <0-100 integer>,
  "matchLevel": "<Exceptional Match|Strong Match|Good Match|Moderate Match|Weak Match|Low Match>",
  "summary": "<2-3 sentence objective summary of the match based strictly on evidence>",
  "categoryScores": {
    "requiredSkills": <0-30>,
    "experience": <0-20>,
    "responsibilities": <0-15>,
    "technicalKeywords": <0-15>,
    "projects": <0-10>,
    "education": <0-5>,
    "atsReadability": <0-5>
  },
  "matchedSkills": ["<skills clearly found in evidence>"],
  "missingSkills": ["<required skills NOT found in evidence>"],
  "strengths": ["<evidence-based strengths, max 5>"],
  "weaknesses": ["<evidence-based gaps, max 5>"],
  "recommendations": ["<specific, actionable improvement tips, max 6>"],
  "evidence": [
    {
      "requirement": "<job requirement text>",
      "matchScore": <0-100>,
      "status": "<strong_match|moderate_match|weak_match|not_found>",
      "resumeEvidence": ["<exact or near-exact quote from resume evidence>"],
      "sourceSection": "<section name>",
      "similarity": <0.0-1.0>
    }
  ],
  "atsReadabilityDetails": {
    "score": <0-100>,
    "hasContactInfo": <true|false>,
    "hasClearSections": <true|false>,
    "hasConsistentFormatting": <true|false>,
    "hasVisibleSkills": <true|false>,
    "issues": ["<any ATS formatting issues found>"],
    "explanation": "<brief explanation of ATS readability>"
  },
  "keywordAnalysis": {
    "matched": ["<keywords found in evidence>"],
    "missing": ["<important JD keywords NOT in evidence>"],
    "suggested": ["<additional keywords that could strengthen the resume, ONLY if evidence supports them>"]
  },
  "ragInsights": {
    "totalChunksIndexed": <number>,
    "chunksRetrieved": <number>,
    "topSimilarity": <number>,
    "averageSimilarity": <number>,
    "embeddingModel": "all-MiniLM-L6-v2",
    "vectorDatabase": "Qdrant",
    "topK": <number>
  }
}

IMPORTANT: The overallScore MUST equal the sum of categoryScores. Return only valid JSON.`;
  }

  private buildEvidenceContext(ragResult: RAGResult): string {
    const lines = ['=== RAG-RETRIEVED RESUME EVIDENCE ===\n'];

    for (const ev of ragResult.evidence.slice(0, 10)) {
      lines.push(`\n[Requirement: "${ev.requirement}" | Type: ${ev.requirementType}]`);

      for (const chunk of ev.retrievedChunks.slice(0, 3)) {
        lines.push(`  Evidence [Section: ${chunk.section}, Similarity: ${chunk.similarity.toFixed(3)}]:`);
        lines.push(`  "${chunk.text.slice(0, 350)}"`);
      }
    }

    return lines.join('\n');
  }

  private parseAndValidateResponse(
    raw: string,
    ragResult: RAGResult,
    jd: ParsedJobDescription
  ): AnalysisResult {
    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON from markdown code blocks
      const match = raw.match(/```(?:json)?\s*([\s\S]+?)```/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        throw new Error('Groq returned invalid JSON. Please try again.');
      }
    }

    // Inject ragInsights if missing
    if (typeof parsed === 'object' && parsed !== null && !('ragInsights' in parsed)) {
      (parsed as Record<string, unknown>).ragInsights = {
        totalChunksIndexed: ragResult.totalChunksIndexed,
        chunksRetrieved: ragResult.chunksRetrieved,
        topSimilarity: ragResult.topSimilarity,
        averageSimilarity: ragResult.averageSimilarity,
        embeddingModel: 'all-MiniLM-L6-v2',
        vectorDatabase: 'Qdrant',
        topK: ragResult.topK,
      };
    }

    // Validate with Zod
    const result = AnalysisResultSchema.safeParse(parsed);

    if (!result.success) {
      console.error('[Groq] Schema validation errors:', result.error.flatten());
      // Return a best-effort result with defaults for missing fields
      return this.sanitizeResult(parsed as Record<string, unknown>, ragResult, jd);
    }

    return result.data;
  }

  private sanitizeResult(
    raw: Record<string, unknown>,
    ragResult: RAGResult,
    jd: ParsedJobDescription
  ): AnalysisResult {
    const score = typeof raw.overallScore === 'number' ? Math.min(100, Math.max(0, raw.overallScore)) : 50;
    const matchLevel = this.getMatchLevel(score);

    return {
      overallScore: score,
      matchLevel,
      summary: typeof raw.summary === 'string' ? raw.summary : 'Analysis completed based on available resume evidence.',
      categoryScores: {
        requiredSkills: typeof (raw.categoryScores as Record<string, number>)?.requiredSkills === 'number'
          ? (raw.categoryScores as Record<string, number>).requiredSkills : Math.floor(score * 0.3),
        experience: typeof (raw.categoryScores as Record<string, number>)?.experience === 'number'
          ? (raw.categoryScores as Record<string, number>).experience : Math.floor(score * 0.2),
        responsibilities: typeof (raw.categoryScores as Record<string, number>)?.responsibilities === 'number'
          ? (raw.categoryScores as Record<string, number>).responsibilities : Math.floor(score * 0.15),
        technicalKeywords: typeof (raw.categoryScores as Record<string, number>)?.technicalKeywords === 'number'
          ? (raw.categoryScores as Record<string, number>).technicalKeywords : Math.floor(score * 0.15),
        projects: typeof (raw.categoryScores as Record<string, number>)?.projects === 'number'
          ? (raw.categoryScores as Record<string, number>).projects : Math.floor(score * 0.1),
        education: typeof (raw.categoryScores as Record<string, number>)?.education === 'number'
          ? (raw.categoryScores as Record<string, number>).education : Math.floor(score * 0.05),
        atsReadability: typeof (raw.categoryScores as Record<string, number>)?.atsReadability === 'number'
          ? (raw.categoryScores as Record<string, number>).atsReadability : Math.floor(score * 0.05),
      },
      matchedSkills: Array.isArray(raw.matchedSkills) ? raw.matchedSkills as string[] : [],
      missingSkills: Array.isArray(raw.missingSkills) ? raw.missingSkills as string[] : jd.requiredSkills.slice(0, 3),
      strengths: Array.isArray(raw.strengths) ? raw.strengths as string[] : [],
      weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses as string[] : [],
      recommendations: Array.isArray(raw.recommendations) ? raw.recommendations as string[] : [
        'Ensure your resume clearly lists all relevant technical skills.',
        'Quantify your achievements with specific metrics.',
        'Align your experience descriptions with the job responsibilities.',
      ],
      evidence: Array.isArray(raw.evidence) ? raw.evidence as AnalysisResult['evidence'] : [],
      ragInsights: {
        totalChunksIndexed: ragResult.totalChunksIndexed,
        chunksRetrieved: ragResult.chunksRetrieved,
        topSimilarity: ragResult.topSimilarity,
        averageSimilarity: ragResult.averageSimilarity,
        embeddingModel: 'all-MiniLM-L6-v2',
        vectorDatabase: 'Qdrant',
        topK: ragResult.topK,
      },
    };
  }

  private getMatchLevel(score: number): AnalysisResult['matchLevel'] {
    if (score >= 90) return 'Exceptional Match';
    if (score >= 80) return 'Strong Match';
    if (score >= 70) return 'Good Match';
    if (score >= 60) return 'Moderate Match';
    if (score >= 40) return 'Weak Match';
    return 'Low Match';
  }
}
