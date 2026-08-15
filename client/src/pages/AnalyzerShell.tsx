import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAnalysis } from '../hooks/useAnalysis';
import { AnalysisResult } from '../types';
import ResumeUpload from '../components/ResumeUpload';
import JobDescription from '../components/JobDescription';
import AnalysisPipeline from '../components/AnalysisPipeline';
import ResultsDashboard from './ResultsDashboard';
import Footer from '../components/Footer';

type ViewState = 'analyzer' | 'pipeline' | 'results';

const pageVariants = {
  enter:  { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit:   { opacity: 0, y: -16 },
};

const AnalyzerShell = () => {
  const [view, setView]               = useState<ViewState>('analyzer');
  const [frozenResult, setFrozenResult] = useState<AnalysisResult | null>(null);
  const [jobDescText, setJobDescText] = useState('');
  const [jdError, setJdError]         = useState('');
  const [submitted, setSubmitted]     = useState(false);

  const {
    resumeState,
    analysisStatus,
    analysisResult,
    analysisError,
    currentStep,
    handleResumeUpload,
    handleResumeRemove,
    handleAnalysis,
    resetAnalysis,
  } = useAnalysis();

  const resumeReady = resumeState.status === 'success';
  const jdReady     = jobDescText.trim().length >= 50;
  const isProcessing = analysisStatus === 'starting' || analysisStatus === 'processing';

  // Transition to results when analysis completes
  if (analysisStatus === 'completed' && analysisResult && view === 'pipeline') {
    setFrozenResult(analysisResult as AnalysisResult);
    setView('results');
  }

  const handleSubmit = useCallback(async () => {
    setSubmitted(true);
    setJdError('');

    if (!resumeReady) return;
    if (!jdReady) {
      setJdError('Please provide a job description (minimum 50 characters).');
      return;
    }

    setView('pipeline');
    await handleAnalysis(jobDescText);
  }, [resumeReady, jdReady, jobDescText, handleAnalysis]);

  const handleReset = useCallback(() => {
    resetAnalysis();
    setFrozenResult(null);
    setJobDescText('');
    setJdError('');
    setSubmitted(false);
    setView('analyzer');
  }, [resetAnalysis]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Skip link */}
      <a
        href="#analyzer-main"
        style={{
          position: 'absolute', top: -40, left: 8, zIndex: 9999,
          padding: '0.4rem 1rem', background: 'var(--at-indigo)', color: '#fff',
          borderRadius: 'var(--at-radius)', fontWeight: 600, fontSize: '0.875rem',
          transition: 'top 0.2s',
        }}
        onFocus={e => { (e.currentTarget as HTMLAnchorElement).style.top = '8px'; }}
        onBlur={e  => { (e.currentTarget as HTMLAnchorElement).style.top = '-40px'; }}
      >
        Skip to content
      </a>

      <main id="analyzer-main" style={{ flex: 1, paddingTop: '90px', paddingBottom: '80px' }}>
        <div className="container">
          <AnimatePresence mode="wait">

            {/* ══════════════════ ANALYZER FORM ══════════════════ */}
            {view === 'analyzer' && (
              <motion.div key="analyzer" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}>

                {/* Header */}
                <div className="text-center mb-5">
                  <div className="at-section-label justify-content-center mb-2">
                    <i className="bi bi-lightning-fill" />
                    ATSense Analyzer
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
                    AI-Powered{' '}
                    <span style={{ background: 'var(--at-gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      Resume Analysis
                    </span>
                  </h1>
                  <p style={{ color: 'var(--at-text-secondary)', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
                    Upload your resume and paste the job description. ATSense runs a full RAG pipeline to evaluate your match.
                  </p>
                </div>

                {/* Step indicators */}
                <div className="d-flex justify-content-center gap-2 mb-5" role="list" aria-label="Steps">
                  {[
                    { num: 1, label: 'Upload Resume',        done: resumeReady },
                    { num: 2, label: 'Add Job Description',  done: jdReady },
                    { num: 3, label: 'Get ATS Score',         done: false },
                  ].map((step, idx) => (
                    <div key={step.num} className="d-flex align-items-center gap-2" role="listitem">
                      <div
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: step.done ? 'var(--at-success)' : 'rgba(255,255,255,0.06)',
                          border: step.done ? 'none' : '1px solid var(--at-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 700,
                          color: step.done ? '#fff' : 'var(--at-text-muted)',
                          transition: 'all var(--at-transition)',
                        }}
                        aria-label={`Step ${step.num}: ${step.label}${step.done ? ' — complete' : ''}`}
                      >
                        {step.done ? <i className="bi bi-check2" aria-hidden="true" /> : step.num}
                      </div>
                      <span
                        className="d-none d-sm-inline"
                        style={{ fontSize: '0.78rem', fontWeight: 600, color: step.done ? 'var(--at-success-light)' : 'var(--at-text-muted)', transition: 'color var(--at-transition)' }}
                      >
                        {step.label}
                      </span>
                      {idx < 2 && <div style={{ width: 28, height: 1, background: step.done ? 'var(--at-success)' : 'var(--at-border)', opacity: 0.5 }} aria-hidden="true" />}
                    </div>
                  ))}
                </div>

                {/* Two-column grid */}
                <div className="analyzer-grid">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
                    <div className="at-card h-100" style={{ minHeight: 380 }}>
                      <ResumeUpload uploadState={resumeState} onFile={handleResumeUpload} onRemove={handleResumeRemove} />
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.2 }}>
                    <div className="at-card h-100" style={{ minHeight: 380 }}>
                      <JobDescription value={jobDescText} onChange={setJobDescText} error={submitted && !jdReady ? jdError : undefined} />
                    </div>
                  </motion.div>
                </div>

                {/* Validation messages */}
                <AnimatePresence>
                  {analysisError && (
                    <motion.div key="err" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="alert alert-danger mt-4 d-flex align-items-start gap-3" role="alert">
                      <i className="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1" aria-hidden="true" />
                      <div><strong>Analysis failed</strong><div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{analysisError}</div></div>
                    </motion.div>
                  )}
                  {submitted && !resumeReady && (
                    <motion.div key="no-resume" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="alert alert-warning mt-4 d-flex align-items-center gap-2" role="alert">
                      <i className="bi bi-exclamation-circle" aria-hidden="true" />
                      Please upload your resume before running analysis.
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <motion.div className="text-center mt-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.35 }}>
                  <button
                    className="btn-at-analyze"
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    aria-label={isProcessing ? 'Analysis in progress' : 'Get ATS Score'}
                    aria-busy={isProcessing}
                  >
                    {isProcessing ? (
                      <><span className="at-spinner at-spinner-sm me-2" style={{ borderTopColor: '#fff' }} aria-hidden="true" />Analyzing Resume…</>
                    ) : (
                      <><i className="bi bi-lightning-fill me-2" aria-hidden="true" />Get ATS Score<i className="bi bi-arrow-right ms-2" aria-hidden="true" /></>
                    )}
                  </button>

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

                  <p style={{ fontSize: '0.72rem', color: 'var(--at-text-muted)', maxWidth: 520, margin: '1.25rem auto 0', lineHeight: 1.6 }}>
                    <i className="bi bi-info-circle me-1" aria-hidden="true" />
                    ATSense provides an AI-estimated ATS compatibility score. Actual ATS scoring may vary between employers and recruitment systems.
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* ══════════════════ PIPELINE ANIMATION ══════════════════ */}
            {view === 'pipeline' && (
              <motion.div key="pipeline" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }} style={{ paddingTop: '2rem' }}>
                <AnalysisPipeline
                  currentStep={currentStep}
                  error={analysisStatus === 'error' ? analysisError : null}
                />
                {analysisStatus === 'error' && (
                  <div className="text-center mt-4">
                    <button className="btn-at-secondary" onClick={handleReset} aria-label="Return to analyzer">
                      <i className="bi bi-arrow-left me-2" aria-hidden="true" />
                      Back to Analyzer
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════ RESULTS DASHBOARD ══════════════════ */}
            {view === 'results' && frozenResult && (
              <motion.div key="results" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
                <ResultsDashboard result={frozenResult} onReset={handleReset} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnalyzerShell;
