import { z } from 'zod';

export const CategoryScoresSchema = z.object({
  requiredSkills: z.number().min(0).max(30),
  experience: z.number().min(0).max(20),
  responsibilities: z.number().min(0).max(15),
  technicalKeywords: z.number().min(0).max(15),
  projects: z.number().min(0).max(10),
  education: z.number().min(0).max(5),
  atsReadability: z.number().min(0).max(5),
});

export const EvidenceItemSchema = z.object({
  requirement: z.string(),
  matchScore: z.number().min(0).max(100),
  status: z.enum(['strong_match', 'moderate_match', 'weak_match', 'not_found']),
  resumeEvidence: z.array(z.string()),
  sourceSection: z.string(),
  similarity: z.number().min(0).max(1),
});

export const AnalysisResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  matchLevel: z.enum([
    'Exceptional Match',
    'Strong Match',
    'Good Match',
    'Moderate Match',
    'Weak Match',
    'Low Match',
  ]),
  summary: z.string(),
  categoryScores: CategoryScoresSchema,
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  evidence: z.array(EvidenceItemSchema),
  atsReadabilityDetails: z.object({
    score: z.number().min(0).max(100),
    hasContactInfo: z.boolean(),
    hasClearSections: z.boolean(),
    hasConsistentFormatting: z.boolean(),
    hasVisibleSkills: z.boolean(),
    issues: z.array(z.string()),
    explanation: z.string(),
  }).optional(),
  keywordAnalysis: z.object({
    matched: z.array(z.string()),
    missing: z.array(z.string()),
    suggested: z.array(z.string()),
  }).optional(),
  ragInsights: z.object({
    totalChunksIndexed: z.number(),
    chunksRetrieved: z.number(),
    topSimilarity: z.number(),
    averageSimilarity: z.number(),
    embeddingModel: z.string(),
    vectorDatabase: z.string(),
    topK: z.number(),
  }).optional(),
});

export const StartAnalysisRequestSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  jobDescriptionText: z.string().min(10, 'Job description must be at least 10 characters'),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type CategoryScores = z.infer<typeof CategoryScoresSchema>;
export type StartAnalysisRequest = z.infer<typeof StartAnalysisRequestSchema>;
