import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EvidenceItem, EVIDENCE_STATUS_CONFIG } from '../../types';

interface EvidenceAccordionProps {
  evidence: EvidenceItem[];
}

const EvidenceAccordion = ({ evidence }: EvidenceAccordionProps) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="at-card text-center" style={{ color: 'var(--at-text-muted)', padding: '2rem' }}>
        <i className="bi bi-search d-block mb-2" style={{ fontSize: '2rem' }} />
        No evidence data available.
      </div>
    );
  }

  return (
    <div className="evidence-accordion">
      <div className="at-section-label mb-3">
        <i className="bi bi-search" />
        RAG Evidence
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--at-text-primary)', marginBottom: '0.5rem' }}>
        Requirement-by-Requirement Analysis
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--at-text-muted)', marginBottom: '1.25rem' }}>
        Evidence retrieved from your resume by semantic vector search for each job requirement.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }} role="list">
        {evidence.map((ev, idx) => {
          const isOpen = openIdx === idx;
          const config = EVIDENCE_STATUS_CONFIG[ev.status];
          const matchPct = ev.matchScore;

          return (
            <div
              key={idx}
              role="listitem"
              style={{
                background: 'var(--at-bg-card)',
                border: `1px solid ${isOpen ? 'var(--at-border-hover)' : 'var(--at-border)'}`,
                borderRadius: 'var(--at-radius-md)',
                overflow: 'hidden',
                transition: 'border-color var(--at-transition-fast)',
              }}
            >
              {/* Accordion Header */}
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={`evidence-panel-${idx}`}
                id={`evidence-btn-${idx}`}
                style={{
                  width: '100%',
                  background: isOpen ? 'var(--at-bg-elevated)' : 'transparent',
                  border: 'none',
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textAlign: 'left',
                  transition: 'background var(--at-transition-fast)',
                }}
              >
                {/* Match score circle */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: `conic-gradient(${config.color} ${matchPct}%, rgba(255,255,255,0.06) ${matchPct}%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                  aria-hidden="true"
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: 'var(--at-bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: config.color,
                      fontFamily: 'var(--at-font-mono)',
                    }}
                  >
                    {matchPct}%
                  </div>
                </div>

                {/* Requirement text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: 'var(--at-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '0.2rem',
                    }}
                    title={ev.requirement}
                  >
                    {ev.requirement}
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className={`at-badge ${config.badgeClass}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem' }}>
                      {config.label}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--at-text-muted)' }}>
                      <i className="bi bi-layers me-1" aria-hidden="true" />
                      {ev.sourceSection}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--at-text-muted)', fontFamily: 'var(--at-font-mono)' }}>
                      sim: {ev.similarity.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <motion.i
                  className="bi bi-chevron-down flex-shrink-0"
                  style={{ fontSize: '0.8rem', color: 'var(--at-text-muted)' }}
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden="true"
                />
              </button>

              {/* Accordion Body */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`evidence-panel-${idx}`}
                    role="region"
                    aria-labelledby={`evidence-btn-${idx}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        background: 'var(--at-bg-elevated)',
                        borderTop: '1px solid var(--at-border)',
                      }}
                    >
                      {/* Metadata row */}
                      <div className="d-flex flex-wrap gap-3 mb-3">
                        {[
                          { label: 'Match Score', value: `${ev.matchScore}%`, icon: 'bi-percent' },
                          { label: 'Similarity',  value: ev.similarity.toFixed(3), icon: 'bi-graph-up' },
                          { label: 'Section',     value: ev.sourceSection, icon: 'bi-bookmark' },
                          { label: 'Status',      value: config.label, icon: 'bi-circle-fill' },
                        ].map(m => (
                          <div key={m.label} style={{ fontSize: '0.78rem' }}>
                            <div style={{ color: 'var(--at-text-muted)', marginBottom: '0.15rem' }}>
                              <i className={`bi ${m.icon} me-1`} aria-hidden="true" />
                              {m.label}
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--at-text-secondary)', fontFamily: 'var(--at-font-mono)' }}>
                              {m.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Evidence quotes */}
                      {ev.resumeEvidence.length > 0 ? (
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--at-indigo-light)', marginBottom: '0.6rem' }}>
                            Resume Evidence
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {ev.resumeEvidence.map((chunk, ci) => (
                              <div
                                key={ci}
                                style={{
                                  background: 'rgba(99,102,241,0.06)',
                                  border: '1px solid rgba(99,102,241,0.15)',
                                  borderLeft: '3px solid var(--at-indigo)',
                                  borderRadius: '0 var(--at-radius) var(--at-radius) 0',
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.83rem',
                                  color: 'var(--at-text-secondary)',
                                  fontStyle: 'italic',
                                  lineHeight: 1.6,
                                }}
                              >
                                <i className="bi bi-quote me-1" style={{ color: 'var(--at-indigo-light)', opacity: 0.6 }} aria-hidden="true" />
                                {chunk}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            background: 'var(--at-danger-bg)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 'var(--at-radius)',
                            padding: '0.75rem 1rem',
                            fontSize: '0.83rem',
                            color: 'var(--at-danger-light)',
                          }}
                        >
                          <i className="bi bi-x-circle me-2" aria-hidden="true" />
                          No supporting evidence found in your resume for this requirement.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EvidenceAccordion;
