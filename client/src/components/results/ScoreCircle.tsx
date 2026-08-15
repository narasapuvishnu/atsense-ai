import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult, MATCH_LEVEL_CONFIG } from '../../types';
import { getScoreColor } from '../../utils/formatters';

interface ScoreCircleProps {
  result: AnalysisResult;
}

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = 220;

const ScoreCircle = ({ result }: ScoreCircleProps) => {
  const { overallScore, matchLevel, summary } = result;
  const [displayScore, setDisplayScore] = useState(0);
  const [animated, setAnimated] = useState(false);
  const frameRef = useRef<number | null>(null);

  const scoreColor = getScoreColor(overallScore);
  const mlConfig = MATCH_LEVEL_CONFIG[matchLevel];
  const strokeDashoffset = CIRCUMFERENCE - (overallScore / 100) * CIRCUMFERENCE;

  // Animate the score counter
  useEffect(() => {
    let start = 0;
    const duration = 1600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * overallScore);
      setDisplayScore(start);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setAnimated(true);
      }
    };

    const timer = setTimeout(() => {
      frameRef.current = requestAnimationFrame(tick);
    }, 400);

    return () => {
      clearTimeout(timer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [overallScore]);

  return (
    <div className="text-center">
      {/* SVG Score Ring */}
      <div
        className="score-circle-container"
        style={{ position: 'relative', width: SIZE, height: SIZE, margin: '0 auto 1.5rem' }}
        role="img"
        aria-label={`ATS Score: ${overallScore} out of 100 — ${matchLevel}`}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          {/* Defs */}
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={scoreColor} stopOpacity="1" />
              <stop offset="100%" stopColor={scoreColor} stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
          />

          {/* Secondary track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="20"
          />

          {/* Score arc */}
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="url(#scoreGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            filter="url(#glow)"
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75].map(pct => {
            const angle = ((pct / 100) * 360 - 90) * (Math.PI / 180);
            const x = SIZE / 2 + (RADIUS + 18) * Math.cos(angle);
            const y = SIZE / 2 + (RADIUS + 18) * Math.sin(angle);
            return (
              <circle key={pct} cx={x} cy={y} r="2" fill="rgba(255,255,255,0.15)" />
            );
          })}
        </svg>

        {/* Center content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="score-number-main"
            style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              lineHeight: 1,
              color: scoreColor,
              fontFamily: 'var(--at-font-mono)',
              letterSpacing: '-0.04em',
              textShadow: `0 0 20px ${scoreColor}40`,
            }}
            aria-live="polite"
          >
            {displayScore}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{ fontSize: '0.75rem', color: 'var(--at-text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            / 100
          </motion.div>
        </div>
      </div>

      {/* Match level badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div
          className="d-inline-flex align-items-center gap-2 px-4 py-2 mb-3"
          style={{
            borderRadius: 'var(--at-radius-full)',
            background: mlConfig.bgColor,
            border: `1px solid ${mlConfig.borderColor}`,
            fontSize: '0.9rem',
            fontWeight: 700,
            color: mlConfig.color,
          }}
          role="status"
          aria-label={`Match level: ${matchLevel}`}
        >
          <i className={`bi ${mlConfig.icon}`} aria-hidden="true" />
          {matchLevel}
        </div>
      </motion.div>

      {/* AI Estimated badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mb-3"
      >
        <span
          className="at-badge at-badge-accent"
          style={{ fontSize: '0.72rem' }}
          title="AI-estimated ATS compatibility score"
        >
          <i className="bi bi-robot me-1" aria-hidden="true" />
          AI-Estimated Score
        </span>
      </motion.div>

      {/* Summary */}
      {animated && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--at-border-subtle)',
              borderRadius: 'var(--at-radius-md)',
              padding: '1rem',
              fontSize: '0.85rem',
              color: 'var(--at-text-secondary)',
              lineHeight: 1.65,
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--at-text-muted)', marginBottom: '0.4rem' }}>
              <i className="bi bi-chat-text me-1" aria-hidden="true" />
              Summary
            </div>
            {summary}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ScoreCircle;
