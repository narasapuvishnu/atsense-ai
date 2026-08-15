import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  accent: string;
  glowClass: string;
  points: string[];
}

const features: FeatureCard[] = [
  {
    icon: 'bi-diagram-3-fill',
    title: 'Semantic Matching',
    description: 'Understand the meaning behind your experience instead of relying only on exact keyword matching.',
    accent: 'var(--at-indigo)',
    glowClass: 'feature-card-indigo',
    points: [
      'Sentence-level semantic similarity',
      'Context-aware skill detection',
      'Beyond keyword scanning',
    ],
  },
  {
    icon: 'bi-search',
    title: 'RAG-Powered Evidence',
    description: 'See exactly which sections of your resume support each job requirement using Retrieval-Augmented Generation.',
    accent: 'var(--at-purple)',
    glowClass: 'feature-card-purple',
    points: [
      'Qdrant vector similarity search',
      'Top-K chunk retrieval',
      'Evidence-grounded evaluation',
    ],
  },
  {
    icon: 'bi-robot',
    title: 'AI-Powered Insights',
    description: "Discover strengths, missing skills, weaknesses, and actionable resume improvements powered by Groq LLM.",
    accent: 'var(--at-cyan)',
    glowClass: 'feature-card-cyan',
    points: [
      'Groq LLaMA evaluation',
      'Structured JSON output',
      'Personalized recommendations',
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
};

const Features = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="features"
      ref={ref}
      style={{ padding: '100px 0', background: 'var(--at-bg-secondary)' }}
      aria-labelledby="features-heading"
    >
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="at-section-label justify-content-center">
              <i className="bi bi-stars" />
              Why ATSense
            </div>
            <h2 id="features-heading" className="at-section-title">
              Resume intelligence that{' '}
              <span className="at-gradient-text">actually works</span>
            </h2>
            <p style={{ color: 'var(--at-text-secondary)', maxWidth: 520, margin: '0 auto', fontSize: '1.05rem' }}>
              Built on real AI technologies — not simple keyword matching or rule-based scoring.
            </p>
          </motion.div>
        </div>

        {/* Cards */}
        <motion.div
          className="row g-4 feature-cards-row"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {features.map((f) => (
            <motion.div key={f.title} className="col-lg-4 col-md-6" variants={cardVariants}>
              <div
                className={`at-card h-100 ${f.glowClass}`}
                style={{ cursor: 'default' }}
                role="article"
                aria-label={f.title}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--at-radius-md)',
                    background: `linear-gradient(135deg, ${f.accent}22, ${f.accent}11)`,
                    border: `1px solid ${f.accent}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                    fontSize: '1.5rem',
                    color: f.accent,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  <i className={`bi ${f.icon}`} />
                </div>

                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--at-text-primary)',
                    marginBottom: '0.75rem',
                  }}
                >
                  {f.title}
                </h3>

                <p
                  style={{
                    color: 'var(--at-text-secondary)',
                    fontSize: '0.93rem',
                    lineHeight: 1.65,
                    marginBottom: '1.25rem',
                  }}
                >
                  {f.description}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {f.points.map(pt => (
                    <li key={pt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--at-text-muted)' }}>
                      <i className="bi bi-check2" style={{ color: f.accent, flexShrink: 0 }} aria-hidden="true" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="row g-3 mt-5"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.5 }}
        >
          {[
            { value: '100pt', label: 'Scoring System', icon: 'bi-bar-chart-fill' },
            { value: 'RAG',   label: 'Evidence-Based', icon: 'bi-search' },
            { value: 'Free',  label: 'Embedding Model', icon: 'bi-cpu-fill' },
            { value: 'Live',  label: 'Vector Search',   icon: 'bi-lightning-charge-fill' },
          ].map(stat => (
            <div key={stat.label} className="col-6 col-md-3">
              <div
                className="text-center at-card"
                style={{ padding: '1.25rem 1rem', background: 'rgba(99,102,241,0.04)' }}
              >
                <div style={{ fontSize: '1.5rem', color: 'var(--at-indigo-light)', marginBottom: '0.4rem' }} aria-hidden="true">
                  <i className={`bi ${stat.icon}`} />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--at-text-primary)', lineHeight: 1.2 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--at-text-muted)', marginTop: '0.2rem' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
