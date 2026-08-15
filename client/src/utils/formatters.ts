import { MatchLevel } from '../types';

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const formatSectionName = (section: string): string => {
  return section
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

export const getScoreColor = (score: number): string => {
  if (score >= 90) return '#00ff88';
  if (score >= 80) return '#4ade80';
  if (score >= 70) return '#86efac';
  if (score >= 60) return '#fbbf24';
  if (score >= 40) return '#f97316';
  return '#ef4444';
};

export const getMatchLevelColor = (level: MatchLevel): string => {
  const map: Record<MatchLevel, string> = {
    'Exceptional Match': '#00ff88',
    'Strong Match':      '#4ade80',
    'Good Match':        '#86efac',
    'Moderate Match':    '#fbbf24',
    'Weak Match':        '#f97316',
    'Low Match':         '#ef4444',
  };
  return map[level] ?? '#94a3b8';
};

export const getProgressBarColor = (pct: number): string => {
  if (pct >= 85) return 'linear-gradient(90deg,#22c55e,#4ade80)';
  if (pct >= 65) return 'linear-gradient(90deg,#6366f1,#22d3ee)';
  if (pct >= 45) return 'linear-gradient(90deg,#f59e0b,#fbbf24)';
  return 'linear-gradient(90deg,#ef4444,#f97316)';
};

export const getSimilarityLabel = (sim: number): string => {
  if (sim >= 0.85) return 'Excellent';
  if (sim >= 0.70) return 'Strong';
  if (sim >= 0.55) return 'Moderate';
  if (sim >= 0.40) return 'Weak';
  return 'Low';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
};

export const capitalizeFirst = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const pluralize = (count: number, singular: string, plural?: string): string =>
  count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`;
