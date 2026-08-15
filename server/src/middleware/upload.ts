import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { createError } from './errorHandler';

const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_JD_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

const resumeFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.docx'];

  if (ALLOWED_RESUME_TYPES.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(createError('Invalid file type. Only PDF and DOCX files are supported for resumes.', 400));
  }
};

const jdFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.docx', '.txt'];

  if (ALLOWED_JD_TYPES.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(createError('Invalid file type. Only PDF, DOCX, and TXT files are supported for job descriptions.', 400));
  }
};

export const uploadResume = multer({
  storage,
  fileFilter: resumeFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('resume');

export const uploadJobDescription = multer({
  storage,
  fileFilter: jdFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('jobDescription');
