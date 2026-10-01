import Groq from 'groq-sdk';
import { ParsedJobDescription } from './jobAnalyzer.service';
import { RAGResult } from './rag.service';
import { AnalysisResult, AnalysisResultSchema } from '../schemas/analysis.schema';

export class GroqService {
  private client: Groq;
  private model: string;

  // Groq's free tier caps openai/gpt-oss-120b at 8,000 tokens/minute (TPM).
  // If a single request exceeds that budget, Groq rejects it with HTTP 413
  // "Request too large ... on tokens per minute". The evaluation prompt must
  // therefore stay well under the limit (~4 chars ≈ 1 token for plain text).
  private static readonly CHARS_PER_TOKEN = 4;

  // Progressive input-prompt budgets (in tokens). If Groq rejects the largest
  // prompt, we retry with smaller evidence contexts so the analysis can still
  // complete on the free tier.
  private static readonly PROMPT_TOKEN_BUDGETS = [3200, 2400, 1600];

  // Output tokens count toward the same combined TPM cap on some accounts, so
  // keep max_tokens modest too.
  private static readonly MAX_OUTPUT_TOKENS = 3072;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }

    this.client = new Groq({ apiKey });
    this.model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  }

  async evaluateResumeMatch(
    jobDescription: ParsedJobDescription,
    ragResult: RAGResult,
    resumeText: string
  ): Promise<AnalysisResult> {
    // Try progressively smaller prompt budgets if Groq rejects the request as
    // too large (HTTP 413 rate_limit_exceeded), which is common on the free tier.
    for (let i = 0; i < GroqService.PROMPT_TOKEN_BUDGETS.length; i++) {
      const tokenBudget = GroqService.PROMPT_TOKEN_BUDGETS[i];

      try {
        const prompt = this.buildBudgetedPrompt(jobDescription, ragResult, resumeText, tokenBudget);
        const estimatedTokens = Math.ceil(prompt.length / GroqService.CHARS_PER_TOKEN);
        console.log(
          `[Groq] Sending evaluation request to ${this.model} (` +
            `${estimatedTokens} tokens, budget ${tokenBudget})...`
        );

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
          temperature: 0,
          max_tokens: GroqService.MAX_OUTPUT_TOKENS,
          response_format: { type: 'json_object' },
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw) {
          throw new Error('Empty response from Groq API');
        }

        console.log('[Groq] Received response, parsing JSON...');
        return this.parseAndValidateResponse(raw, ragResult, jobDescription);
      } catch (err: unknown) {
        // If Groq rejected the request because it was too large, shrink the
        // prompt and try the next (smaller) budget before giving up.
        if (this.isRequestTooLarge(err) && i < GroqService.PROMPT_TOKEN_BUDGETS.length - 1) {
          const nextBudget = GroqService.PROMPT_TOKEN_BUDGETS[i + 1];
          console.warn(`[Groq] Request too large (or TPM rate limited); retrying with ${nextBudget}-token budget...`);
          continue;
        }

        console.error('[Groq] Error calling API:', err);
        if (err instanceof Error) {
          throw new Error(`Groq API error: ${err.message}`);
        }
        throw new Error('Unknown error from Groq API');
      }
    }

    // The loop always returns or throws; this keeps TypeScript happy.
    throw new Error('Groq API request failed after exhausting prompt budgets');
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
6. IMPORTANT — Distinguish between ACTUAL JOB REQUIREMENTS and ELIGIBILITY/ADMINISTRATIVE CRITERIA:
   - "Required Skills" means technical skills the candidate must possess (e.g., Java, Python, SDLC).
   - Eligibility criteria like degree branch names (CSE, AIML, IOT, CSBS, etc.), graduating batch year,
     minimum CGPA, "no active backlogs", work locations, and communication skills are NOT technical
     skill requirements. Do NOT list them as missing skills. Do NOT penalize the candidate for them.
   - "Preferred skills" (marked with words like "preferably") should be weighted lower than required skills.
7. Recognize equivalent terms: "SDLC" = "Software Development Life Cycle",
   "OOP" = "Object-Oriented Programming", "DSA" = "Data Structures and Algorithms".
   If the resume uses an abbreviation that matches a JD requirement (or vice versa), count it as a match.
