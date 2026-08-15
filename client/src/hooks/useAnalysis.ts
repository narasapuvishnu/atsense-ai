import { useState, useCallback, useRef } from 'react';
import { uploadResume, uploadJobDescription, runFullAnalysis } from '../services/api';
import {
  ResumeUploadState,
  AnalysisResult,
  AnalysisStatus,
  UploadedResume,
} from '../types';

interface UseAnalysisReturn {
  resumeState: ResumeUploadState;
  analysisStatus: AnalysisStatus;
  analysisResult: AnalysisResult | null;
  analysisError: string | null;
  currentStep: number;
  handleResumeUpload: (file: File) => Promise<void>;
  handleResumeRemove: () => void;
  handleAnalysis: (jobDescriptionText: string) => Promise<void>;
  resetAnalysis: () => void;
}

export const PIPELINE_STEPS = [
  'Resume uploaded',
  'Extracting resume content',
  'Creating semantic embeddings',
  'Indexing resume in Qdrant',
  'Analyzing job requirements',
  'Retrieving relevant resume evidence',
  'Evaluating contextual match',
  'Generating ATSense score',
];

const STEP_DURATIONS = [500, 800, 2000, 1500, 1000, 3000, 2000, 1000];

export const useAnalysis = (): UseAnalysisReturn => {
  const [resumeState, setResumeState] = useState<ResumeUploadState>({ status: 'idle' });
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeIdRef = useRef<string | null>(null);

  const advanceSteps = useCallback((fromStep: number, upToStep: number): Promise<void> => {
    return new Promise(resolve => {
      let step = fromStep;

      const advance = () => {
        if (step >= upToStep) { resolve(); return; }
        setCurrentStep(step);
        const delay = STEP_DURATIONS[step] ?? 800;
        stepTimerRef.current = setTimeout(() => {
          step++;
          advance();
        }, delay);
      };

      advance();
    });
  }, []);

  const handleResumeUpload = useCallback(async (file: File): Promise<void> => {
    setResumeState({ status: 'uploading', progress: 0 });
    setAnalysisError(null);

    try {
      const res = await uploadResume(file, pct => {
        setResumeState({ status: 'uploading', progress: pct });
      });

      const uploaded: UploadedResume = {
        documentId: res.documentId,
        filename: res.metadata.filename,
        fileType: res.metadata.fileType as 'pdf' | 'docx',
        fileSize: res.metadata.fileSize,
        mimeType: res.metadata.mimeType,
        pageCount: res.metadata.pageCount,
        chunksCreated: res.metadata.chunksCreated,
        sections: res.metadata.sections,
        uploadedAt: new Date(),
      };

      resumeIdRef.current = res.documentId;
      setResumeState({ status: 'success', resume: uploaded });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setResumeState({ status: 'error', message: msg });
    }
  }, [advanceSteps]);

  const handleResumeRemove = useCallback(() => {
    resumeIdRef.current = null;
    setResumeState({ status: 'idle' });
    setAnalysisResult(null);
    setAnalysisStatus('idle');
    setAnalysisError(null);
    setCurrentStep(-1);
  }, []);

  const handleAnalysis = useCallback(async (jobDescriptionText: string): Promise<void> => {
    if (!resumeIdRef.current) {
      setAnalysisError('Please upload your resume first.');
      return;
    }

    setAnalysisStatus('starting');
    setAnalysisResult(null);
    setAnalysisError(null);
    setCurrentStep(0);

    try {
      // Animate through upload/extract/embed/index steps while API runs
      const stepPromise = advanceSteps(0, 4);

      const [, apiRes] = await Promise.all([
        stepPromise,
        runFullAnalysis(
          resumeIdRef.current,
          jobDescriptionText,
          () => setAnalysisStatus('processing')
        ),
      ]);

      setAnalysisStatus('processing');

      // Animate remaining steps
      await advanceSteps(4, PIPELINE_STEPS.length);
      setCurrentStep(PIPELINE_STEPS.length);

      if (apiRes.result) {
        setAnalysisResult(apiRes.result as AnalysisResult);
        setAnalysisStatus('completed');
      } else {
        throw new Error('No result returned from analysis.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed.';
      setAnalysisError(msg);
      setAnalysisStatus('error');
      setCurrentStep(-1);
    }
  }, [advanceSteps]);

  const resetAnalysis = useCallback(() => {
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    setAnalysisStatus('idle');
    setAnalysisResult(null);
    setAnalysisError(null);
    setCurrentStep(-1);
  }, []);

  return {
    resumeState,
    analysisStatus,
    analysisResult,
    analysisError,
    currentStep,
    handleResumeUpload,
    handleResumeRemove,
    handleAnalysis,
    resetAnalysis,
  };
};
