import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer
      id="about"
      style={{
        background: 'var(--at-bg-secondary)',
        borderTop: '1px solid var(--at-border-subtle)',
        padding: '60px 0 32px',
      }}
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="container">
        <div className="row g-4 mb-5">
          {/* Brand column */}
          <div className="col-lg-4 col-md-6">
            <div
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                background: 'var(--at-gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.75rem',
              }}
            >
              ATSense
            </div>
            <p style={{ color: 'var(--at-text-muted)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: 300 }}>
              AI-Powered Resume Intelligence. Understand your resume, match your opportunity, and improve your chances with semantic AI.
            </p>
            <div className="d-flex gap-2 mt-3">
              {[
                { icon: 'bi-github',   label: 'GitHub',   href: '#' },
                { icon: 'bi-linkedin', label: 'LinkedIn', href: '#' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--at-radius)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--at-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--at-text-muted)',
                    fontSize: '1rem',
                    transition: 'all var(--at-transition-fast)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(99,102,241,0.15)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--at-indigo-light)';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(99,102,241,0.4)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--at-text-muted)';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--at-border)';
                  }}
                >
                  <i className={`bi ${s.icon}`} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--at-text-muted)', marginBottom: '1rem' }}>
              Product
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: 'Analyzer',      action: () => navigate('/analyzer') },
                { label: 'How It Works',  action: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Features',      action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
              ].map(l => (
                <li key={l.label}>
                  <button
                    onClick={l.action}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: 'var(--at-text-muted)',
                      transition: 'color var(--at-transition-fast)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--at-text-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--at-text-muted)')}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech stack */}
          <div className="col-lg-2 col-md-3 col-6">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--at-text-muted)', marginBottom: '1rem' }}>
              Built With
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['React + TypeScript', 'Node.js + Express', 'Transformers.js', 'Qdrant Vector DB', 'Groq LLM'].map(t => (
                <li key={t} style={{ fontSize: '0.8rem', color: 'var(--at-text-muted)' }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="col-lg-4">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--at-text-muted)', marginBottom: '1rem' }}>
              Disclaimer
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--at-text-muted)', lineHeight: 1.7 }}>
              ATSense provides an AI-based compatibility estimate based on semantic relevance, job requirements, resume evidence, keywords, experience alignment, and ATS readability.
              Actual ATS scoring may vary between employers and recruitment systems.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--at-border-subtle)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
          }}
          className="footer-grid"
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--at-text-muted)', margin: 0 }}>
            © {new Date().getFullYear()} ATSense. Built with React, TypeScript, and AI.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--at-text-muted)' }}>Powered by</span>
            {['Transformers.js', 'Qdrant', 'Groq'].map(t => (
              <span key={t} className="at-badge at-badge-accent" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
