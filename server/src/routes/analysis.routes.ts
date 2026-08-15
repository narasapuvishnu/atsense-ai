import { Router } from 'express';
import { startAnalysis, getAnalysisResult } from '../controllers/analysis.controller';

export const analysisRouter = Router();

analysisRouter.post('/start', startAnalysis);
analysisRouter.get('/:analysisId', getAnalysisResult);
