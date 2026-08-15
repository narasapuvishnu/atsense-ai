import { motion, AnimatePresence } from 'framer-motion';
import { PIPELINE_STEPS } from '../hooks/useAnalysis';

interface AnalysisPipelineProps {
  currentStep: number;
  error?: string | null;
}

const AnalysisPipeline = ({ currentStep, error }: AnalysisPipelineProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
      className="pipeline-container"
      style={{
        maxWidth: 540,
        margin: '0 auto',
        padding: '2.5rem 2rem',
        background: 'var(--at-bg-elevated)',
        border: '1px solid var(--at-border)',
        borderRadius: 'var(--at-radius-xl)',
        boxShadow: 'var(--at-shadow-lg)',
      }}
      role="status"
      aria-live="polite"
      aria-label="Analysis pipeline progress"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(99,102,241,0.1)',
            border: '2px solid transparent',
            borderTopColor: 'var(--at-indigo)',
            borderRightColor: 'var(--at-cyan)',
            margin: '0 auto 1.25rem',
          }}
          aria-hidden="true"
        />
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--at-text-primary)',
            marginBottom: '0.4rem',
            letterSpacing: '-0.02em',
          }}
        >
          Analyzing Your Resume
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--at-text-muted)', margin: 0 }}>
          Running the full RAG pipeline…
        </p>
      </div>

      {/* Pipeline steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {PIPELINE_STEPS.map((label, idx) => {
          const isCompleted = idx < currentStep;
          const isActive    = idx === currentStep;
          const isPending   = idx > currentStep;

          return (
            <div key={label}>
              <motion.div
                className="pipeline-step-card"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--at-radius)',
                  background: isActive
                    ? 'rgba(99,102,241,0.08)'
                    : isCompleted
                    ? 'rgba(34,197,94,0.04)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(99,102,241,0.3)'
                    : isCompleted
                    ? '1px solid rgba(34,197,94,0.15)'
                    : '1px solid transparent',
                  transition: 'all 0.3s ease',
                }}
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Step icon */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    ...(isCompleted ? {
                      background: 'var(--at-success)',
                      boxShadow: '0 0 8px rgba(34,197,94,0.4)',
                    } : isActive ? {
                      background: 'rgba(99,102,241,0.2)',
                      border: '2px solid var(--at-indigo)',
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--at-border)',
                    }),
                  }}
                  aria-hidden="true"
                >
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.i
                        key="check"
                        className="bi bi-check2"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.25, type: 'spring', stiffness: 300 }}
                        style={{ fontSize: '0.8rem', color: '#fff' }}
                      />
                    ) : isActive ? (
                      <motion.div
                        key="spinner"
                        style={{
                          width: 14,
                          height: 14,
                          border: '2px solid rgba(99,102,241,0.3)',
                          borderTopColor: 'var(--at-indigo)',
                          borderRadius: '50%',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <motion.div
                        key="dot"
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--at-text-muted)',
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Step label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                      color: isCompleted
                        ? 'var(--at-success-light)'
                        : isActive
                        ? 'var(--at-text-primary)'
                        : 'var(--at-text-muted)',
                      transition: 'color 0.3s ease',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </span>

                  {/* Active pulse text */}
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--at-indigo-light)',
                        display: 'block',
                        marginTop: '0.1rem',
                      }}
                    >
                      In progress…
                    </motion.span>
                  )}
                </div>

                {/* Right status */}
                <div style={{ flexShrink: 0 }}>
                  {isCompleted && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="at-badge at-badge-success"
                      style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}
                      aria-label="Completed"
                    >
                      Done
                    </motion.span>
                  )}
                  {isPending && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--at-text-muted)',
                        opacity: 0.5,
                        fontFamily: 'var(--at-font-mono)',
                      }}
                      aria-label="Pending"
                    >
                      ○
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Connector line */}
              {idx < PIPELINE_STEPS.length - 1 && (
                <div
                  style={{ height: 6, display: 'flex', paddingLeft: '1.85rem' }}
                  aria-hidden="true"
                >
                  <div
                    style={{
                      width: 2,
                      height: '100%',
                      background: isCompleted
                        ? 'var(--at-success)'
                        : 'rgba(255,255,255,0.06)',
                      borderRadius: 'var(--at-radius-full)',
                      transition: 'background 0.4s ease',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span style={{ fontSize: '0.75rem', color: 'var(--at-text-muted)' }}>
            Overall Progress
          </span>
          <span
            style={{ fontSize: '0.75rem', fontFamily: 'var(--at-font-mono)', color: 'var(--at-indigo-light)' }}
            aria-label={`${Math.round((Math.max(0, currentStep) / PIPELINE_STEPS.length) * 100)}% complete`}
          >
            {Math.round((Math.max(0, currentStep) / PIPELINE_STEPS.length) * 100)}%
          </span>
        </div>
        <div className="at-progress" role="progressbar" aria-valuenow={Math.round((Math.max(0, currentStep) / PIPELINE_STEPS.length) * 100)} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="at-progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${Math.round((Math.max(0, currentStep) / PIPELINE_STEPS.length) * 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="alert alert-danger mt-3 mb-0 d-flex gap-2 align-items-start"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1" aria-hidden="true" />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Analysis failed</strong>
              <span style={{ fontSize: '0.875rem' }}>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer note */}
      <p
        style={{
          fontSize: '0.72rem',
          color: 'var(--at-text-muted)',
          textAlign: 'center',
          marginTop: '1.25rem',
          marginBottom: 0,
          lineHeight: 1.5,
        }}
      >
        <i className="bi bi-cpu me-1" style={{ color: 'var(--at-indigo-light)' }} aria-hidden="true" />
        Generating semantic embeddings with Transformers.js · Retrieving evidence from Qdrant · Evaluating with Groq LLM
      </p>
    </motion.div>
  );
};

export default AnalysisPipeline;
