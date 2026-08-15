import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AnalysisResult } from '../../types';

interface KeywordAnalysisProps {
  result: AnalysisResult;
}

const KeywordAnalysis = ({ result }: KeywordAnalysisProps) => {
  const { keywordAnalysis } = result;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  if (!keywordAnalysis) return null;

  const { matched, missing, suggested } = keywordAnalysis;

  const groups = [
    {
      label: 'Matched Keywords',
      keywords: matched,
      badgeClass: 'at-badge-success',
      icon: 'bi-check2-circle',
      iconColor: 'var(--at-success)',
      description: 'Found in your resume evidence',
      emptyText: 'No matched keywords identified.',
    },
    {
      label: 'Missing Keywords',
      keywords: missing,
      badgeClass: 'at-badge-danger',
      icon: 'bi-x-circle',
      iconColor: 'var(--at-danger-light)',
      description: 'Present in the JD but not in your resume',
      emptyText: 'No critical missing keywords identified.',
    },
    {
      label: 'Suggested Additions',
      keywords: suggested,
      badgeClass: 'at-badge-info',
      icon: 'bi-plus-circle',
      iconColor: 'var(--at-cyan)',
      description: 'Only add if genuinely applicable to your experience',
      emptyText: 'No additional keywords suggested.',
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.03 } },
  };

  const itemVariants = {
    hidden:  { opacity: 0, scale: 0.75 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div ref={ref}>
      <div className="at-section-label mb-3">
        <i className="bi bi-tag-fill" />
        Keywords
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--at-text-primary)', marginBottom: '0.4rem' }}>
        Keyword Analysis
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--at-text-muted)', marginBottom: '1.25rem' }}>
        Technical and domain keywords extracted from the job description and cross-referenced with your resume.
      </p>

      <div className="keyword-groups" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {groups.map(group => (
          <div
            key={group.label}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--at-border-subtle)',
              borderRadius: 'var(--at-radius-md)',
              padding: '1rem',
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className={`bi ${group.icon}`} style={{ color: group.iconColor, fontSize: '0.9rem' }} aria-hidden="true" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--at-text-primary)' }}>
                {group.label}
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--at-font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--at-text-muted)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '0.1rem 0.5rem',
                  borderRadius: 'var(--at-radius-full)',
                }}
              >
                {group.keywords.length}
              </span>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--at-text-muted)', marginBottom: '0.65rem' }}>
              {group.description}
            </div>

            {group.keywords.length > 0 ? (
              <motion.div
                className="d-flex flex-wrap gap-1"
                variants={containerVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                role="list"
                aria-label={group.label}
              >
                {group.keywords.map(kw => (
                  <motion.span
                    key={kw}
                    className={`at-badge ${group.badgeClass}`}
                    variants={itemVariants}
                    role="listitem"
                    style={{ fontSize: '0.75rem', cursor: 'default' }}
                  >
                    {kw}
                  </motion.span>
                ))}
              </motion.div>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--at-text-muted)' }}>
                {group.emptyText}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div
        style={{
          marginTop: '0.75rem',
          padding: '0.7rem 1rem',
          background: 'rgba(99,102,241,0.05)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 'var(--at-radius)',
          fontSize: '0.75rem',
          color: 'var(--at-text-muted)',
          lineHeight: 1.6,
        }}
        role="note"
      >
        <i className="bi bi-shield-exclamation me-2" style={{ color: 'var(--at-indigo-light)' }} aria-hidden="true" />
        Only add suggested keywords to your resume if they genuinely reflect your experience. ATSense will never encourage misrepresentation.
      </div>
    </div>
  );
};

export default KeywordAnalysis;
