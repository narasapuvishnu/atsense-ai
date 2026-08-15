import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const techBadges = [
  { label: 'Transformers.js', icon: 'bi-cpu' },
  { label: 'Qdrant Vector DB', icon: 'bi-database' },
  { label: 'Groq LLM', icon: 'bi-lightning' },
  { label: 'RAG Pipeline', icon: 'bi-diagram-3' },
  { label: 'Semantic Embeddings', icon: 'bi-graph-up' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      className="at-hero-bg position-relative"
      style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh', display: 'flex', alignItems: 'center' }}
      id="hero"
      aria-label="ATSense Hero"
    >
      {/* Ambient orbs */}
      <div className="at-orb at-orb-1" aria-hidden="true" />
      <div className="at-orb at-orb-2" aria-hidden="true" />
      <div className="at-orb at-orb-3" aria-hidden="true" />
      <div className="at-grid-overlay" aria-hidden="true" />

      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row justify-content-center text-center">
          <div className="col-lg-9 col-xl-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Status pill */}
              <motion.div variants={itemVariants} className="mb-4">
                <span
                  className="at-badge at-badge-accent"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 1.1rem' }}
                >
                  <span className="at-dot at-dot-success" />
                  AI-Powered Resume Intelligence
                </span>
              </motion.div>

              {/* Main title */}
              <motion.h1
                variants={itemVariants}
                className="at-hero-title"
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1,
                  marginBottom: '1.5rem',
                }}
              >
                Understand your resume.{' '}
                <span
                  className="d-block"
                  style={{
                    background: 'var(--at-gradient-brand)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Match your opportunity.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={itemVariants}
                className="at-hero-subtitle"
                style={{
                  fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                  color: 'var(--at-text-secondary)',
                  maxWidth: '640px',
                  margin: '0 auto 2.5rem',
                  lineHeight: 1.7,
                }}
              >
                ATSense uses{' '}
                <span style={{ color: 'var(--at-indigo-light)', fontWeight: 600 }}>semantic embeddings</span>,{' '}
                <span style={{ color: 'var(--at-cyan)', fontWeight: 600 }}>RAG retrieval</span>,{' '}
                <span style={{ color: 'var(--at-purple-light)', fontWeight: 600 }}>Qdrant vector search</span>, and{' '}
                <span style={{ color: 'var(--at-indigo-light)', fontWeight: 600 }}>Groq AI</span>{' '}
                to understand how closely your resume matches a specific job description.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="at-hero-cta d-flex flex-wrap gap-3 justify-content-center mb-5"
              >
                <button
                  className="btn-at-analyze"
                  onClick={() => navigate('/analyzer')}
                  aria-label="Analyze your resume"
                >
                  <i className="bi bi-lightning-fill me-2" />
                  Analyze My Resume
                  <i className="bi bi-arrow-right ms-2" />
                </button>

                <button
                  className="btn-at-secondary"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  aria-label="Learn how ATSense works"
                >
                  <i className="bi bi-play-circle me-2" />
                  How It Works
                </button>
              </motion.div>

              {/* Tech badges */}
              <motion.div
                variants={itemVariants}
                className="at-hero-badges d-flex flex-wrap justify-content-center gap-2"
              >
                {techBadges.map(badge => (
                  <span
                    key={badge.label}
                    className="at-badge"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--at-text-muted)',
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.75rem',
                    }}
                  >
                    <i className={`bi ${badge.icon} me-1`} style={{ color: 'var(--at-indigo-light)' }} />
                    {badge.label}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-5 pt-3"
          style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)' }}
        >
          <button
            className="btn-at-ghost"
            style={{ fontSize: '0.75rem', color: 'var(--at-text-muted)' }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="Scroll down"
          >
            <i className="bi bi-chevron-down d-block" style={{ fontSize: '1.2rem', animation: 'uploadBounce 2s ease-in-out infinite' }} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
