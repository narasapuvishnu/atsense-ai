import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { StartAnalysisRequestSchema } from '../schemas/analysis.schema';
import { JobAnalyzerService } from '../services/jobAnalyzer.service';
import { RAGService } from '../services/rag.service';
import { GroqService } from '../services/groq.service';
import { ATSScoringService } from '../services/atsScoring.service';
import { QdrantService } from '../services/qdrant.service';
import { ResumeParserService } from '../services/resumeParser.service';

const jobAnalyzer = new JobAnalyzerService();
const ragService = new RAGService();
const groqService = new GroqService();
const atsScoringService = new ATSScoringService();
const qdrantService = QdrantService.getInstance();
const resumeParser = new ResumeParserService();

// In-memory store for analysis results (use Redis/DB in production)
const analysisStore = new Map<string, { status: string; result?: unknown; error?: string; createdAt: Date }>();

export const startAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate request
    const validation = StartAnalysisRequestSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { resumeId, jobDescriptionText } = validation.data;

    // Verify document exists in Qdrant
    const chunkCount = await qdrantService.countDocumentChunks(resumeId);
    if (chunkCount === 0) {
      res.status(404).json({
        success: false,
        error: 'Resume not found. Please upload your resume first.',
      });
      return;
    }

    const analysisId = uuidv4();
    analysisStore.set(analysisId, { status: 'processing', createdAt: new Date() });

    // Return immediately with analysisId, process async
    res.status(202).json({
      success: true,
      analysisId,
      message: 'Analysis started. Use the analysisId to poll for results.',
    });

    // Run pipeline asynchronously
    runAnalysisPipeline(analysisId, resumeId, jobDescriptionText).catch(err => {
      console.error(`[Analysis] Pipeline error for ${analysisId}:`, err);
      analysisStore.set(analysisId, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Analysis failed',
        createdAt: new Date(),
      });
    });
  } catch (err) {
    next(err);
  }
};

export const getAnalysisResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { analysisId } = req.params;

    if (!analysisId) {
      res.status(400).json({ success: false, error: 'Analysis ID is required' });
      return;
    }

    const record = analysisStore.get(analysisId);

    if (!record) {
      res.status(404).json({ success: false, error: 'Analysis not found. It may have expired.' });
      return;
    }

    if (record.status === 'processing') {
      res.json({ success: true, status: 'processing', message: 'Analysis is in progress...' });
      return;
    }

    if (record.status === 'error') {
      res.status(500).json({ success: false, status: 'error', error: record.error });
      return;
    }

    res.json({
      success: true,
      status: 'completed',
      result: record.result,
    });
  } catch (err) {
    next(err);
  }
};

async function runAnalysisPipeline(
  analysisId: string,
  resumeId: string,
  jobDescriptionText: string
): Promise<void> {
  console.log(`\n[Analysis] Starting pipeline for analysisId: ${analysisId}`);

  // Step 1: Parse job description
  console.log('[Analysis] Step 1: Parsing job description...');
  const jobDescription = jobAnalyzer.parseJobDescription(jobDescriptionText);

  // Step 2: RAG retrieval
  console.log('[Analysis] Step 2: Running RAG retrieval...');
  const topK = parseInt(process.env.TOP_K || '5', 10);
  const ragResult = await ragService.retrieveEvidenceForRequirements(
    resumeId,
    jobDescription.allRequirements,
    topK
  );

  // Step 3: Groq LLM evaluation
  console.log('[Analysis] Step 3: Calling Groq LLM...');
  let analysisResult = await groqService.evaluateResumeMatch(
    jobDescription,
    ragResult,
    jobDescriptionText
  );

  // Step 4: Validate and normalize category scores
  analysisResult = atsScoringService.validateCategoryScores(analysisResult);

  // Inject RAG insights
  analysisResult.ragInsights = {
    totalChunksIndexed: ragResult.totalChunksIndexed,
    chunksRetrieved: ragResult.chunksRetrieved,
    topSimilarity: ragResult.topSimilarity,
    averageSimilarity: ragResult.averageSimilarity,
    embeddingModel: 'all-MiniLM-L6-v2',
    vectorDatabase: 'Qdrant',
    topK: ragResult.topK,
  };

  // Also attach the raw RAG evidence for the front-end display
  const enrichedResult = {
    ...analysisResult,
    _ragEvidence: ragResult.evidence.map(ev => ({
      requirement: ev.requirement,
      requirementType: ev.requirementType,
      topSimilarity: ev.topSimilarity,
      averageSimilarity: ev.averageSimilarity,
      chunks: ev.retrievedChunks.map(c => ({
        text: c.text,
        section: c.section,
        similarity: c.similarity,
      })),
    })),
    categoryPercentages: atsScoringService.getCategoryPercentages(analysisResult.categoryScores),
    scoreBreakdown: atsScoringService.getScoreBreakdown(analysisResult.overallScore),
  };

  analysisStore.set(analysisId, {
    status: 'completed',
    result: enrichedResult,
    createdAt: new Date(),
  });

  console.log(`[Analysis] Pipeline complete. Score: ${analysisResult.overallScore} - ${analysisResult.matchLevel}\n`);
}
