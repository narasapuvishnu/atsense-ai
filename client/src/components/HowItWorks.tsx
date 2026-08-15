import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const steps: ProcessStep[] = [
  { number: '01', title: 'Upload Resume',               description: 'Drop your PDF or DOCX resume. ATSense extracts and cleans the full text.',                         icon: 'bi-file-earmark-arrow-up', color: 'var(--at-indigo)' },
  { number: '02', title: 'Add Job Description',         description: 'Paste or upload the target job description. ATSense identifies required skills and responsibilities.', icon: 'bi-file-text',             color: 'var(--at-purple)' },
  { number: '03', title: 'Generate Embeddings',         description: 'Transformers.js encodes your resume into semantic vectors using all-MiniLM-L6-v2.',                  icon: 'bi-cpu',                   color: 'var(--at-cyan)' },
  { number: '04', title: 'Search Resume Knowledge',     description: 'Qdrant performs vector similarity search to find the most relevant resume chunks per requirement.',  icon: 'bi-database-check',        color: 'var(--at-blue)' },
  { number: '05', title: 'AI Evaluation',               description: 'Groq LLaMA evaluates match strength using retrieved evidence — not the entire raw resume.',          icon: 'bi-robot',                 color: 'var(--at-purple)' },
  { number: '06', title: 'ATSense Score',               description: 'Receive a detailed AI-estimated ATS score with evidence, gaps, and actionable recommendations.',     icon: 'bi-trophy',                color: 'var(--at-score-exceptional)' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const stepVariants = {
  hidden:  { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const HowItWorks = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="how-it-works"
      ref={ref}
      style={{ padding: '100px 0', background: 'var(--at-bg-primary)', position: 'relative' }}
      aria-labelledby="how-heading"
    >
      {/* Background accent */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 70% 50%, rgba(99,102,241,0.05) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="container position-relative">
        {/* Header */}
        <div className="text-center mb-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="at-section-label justify-content-center">
              <i className="bi bi-diagram-3" />
              The Pipeline
            </div>
            <h2 id="how-heading" className="at-section-title">
              How ATSense{' '}
              <span className="at-gradient-text">works</span>
            </h2>
            <p style={{ color: 'var(--at-text-secondary)', maxWidth: 520, margin: '0 auto', fontSize: '1.05rem' }}>
              A genuine RAG pipeline — from raw resume to evidence-grounded AI score.
            </p>
          </motion.div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-7 col-xl-6 process-steps">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
            >
              {steps.map((step, idx) => (
                <div key={step.number}>
                  <motion.div
                    variants={stepVariants}
                    className="at-card"
                    style={{
                      display: 'flex',
                      gap: '1.25rem',
                      alignItems: 'flex-start',
                      padding: '1.25rem 1.5rem',
                      background: 'var(--at-bg-elevated)',
                      borderLeft: `3px solid ${step.color}`,
                      borderRadius: 'var(--at-radius-md)',
                    }}
                    role="listitem"
                    aria-label={`Step ${step.number}: ${step.title}`}
                  >
                    {/* Step number + icon */}
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--at-radius)',
                          background: `${step.color}18`,
                          border: `1px solid ${step.color}33`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.15rem',
                          color: step.color,
                        }}
                        aria-hidden="true"
                      >
                        <i className={`bi ${step.icon}`} />
                      </div>
                      <span
                        style={{
                          fontFamily: 'var(--at-font-mono)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: step.color,
                          opacity: 0.8,
                          letterSpacing: '0.08em',
                        }}
                      >
                        {step.number}
                      </span>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--at-text-primary)', marginBottom: '0.35rem' }}>
                        {step.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--at-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                        {step.description}
                      </p>
                    </div>
                  </motion.div>

                  {/* Connector */}
                  {idx < steps.length - 1 && (
                    <div
                      style={{
                        height: 24,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      aria-hidden="true"
                    >
                      <div style={{ width: 2, height: '100%', background: 'var(--at-border)', opacity: 0.5 }} />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right side — tech stack panel */}
          <div className="col-lg-5 col-xl-4 mt-5 mt-lg-0">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="at-card"
              style={{
                position: 'sticky',
                top: '90px',
                background: 'var(--at-bg-elevated)',
              }}
            >
              <div className="at-section-label mb-3">
                <i className="bi bi-stack" />
                Tech Stack
              </div>

              {[
                { label: 'Embeddings',      value: 'Xenova/all-MiniLM-L6-v2', icon: 'bi-cpu',              color: 'var(--at-indigo-light)' },
                { label: 'Vector DB',       value: 'Qdrant Cloud',            icon: 'bi-database',         color: 'var(--at-cyan)' },
                { label: 'LLM',             value: 'Groq + LLaMA',            icon: 'bi-lightning-fill',   color: 'var(--at-purple-light)' },
                { label: 'Frontend',        value: 'React + TypeScript',       icon: 'bi-code-slash',       color: 'var(--at-blue-light)' },
                { label: 'Backend',         value: 'Node.js + Express',        icon: 'bi-server',           color: 'var(--at-indigo-light)' },
                { label: 'Validation',      value: 'Zod schema',              icon: 'bi-shield-check',     color: 'var(--at-success-light)' },
              ].map(t => (
                <div
                  key={t.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.65rem 0',
                    borderBottom: '1px solid var(--at-border-subtle)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--at-text-muted)' }}>
                    <i className={`bi ${t.icon}`} style={{ color: t.color }} aria-hidden="true" />
                    {t.label}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--at-text-secondary)', fontFamily: 'var(--at-font-mono)' }}>
                    {t.value}
                  </span>
                </div>
              ))}

              <div className="mt-4">
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--at-radius)',
                    background: 'rgba(99,102,241,0.07)',
                    border: '1px solid rgba(99,102,241,0.18)',
                    fontSize: '0.8rem',
                    color: 'var(--at-text-muted)',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                  }}
                >
                  <i className="bi bi-info-circle me-2" style={{ color: 'var(--at-indigo-light)' }} />
                  ATSense provides an AI-based compatibility estimate. Actual ATS scoring may vary between employers and recruitment systems.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
