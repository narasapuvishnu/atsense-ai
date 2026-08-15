import { useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScrolled } from '../hooks/useScrolled';

const Navbar = () => {
  const scrolled = useScrolled(20);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const scrollTo = useCallback((id: string) => {
    if (!isHome) {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isHome, navigate]);

  return (
    <motion.nav
      className={`navbar navbar-expand-lg fixed-top${scrolled ? ' scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand" to="/" aria-label="ATSense Home">
          AT<span style={{ background: 'var(--at-gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 800 }}>Sense</span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Nav links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
            <li className="nav-item">
              <Link
                className={`nav-link${location.pathname === '/analyzer' ? ' active' : ''}`}
                to="/analyzer"
              >
                Analyzer
              </Link>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link border-0 p-0"
                style={{ padding: '0.5rem 1rem' }}
                onClick={() => scrollTo('how-it-works')}
              >
                How It Works
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link border-0 p-0"
                style={{ padding: '0.5rem 1rem' }}
                onClick={() => scrollTo('features')}
              >
                Insights
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link border-0 p-0"
                style={{ padding: '0.5rem 1rem' }}
                onClick={() => scrollTo('about')}
              >
                About
              </button>
            </li>
            <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
              <button
                className="btn-at-primary"
                style={{ padding: '0.55rem 1.4rem', fontSize: '0.875rem' }}
                onClick={() => navigate('/analyzer')}
                aria-label="Go to Resume Analyzer"
              >
                <i className="bi bi-lightning-fill me-1" />
                Analyze Resume
              </button>
            </li>
          </ul>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
