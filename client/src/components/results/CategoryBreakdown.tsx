import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AnalysisResult, CATEGORY_CONFIG } from '../../types';
import { getProgressBarColor } from '../../utils/formatters';

interface CategoryBreakdownProps {
  result: AnalysisResult;
}

const CategoryBreakdown = ({ result }: CategoryBreakdownProps) => {
  const { categoryScores, categoryPercentages } = result;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref}>
      <div className="at-section-label mb-3">
        <i className="bi bi-bar-chart-fill" />
        Score Breakdown
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--at-text-primary)', marginBottom: '1.25rem' }}>
        Category Analysis
      </h3>

      <div className="category-breakdown-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {CATEGORY_CONFIG.map((cat, idx) => {
          const score = categoryScores[cat.key];
          const pct = categoryPercentages[cat.key];
          const barColor = getProgressBarColor(pct);

          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center gap-2">
                  <i
                    className={`bi ${cat.icon}`}
                    style={{ color: 'var(--at-indigo-light)', fontSize: '0.85rem' }}
                    aria-hidden="true"
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--at-text-primary)' }}>
                    {cat.label}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span
                    style={{
                      fontFamily: 'var(--at-font-mono)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: pct >= 70 ? 'var(--at-success-light)' : pct >= 50 ? 'var(--at-warning-light)' : 'var(--at-danger-light)',
                    }}
                    aria-label={`${score} out of ${cat.maxScore} points, ${pct}%`}
                  >
                    {score}/{cat.maxScore}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--at-text-muted)',
                      minWidth: 36,
                      textAlign: 'right',
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div
                className="at-progress"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${cat.label}: ${pct}%`}
              >
                <motion.div
                  className="at-progress-bar"
                  style={{ background: barColor }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${pct}%` } : {}}
                  transition={{ duration: 1, delay: 0.3 + idx * 0.07, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>

              {/* Description tooltip */}
              <div style={{ fontSize: '0.72rem', color: 'var(--at-text-muted)', marginTop: '0.2rem' }}>
                {cat.description}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Weight legend */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.75rem 1rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--at-border-subtle)',
          borderRadius: 'var(--at-radius)',
          fontSize: '0.75rem',
          color: 'var(--at-text-muted)',
          lineHeight: 1.6,
        }}
      >
        <i className="bi bi-info-circle me-2" style={{ color: 'var(--at-indigo-light)' }} aria-hidden="true" />
        Scoring weighted: Skills 30pt · Experience 20pt · Responsibilities 15pt · Keywords 15pt · Projects 10pt · Education 5pt · ATS 5pt
      </div>
    </div>
  );
};

export default CategoryBreakdown;
