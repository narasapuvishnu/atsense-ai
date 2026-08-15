import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AnalysisResult } from '../../types';

interface SkillBadgesProps {
  result: AnalysisResult;
}

const SkillBadges = ({ result }: SkillBadgesProps) => {
  const { matchedSkills, missingSkills } = result;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
  };

  const badgeVariants = {
    hidden:  { opacity: 0, scale: 0.7 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  };

  return (
    <div ref={ref}>
      {/* Matched Skills */}
      <div className="at-card mb-4" style={{ background: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.15)' }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--at-radius)',
              background: 'rgba(34,197,94,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--at-success)',
              fontSize: '0.9rem',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <i className="bi bi-check2-all" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--at-success-light)' }}>
              Skills You Match
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--at-text-muted)' }}>
              {matchedSkills.length} skill{matchedSkills.length !== 1 ? 's' : ''} found in your resume
            </div>
          </div>
        </div>

        {matchedSkills.length > 0 ? (
          <motion.div
            className="skills-grid d-flex flex-wrap gap-2"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            role="list"
            aria-label="Matched skills"
          >
            {matchedSkills.map(skill => (
              <motion.span
                key={skill}
                variants={badgeVariants}
                className="at-badge at-badge-success"
                role="listitem"
                style={{ fontSize: '0.8rem', cursor: 'default' }}
              >
                <i className="bi bi-check2" aria-hidden="true" />
                {skill}
              </motion.span>
            ))}
          </motion.div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--at-text-muted)', margin: 0 }}>
            No matched skills were identified based on the retrieved evidence.
          </p>
        )}
      </div>

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div className="at-card" style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.15)' }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--at-radius)',
                background: 'rgba(245,158,11,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--at-warning)',
                fontSize: '0.9rem',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <i className="bi bi-exclamation-triangle" />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--at-warning-light)' }}>
                Missing or Weakly Supported Skills
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--at-text-muted)' }}>
                {missingSkills.length} skill{missingSkills.length !== 1 ? 's' : ''} not clearly demonstrated
              </div>
            </div>
          </div>

          <motion.div
            className="skills-grid d-flex flex-wrap gap-2"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            role="list"
            aria-label="Missing skills"
          >
            {missingSkills.map(skill => (
              <motion.span
                key={skill}
                variants={badgeVariants}
                className="at-badge at-badge-warning"
                role="listitem"
                style={{ fontSize: '0.8rem', cursor: 'default' }}
                title="Not clearly demonstrated in retrieved resume evidence"
              >
                <i className="bi bi-dash-circle" aria-hidden="true" />
                {skill}
              </motion.span>
            ))}
          </motion.div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--at-text-muted)', lineHeight: 1.5 }}>
            <i className="bi bi-info-circle me-1" style={{ color: 'var(--at-warning)' }} aria-hidden="true" />
            These skills were not clearly supported by evidence in your resume. Only add skills you genuinely have.
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="row g-3 mt-1">
        {result.strengths.length > 0 && (
          <div className="col-md-6">
            <div
              className="h-100"
              style={{
                background: 'rgba(34,197,94,0.04)',
                border: '1px solid rgba(34,197,94,0.12)',
                borderRadius: 'var(--at-radius-md)',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--at-success)', marginBottom: '0.75rem' }}>
                <i className="bi bi-arrow-up-circle me-1" aria-hidden="true" />
                Strengths
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.strengths.map((s, i) => (
                  <li key={i} style={{ fontSize: '0.83rem', color: 'var(--at-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1.5 }}>
                    <i className="bi bi-check2-circle flex-shrink-0 mt-1" style={{ color: 'var(--at-success)', fontSize: '0.75rem' }} aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {result.weaknesses.length > 0 && (
          <div className="col-md-6">
            <div
              className="h-100"
              style={{
                background: 'rgba(245,158,11,0.04)',
                border: '1px solid rgba(245,158,11,0.12)',
                borderRadius: 'var(--at-radius-md)',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--at-warning)', marginBottom: '0.75rem' }}>
                <i className="bi bi-arrow-down-circle me-1" aria-hidden="true" />
                Areas to Improve
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.weaknesses.map((w, i) => (
                  <li key={i} style={{ fontSize: '0.83rem', color: 'var(--at-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1.5 }}>
                    <i className="bi bi-exclamation-circle flex-shrink-0 mt-1" style={{ color: 'var(--at-warning)', fontSize: '0.75rem' }} aria-hidden="true" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillBadges;
