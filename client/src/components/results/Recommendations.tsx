import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AnalysisResult } from '../../types';

interface RecommendationsProps {
  result: AnalysisResult;
}

const Recommendations = ({ result }: RecommendationsProps) => {
  const { recommendations, atsReadabilityDetails } = result;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden:  { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
  };

  return (
    <div ref={ref}>
      {/* Recommendations */}
      <div className="mb-4">
        <div className="at-section-label mb-3">
          <i className="bi bi-lightbulb-fill" />
          Recommendations
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--at-text-primary)', marginBottom: '0.4rem' }}>
          How to Improve Your Resume
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--at-text-muted)', marginBottom: '1.25rem' }}>
          Personalized suggestions based on the AI analysis of your resume against this job description.
        </p>

        {recommendations.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
            role="list"
            aria-label="Resume improvement recommendations"
          >
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                role="listitem"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '0.9rem 1.1rem',
                  background: 'rgba(99,102,241,0.05)',
                  border: '1px solid rgba(99,102,241,0.12)',
                  borderRadius: 'var(--at-radius-md)',
                  transition: 'border-color var(--at-transition-fast)',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: 'var(--at-indigo-light)',
                    flexShrink: 0,
                    marginTop: '0.1rem',
                    fontFamily: 'var(--at-font-mono)',
                  }}
                  aria-hidden="true"
                >
                  {idx + 1}
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--at-text-secondary)', lineHeight: 1.6 }}>
                  {rec}
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="at-card text-center" style={{ padding: '1.5rem', color: 'var(--at-text-muted)', fontSize: '0.875rem' }}>
            <i className="bi bi-check2-all d-block mb-2" style={{ fontSize: '1.5rem', color: 'var(--at-success)' }} />
            Your resume looks well-aligned. No specific recommendations at this time.
          </div>
        )}
      </div>

      {/* ATS Readability Panel */}
      {atsReadabilityDetails && (
        <div>
          <div className="at-section-label mb-3">
            <i className="bi bi-eye-fill" />
            ATS Readability
          </div>

          <div
            className="at-card"
            style={{
              background: atsReadabilityDetails.score >= 70
                ? 'rgba(34,197,94,0.04)'
                : atsReadabilityDetails.score >= 50
                ? 'rgba(245,158,11,0.04)'
                : 'rgba(239,68,68,0.04)',
              borderColor: atsReadabilityDetails.score >= 70
                ? 'rgba(34,197,94,0.15)'
                : atsReadabilityDetails.score >= 50
                ? 'rgba(245,158,11,0.15)'
                : 'rgba(239,68,68,0.15)',
            }}
          >
            {/* Score header */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--at-text-primary)' }}>
                ATS Readability Score
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--at-font-mono)',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: atsReadabilityDetails.score >= 70
                      ? 'var(--at-success-light)'
                      : atsReadabilityDetails.score >= 50
                      ? 'var(--at-warning-light)'
                      : 'var(--at-danger-light)',
                  }}
                  aria-label={`ATS Readability: ${atsReadabilityDetails.score} out of 100`}
                >
                  {atsReadabilityDetails.score}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--at-text-muted)' }}>/100</span>
              </div>
            </div>

            {/* Progress */}
            <div className="at-progress mb-3" role="progressbar" aria-valuenow={atsReadabilityDetails.score} aria-valuemin={0} aria-valuemax={100} aria-label={`Readability ${atsReadabilityDetails.score}%`}>
              <motion.div
                className="at-progress-bar"
                style={{
                  background: atsReadabilityDetails.score >= 70
                    ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                    : atsReadabilityDetails.score >= 50
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #ef4444, #f97316)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${atsReadabilityDetails.score}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>

            {/* Checklist */}
            <div className="d-flex flex-wrap gap-2 mb-3">
              {[
                { label: 'Contact Info',       ok: atsReadabilityDetails.hasContactInfo },
                { label: 'Clear Sections',     ok: atsReadabilityDetails.hasClearSections },
                { label: 'Consistent Format',  ok: atsReadabilityDetails.hasConsistentFormatting },
                { label: 'Visible Skills',     ok: atsReadabilityDetails.hasVisibleSkills },
              ].map(item => (
                <span
                  key={item.label}
                  className={`at-badge ${item.ok ? 'at-badge-success' : 'at-badge-warning'}`}
                  style={{ fontSize: '0.72rem' }}
                  role="status"
                  aria-label={`${item.label}: ${item.ok ? 'present' : 'missing or unclear'}`}
                >
                  <i className={`bi ${item.ok ? 'bi-check2' : 'bi-dash'}`} aria-hidden="true" />
                  {item.label}
                </span>
              ))}
            </div>

            {/* Explanation */}
            <p style={{ fontSize: '0.83rem', color: 'var(--at-text-secondary)', marginBottom: atsReadabilityDetails.issues.length > 0 ? '0.75rem' : 0, lineHeight: 1.6 }}>
              {atsReadabilityDetails.explanation}
            </p>

            {/* Issues */}
            {atsReadabilityDetails.issues.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--at-warning)', marginBottom: '0.5rem' }}>
                  Formatting Issues Detected
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {atsReadabilityDetails.issues.map((issue, i) => (
                    <li key={i} style={{ fontSize: '0.82rem', color: 'var(--at-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1.5 }}>
                      <i className="bi bi-exclamation-circle flex-shrink-0 mt-1" style={{ color: 'var(--at-warning)', fontSize: '0.72rem' }} aria-hidden="true" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
