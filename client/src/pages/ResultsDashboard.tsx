import { useRef } from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '../types';
import ScoreCircle from '../components/results/ScoreCircle';
import CategoryBreakdown from '../components/results/CategoryBreakdown';
import SkillBadges from '../components/results/SkillBadges';
import EvidenceAccordion from '../components/results/EvidenceAccordion';
import KeywordAnalysis from '../components/results/KeywordAnalysis';
import Recommendations from '../components/results/Recommendations';
import RAGInsights from '../components/results/RAGInsights';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const ResultsDashboard = ({ result, onReset }: ResultsDashboardProps) => {
  const topRef = useRef<HTMLDivElement>(null);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const sectionVariants = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <motion.div
      ref={topRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Results header */}
      <div
        className="results-header d-flex align-items-center justify-content-between mb-5"
        style={{ flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <div className="at-section-label mb-1">
            <i className="bi bi-trophy-fill" />
            ATSense Results
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: 'var(--at-text-primary)',
              marginBottom: 0,
            }}
          >
            Your ATS{' '}
            <span
              style={{
                background: 'var(--at-gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Score Report
            </span>
          </h1>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn-at-secondary"
            onClick={onReset}
            aria-label="Analyze another resume"
            style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem' }}
          >
            <i className="bi bi-arrow-repeat me-2" aria-hidden="true" />
            New Analysis
          </button>
          <button
            className="btn-at-ghost"
            onClick={() => window.print()}
            aria-label="Print results"
            style={{ fontSize: '0.875rem', padding: '0.6rem 1rem' }}
          >
            <i className="bi bi-printer" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main results grid */}
      <motion.div
        className="results-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left panel — Score + Categories */}
        <motion.div
          variants={sectionVariants}
          className="score-panel"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {/* Score circle card */}
          <div className="at-card" style={{ background: 'var(--at-bg-elevated)' }}>
            <ScoreCircle result={result} />
          </div>

          {/* Category breakdown */}
          <div className="at-card">
            <CategoryBreakdown result={result} />
          </div>
        </motion.div>

        {/* Right panel — Everything else */}
        <motion.div
          variants={sectionVariants}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {/* Skills section */}
          <div className="at-card">
            <SkillBadges result={result} />
          </div>

          {/* Evidence accordion */}
          {result.evidence && result.evidence.length > 0 && (
            <div className="at-card">
              <EvidenceAccordion evidence={result.evidence} />
            </div>
          )}

          {/* Keyword analysis */}
          {result.keywordAnalysis && (
            <div className="at-card">
              <KeywordAnalysis result={result} />
            </div>
          )}

          {/* Recommendations + ATS Readability */}
          <div className="at-card">
            <Recommendations result={result} />
          </div>

          {/* RAG Insights */}
          {result.ragInsights && (
            <div className="at-card">
              <RAGInsights result={result} />
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom disclaimer */}
      <motion.div
        variants={sectionVariants}
        className="text-center mt-5"
        style={{
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--at-border-subtle)',
          borderRadius: 'var(--at-radius-lg)',
        }}
        role="note"
      >
        <i className="bi bi-info-circle me-2" style={{ color: 'var(--at-indigo-light)' }} aria-hidden="true" />
        <span style={{ fontSize: '0.8rem', color: 'var(--at-text-muted)', lineHeight: 1.6 }}>
          ATSense provides an AI-based compatibility estimate based on semantic relevance, job requirements, resume evidence, keywords, experience alignment, and ATS readability.
          Actual ATS scoring may vary between employers and recruitment systems.
        </span>
      </motion.div>
    </motion.div>
  );
};

export default ResultsDashboard;