8. Focus scoring on the ACTUAL technical requirements, responsibilities, and experience requirements
   explicitly stated in the job description — not company boilerplate or eligibility filters.

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
    // Tiny banner of the resume for the ATS-readability check only. It is
    // collapsed onto one line and hard-capped to keep the request small.
    const resumeSnippet = resumeText.trim().replace(/\s+/g, ' ').slice(0, 250);

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
  "missingSkills": ["<ONLY actual required technical skills NOT found in evidence — do NOT include eligibility criteria, branch names, or administrative requirements>"],
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
  }
}

IMPORTANT:
- The overallScore MUST equal the sum of categoryScores.
- Treat abbreviations as equivalent (SDLC = Software Development Life Cycle, OOP = Object-Oriented Programming).
- Do NOT list eligibility branch names (CSE, AIML, IOT, CSBS, Cloud Computing as a branch name, etc.) as missing skills.
- Return only valid JSON.`;
  }

  /**
   * Serializes the RAG evidence into a bounded text block. The number of
   * requirements, chunks per requirement, and per-chunk length are capped so
   * the assembled prompt stays inside Groq's free-tier TPM limit.
   */
  private buildEvidenceContext(ragResult: RAGResult, charBudget: number): string {
    const MAX_EVIDENCE = 8;
    const CHUNKS_PER_REQ = 2;
    const CHUNK_CHAR_LIMIT = 200;

    const lines: string[] = ['=== RAG-RETRIEVED RESUME EVIDENCE ==='];
    let charCount = lines[0].length;

    for (const ev of ragResult.evidence.slice(0, MAX_EVIDENCE)) {
      if (charCount >= charBudget) break;

      const header = `[Requirement: "${ev.requirement}" | Type: ${ev.requirementType}]`;
      lines.push(`\n${header}`);
      charCount += header.length;

      for (const chunk of ev.retrievedChunks.slice(0, CHUNKS_PER_REQ)) {
        if (charCount >= charBudget) break;

        const snippet = chunk.text.replace(/\s+/g, ' ').trim().slice(0, CHUNK_CHAR_LIMIT);
        const line = `  Evidence [Section: ${chunk.section}, Similarity: ${chunk.similarity.toFixed(3)}]: "${snippet}"`;
        lines.push(line);
        charCount += line.length;
      }
    }

    return lines.join('\n');
  }

  /**
   * Builds the full user prompt while keeping the input within a hard token
   * budget. The RAG evidence section is the least critical part, so it gets
   * whatever char allowance the static parts of the prompt leave over.
   */
  private buildBudgetedPrompt(
    jd: ParsedJobDescription,
    ragResult: RAGResult,
    resumeText: string,
    tokenBudget: number
  ): string {
    const targetChars = tokenBudget * GroqService.CHARS_PER_TOKEN;

    // Compute the static cost of the skeleton (JD summary + resume snippet +
    // JSON schema) so the evidence only fills the remaining space.
    const skeleton = this.buildEvaluationPrompt(jd, '', resumeText);
    const evidenceCharBudget = Math.max(800, Math.floor((targetChars - skeleton.length) * 0.9));

    const evidenceContext = this.buildEvidenceContext(ragResult, evidenceCharBudget);

    // Final safety net: if the reconstructed prompt still exceeds the budget,
    // rebuild the evidence with exactly the remaining allowance.
    if (this.buildEvaluationPrompt(jd, evidenceContext, resumeText).length > targetChars) {
      console.warn(`[Groq] Prompt exceeded budget; trimming RAG evidence to ${targetChars} chars.`);
      const trimmedContext = this.buildEvidenceContext(ragResult, Math.max(800, targetChars - skeleton.length));
      return this.buildEvaluationPrompt(jd, trimmedContext, resumeText);
    }

    return this.buildEvaluationPrompt(jd, evidenceContext, resumeText);
  }

  /**
   * Detects Groq's "Request too large" rejection (HTTP 413 rate_limit_exceeded),
   * which happens when a single request exceeds the model's TPM rate limit.
   */
  private isRequestTooLarge(err: unknown): boolean {
    if (err && typeof err === 'object') {
      const maybeErr = err as { status?: unknown; message?: string };
      if (maybeErr.status === 413) return true;
      const message = typeof maybeErr.message === 'string' ? maybeErr.message : '';
      return /request too large|rate_limit_exceeded|tokens? per minute|TPM/i.test(message);
    }
    return false;
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
