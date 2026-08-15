import { Router } from 'express';
import { uploadJobDescription as uploadJDMiddleware } from '../middleware/upload';
import { processJobDescriptionText, processJobDescriptionFile } from '../controllers/jobDescription.controller';

export const jobDescriptionRouter = Router();

jobDescriptionRouter.post('/process', processJobDescriptionText);

jobDescriptionRouter.post('/upload', (req, res, next) => {
  uploadJDMiddleware(req, res, (err) => {
    if (err) return next(err);
    return processJobDescriptionFile(req, res, next);
  });
});
