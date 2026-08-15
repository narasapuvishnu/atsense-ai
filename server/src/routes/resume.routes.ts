import { Router } from 'express';
import { uploadResume as uploadMiddleware } from '../middleware/upload';
import { uploadResume } from '../controllers/resume.controller';

export const resumeRouter = Router();

resumeRouter.post('/upload', (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return next(err);
    }
    return uploadResume(req, res, next);
  });
});
