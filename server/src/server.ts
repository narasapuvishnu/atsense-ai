import './env';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import { resumeRouter } from './routes/resume.routes';
import { jobDescriptionRouter } from './routes/jobDescription.routes';
import { analysisRouter } from './routes/analysis.routes';
import { healthRouter } from './routes/health.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/job-description', jobDescriptionRouter);
app.use('/api/analysis', analysisRouter);

// ── Serve the built React frontend (client/dist) ────────────────────────────
// Resolved relative to this file so it works regardless of the current working
// directory (ts-node dev runs from server/src, production runs from
// server/dist — both resolve ../../client/dist to the repo's client folder).
const CLIENT_DIST_PATH = path.resolve(__dirname, '../../client/dist');
const clientIndexFile = path.join(CLIENT_DIST_PATH, 'index.html');

app.use(express.static(CLIENT_DIST_PATH));

// SPA fallback: every non-/api GET (e.g. React Router paths like /analyzer)
// returns index.html so client-side routing works. Unmatched /api/* requests
// still fall through to the JSON 404 handler below, keeping the API contract.
app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
  if (existsSync(clientIndexFile)) {
    res.sendFile(clientIndexFile);
  } else {
    res.status(404).json({
      success: false,
      error: 'Frontend build not found.',
      message: 'client/dist/index.html does not exist. Run the client build first.',
    });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: 'The requested endpoint does not exist.',
  });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 ATSense Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Groq Model: ${process.env.GROQ_MODEL || 'not set'}`);
  console.log(`   Qdrant URL: ${process.env.QDRANT_URL || 'not set'}\n`);
});

export default app;
