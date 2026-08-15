import axios, { AxiosError } from 'axios';
import {
  ResumeUploadResponse,
  StartAnalysisResponse,
  AnalysisStatusResponse,
} from '../types';

const BASE_URL = '/api';
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 80; // ~3.3 min

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// --- Error normalizer ---
const normalizeError = (err: unknown): string => {
  if (err instanceof AxiosError) {
    const serverMsg = err.response?.data?.error || err.response?.data?.message;
    if (serverMsg) return serverMsg;
    if (err.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
    if (err.code === 'ERR_NETWORK') return 'Cannot reach the server. Make sure the backend is running.';
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
};

// --- Health ---
export const checkHealth = async (): Promise<boolean> => {
  try {
    const res = await client.get('/health');
    return res.data?.status === 'healthy';
  } catch {
    return false;
  }
};

// --- Resume Upload ---
export const uploadResume = async (
  file: File,
  onProgress?: (pct: number) => void
): Promise<ResumeUploadResponse> => {
  const form = new FormData();
  form.append('resume', file);

  try {
    const res = await client.post<ResumeUploadResponse>('/resume/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
      onUploadProgress: e => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });
    return res.data;
  } catch (err) {
    throw new Error(normalizeError(err));
  }
};

// --- Job Description (file upload) ---
export const uploadJobDescription = async (file: File): Promise<{ extractedText: string }> => {
  const form = new FormData();
  form.append('jobDescription', file);

  try {
    const res = await client.post('/job-description/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return { extractedText: res.data.extractedText ?? '' };
  } catch (err) {
    throw new Error(normalizeError(err));
  }
};

// --- Start Analysis ---
export const startAnalysis = async (
  resumeId: string,
  jobDescriptionText: string
): Promise<StartAnalysisResponse> => {
  try {
    const res = await client.post<StartAnalysisResponse>('/analysis/start', {
      resumeId,
      jobDescriptionText,
    });
    return res.data;
  } catch (err) {
    throw new Error(normalizeError(err));
  }
};

// --- Poll Analysis Result ---
export const pollAnalysisResult = async (
  analysisId: string,
  onStatusUpdate?: (msg: string) => void
): Promise<AnalysisStatusResponse> => {
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      attempts++;

      if (attempts > MAX_POLL_ATTEMPTS) {
        reject(new Error('Analysis timed out. The server may be busy. Please try again.'));
        return;
      }

      try {
        const res = await client.get<AnalysisStatusResponse>(`/analysis/${analysisId}`);
        const data = res.data;

        if (data.status === 'completed') {
          resolve(data);
          return;
        }

        if (data.status === 'error') {
          reject(new Error(data.error ?? 'Analysis failed on the server.'));
          return;
        }

        // Still processing
        if (onStatusUpdate && data.message) {
          onStatusUpdate(data.message);
        }

        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        reject(new Error(normalizeError(err)));
      }
    };

    poll();
  });
};

// --- Full pipeline convenience function ---
export const runFullAnalysis = async (
  resumeId: string,
  jobDescriptionText: string,
  onStatusUpdate?: (msg: string) => void
): Promise<AnalysisStatusResponse> => {
  const startRes = await startAnalysis(resumeId, jobDescriptionText);
  return pollAnalysisResult(startRes.analysisId, onStatusUpdate);
};
