import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResumeUpload from '../components/ResumeUpload';
import JobDescription from '../components/JobDescription';
import { useAnalysis } from '../hooks/useAnalysis';

interface AnalyzerPageProps {
  onResultsReady: () => void;
}

const AnalyzerPage = ({ onResultsReady }: AnalyzerPageProps) => {
  const [jobDescText, setJobDescText] = useState('');
  const [jdError, setJdError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const {
    resumeState,
    analysisStatus,
    analysisError,
    handleResumeUpload,
    handleResumeRemove,
    handleAnalysis,
  } = useAnalysis();

  const resumeReady = resumeState.status === 'success';
  const jdReady = jobDescText.trim().length >= 50;
  const canAnalyze = resumeReady && jdReady && analysisStatus === 'idle';

  const handleSubmit = useCallback(async () => {
    setSubmitted(true);
    setJdError('');

    if (!resumeReady) return;

    if (!jdReady) {
      setJdError('Please provide a job description (minimum 50 characters).');
      return;
    }

    await handleAnalysis(jobDescText);
    onResultsReady();
  }, [resumeReady, jdReady, jobDescText, handleAnalysis, onResultsReady]);

  const isProcessing = analysisStatus === 'starting' || analysisStatus === 'processing';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page header */}
      <div className="text-center mb-5">
        <div className="at-section-label justify-content-center mb-2">
          <i className="bi bi-lightning-fill" />
          ATSense Analyzer
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: 'var(--at-text-primary)',
            marginBottom: '0.75rem',
          }}
        >
          AI-Powered{' '}
          <span
            style={{
              background: 'var(--at-gradient-brand)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Resume Analysis
          </span>
        </h1>
        <p style={{ color: 'var(--at-text-secondary)', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
          Upload your resume and paste the job description. ATSense will run a full RAG pipeline to evaluate your match.
        </p>
      </div>

      {/* Step indicators */}
      <div className="d-flex justify-content-center gap-2 mb-5">
        {[
          { num: 1, label: 'Upload Resume',     done: resumeReady },
          { num: 2, label: 'Add Job Description', done: jdReady },
          { num: 3, label: 'Get ATS Score',     done: analysisStatus === 'completed' },
        ].map((step, idx) => (
          <div key={step.num} className="d-flex align-items-center gap-2">
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: step.done
                  ? 'var(--at-success)'
                  : idx === 0 || (idx === 1 && resumeReady)
                  ? 'var(--at-gradient-primary)'
                  : 'rgba(255,255,255,0.06)',
                border: step.done
                  ? 'none'
                  : '1px solid var(--at-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: step.done ? '#fff' : 'var(--at-text-muted)',
                flexShrink: 0,
                transition: 'all var(--at-transition)',
              }}
              aria-label={`Step ${step.num}: ${step.label}${step.done ? ' (complete)' : ''}`}
            >
              {step.done ? <i className="bi bi-check2" /> : step.num}
            </div>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: step.done ? 'var(--at-success-light)' : 'var(--at-text-muted)',
                transition: 'color var(--at-transition)',
                display: window.innerWidth < 480 ? 'none' : 'inline',
              }}
            >
              {step.label}
            </span>
            {idx < 2 && (
              <div
                style={{
                  width: 32,
                  height: 1,
                  background: step.done ? 'var(--at-success)' : 'var(--at-border)',
                  transition: 'background var(--at-transition)',
                  opacity: 0.5,
                }}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      {/* Main two-column grid */}
      <div className="analyzer-grid">
        {/* Left — Resume Upload */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className="at-card h-100" style={{ minHeight: 380 }}>
            <ResumeUpload
              uploadState={resumeState}
              onFile={handleResumeUpload}
              onRemove={handleResumeRemove}
            />
          </div>
        </motion.div>

        {/* Right — Job Description */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <div className="at-card h-100" style={{ minHeight: 380 }}>
            <JobDescription
              value={jobDescText}
              onChange={setJobDescText}
              error={submitted && !jdReady ? jdError : undefined}
            />
          </div>
        </motion.div>
      </div>

      {/* Analysis error */}
      <AnimatePresence>
        {analysisError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="alert alert-danger mt-4 d-flex align-items-start gap-3"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1" />
            <div>
              <strong>Analysis failed</strong>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{analysisError}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation hint when submitted without resume */}
      <AnimatePresence>
        {submitted && !resumeReady && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="alert alert-warning mt-4 d-flex align-items-center gap-2"
            role="alert"
          >
            <i className="bi bi-exclamation-circle" />
            Please upload your resume before running analysis.
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Button */}
      <motion.div
        className="text-center mt-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
      >
        <button
          className="btn-at-analyze"
          onClick={handleSubmit}
          disabled={isProcessing}
          aria-label={isProcessing ? 'Analysis in progress' : 'Get ATS Score'}
          aria-busy={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="at-spinner at-spinner-sm me-2" style={{ borderTopColor: '#fff' }} aria-hidden="true" />
              Analyzing Resume…
            </>
          ) : (
            <>
              <i className="bi bi-lightning-fill me-2" aria-hidden="true" />
              Get ATS Score
              <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
            </>
          )}
        </button>

        {/* Readiness indicators */}
        <div className="d-flex justify-content-center gap-3 mt-3">
          <span style={{ fontSize: '0.78rem', color: resumeReady ? 'var(--at-success)' : 'var(--at-text-muted)' }}>
            <i className={`bi ${resumeReady ? 'bi-check2-circle' : 'bi-circle'} me-1`} aria-hidden="true" />
            Resume
          </span>
          <span style={{ fontSize: '0.78rem', color: jdReady ? 'var(--at-success)' : 'var(--at-text-muted)' }}>
            <i className={`bi ${jdReady ? 'bi-check2-circle' : 'bi-circle'} me-1`} aria-hidden="true" />
            Job Description
          </span>
        </div>

        {/* Disclaimer */}
        <p
          style={{
            fontSize: '0.72rem',
            color: 'var(--at-text-muted)',
            maxWidth: 520,
            margin: '1.25rem auto 0',
            lineHeight: 1.6,
          }}
        >
          <i className="bi bi-info-circle me-1" aria-hidden="true" />
          ATSense provides an AI-estimated ATS compatibility score. Actual ATS scoring may vary between employers and recruitment systems.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AnalyzerPage;
