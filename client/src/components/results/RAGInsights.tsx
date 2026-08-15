import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult, RAGEvidenceEntry } from '../../types';

interface RAGInsightsProps {
  result: AnalysisResult;
}

const RAGInsights = ({ result }: RAGInsightsProps) => {
  const { ragInsights, _ragEvidence } = result;
  const [expanded, setExpanded] = useState(false);
  const [expandedChunkIdx, setExpandedChunkIdx] = useState<number | null>(null);

  if (!ragInsights) return null;

  const metrics = [
    { label: 'Chunks Indexed',       value: ragInsights.totalChunksIndexed, icon: 'bi-database-fill',         color: 'var(--at-indigo-light)', mono: true },
    { label: 'Chunks Retrieved',     value: ragInsights.chunksRetrieved,    icon: 'bi-search',                 color: 'var(--at-cyan)',          mono: true },
    { label: 'Top Similarity',       value: ragInsights.topSimilarity.toFixed(3),  icon: 'bi-graph-up-arrow', color: 'var(--at-success-light)', mono: true },
    { label: 'Avg Similarity',       value: ragInsights.averageSimilarity.toFixed(3), icon: 'bi-bar-chart',  color: 'var(--at-purple-light)',  mono: true },
    { label: 'Embedding Model',      value: ragInsights.embeddingModel,     icon: 'bi-cpu-fill',               color: 'var(--at-blue-light)',    mono: false },
    { label: 'Vector Database',      value: ragInsights.vectorDatabase,     icon: 'bi-hdd-stack-fill',         color: 'var(--at-cyan)',          mono: false },
    { label: 'Top-K',                value: String(ragInsights.topK),       icon: 'bi-list-ol',                color: 'var(--at-indigo-light)', mono: true },
  ];

  return (
    <div>
      <div className="at-section-label mb-3">
        <i className="bi bi-diagram-3-fill" />
        RAG Pipeline
      </div>

      {/* Toggle header */}
      <button
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        aria-controls="rag-insights-content"
        style={{
          width: '100%',
          background: 'var(--at-bg-elevated)',
          border: `1px solid ${expanded ? 'var(--at-border-hover)' : 'var(--at-border)'}`,
          borderRadius: 'var(--at-radius-md)',
          padding: '1rem 1.25rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          textAlign: 'left',
          transition: 'all var(--at-transition-fast)',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--at-radius)',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--at-indigo-light)',
              fontSize: '1rem',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <i className="bi bi-diagram-3" />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--at-text-primary)' }}>
              RAG Retrieval Insights
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--at-text-muted)' }}>
              {ragInsights.totalChunksIndexed} chunks indexed · {ragInsights.chunksRetrieved} retrieved · top similarity {ragInsights.topSimilarity.toFixed(3)}
            </div>
          </div>
        </div>
        <motion.i
          className="bi bi-chevron-down flex-shrink-0"
          style={{ color: 'var(--at-text-muted)', fontSize: '0.85rem' }}
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        />
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="rag-insights-content"
            role="region"
            aria-label="RAG retrieval details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: '0.75rem' }}>
              {/* Metrics grid */}
              <div
                className="rag-insights-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                {metrics.map(m => (
                  <div
                    key={m.label}
                    style={{
                      background: 'var(--at-bg-elevated)',
                      border: '1px solid var(--at-border-subtle)',
                      borderRadius: 'var(--at-radius)',
                      padding: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <i className={`bi ${m.icon}`} style={{ color: m.color, fontSize: '0.85rem' }} aria-hidden="true" />
                      <span style={{ fontSize: '0.72rem', color: 'var(--at-text-muted)', fontWeight: 600 }}>
                        {m.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: m.mono ? '1rem' : '0.85rem',
                        fontWeight: 700,
                        color: 'var(--at-text-primary)',
                        fontFamily: m.mono ? 'var(--at-font-mono)' : 'var(--at-font-sans)',
                        wordBreak: 'break-all',
                      }}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pipeline diagram */}
              <div
                style={{
                  background: 'var(--at-bg-elevated)',
                  border: '1px solid var(--at-border-subtle)',
                  borderRadius: 'var(--at-radius-md)',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.78rem',
                  color: 'var(--at-text-muted)',
                  fontFamily: 'var(--at-font-mono)',
                  lineHeight: 2,
                }}
                aria-label="RAG pipeline visualization"
              >
                {[
                  { step: 'Resume → Text Extraction',    color: 'var(--at-indigo-light)' },
                  { step: 'Semantic Chunking',            color: 'var(--at-indigo-light)' },
                  { step: 'Transformers.js Embeddings',   color: 'var(--at-cyan)' },
                  { step: 'Qdrant Vector Store',          color: 'var(--at-cyan)' },
                  { step: 'JD Requirement Embedding',     color: 'var(--at-purple-light)' },
                  { step: 'Cosine Similarity Search',     color: 'var(--at-purple-light)' },
                  { step: `Top-${ragInsights.topK} Chunk Retrieval`, color: 'var(--at-success-light)' },
                  { step: 'Groq LLM Contextual Eval',    color: 'var(--at-success-light)' },
                  { step: 'ATSense Score',                color: 'var(--at-score-exceptional)' },
                ].map((item, i, arr) => (
                  <div key={item.step}>
                    <span style={{ color: item.color }}>▸ {item.step}</span>
                    {i < arr.length - 1 && (
                      <div style={{ marginLeft: '0.5rem', color: 'rgba(255,255,255,0.15)', lineHeight: 1 }}>│</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Retrieved chunks browser */}
              {_ragEvidence && _ragEvidence.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--at-indigo-light)', marginBottom: '0.75rem' }}>
                    Retrieved Chunks Inspector
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {_ragEvidence.slice(0, 5).map((ev: RAGEvidenceEntry, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--at-border-subtle)',
                          borderRadius: 'var(--at-radius)',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={() => setExpandedChunkIdx(expandedChunkIdx === idx ? null : idx)}
                          aria-expanded={expandedChunkIdx === idx}
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            padding: '0.65rem 0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{ fontSize: '0.7rem', color: 'var(--at-cyan)', fontFamily: 'var(--at-font-mono)', flexShrink: 0 }}>
                            {ev.topSimilarity.toFixed(3)}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--at-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {ev.requirement}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--at-text-muted)', flexShrink: 0 }}>
                            {ev.chunks.length} chunk{ev.chunks.length !== 1 ? 's' : ''}
                          </span>
                          <motion.i
                            className="bi bi-chevron-down"
                            style={{ fontSize: '0.7rem', color: 'var(--at-text-muted)', flexShrink: 0 }}
                            animate={{ rotate: expandedChunkIdx === idx ? 180 : 0 }}
                            transition={{ duration: 0.15 }}
                            aria-hidden="true"
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {expandedChunkIdx === idx && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ padding: '0 0.9rem 0.75rem', borderTop: '1px solid var(--at-border-subtle)' }}>
                                {ev.chunks.map((chunk, ci) => (
                                  <div
                                    key={ci}
                                    style={{
                                      marginTop: '0.5rem',
                                      padding: '0.6rem 0.75rem',
                                      background: 'rgba(99,102,241,0.05)',
                                      borderLeft: '2px solid var(--at-indigo)',
                                      borderRadius: '0 var(--at-radius-sm) var(--at-radius-sm) 0',
                                      fontSize: '0.78rem',
                                      color: 'var(--at-text-secondary)',
                                      lineHeight: 1.6,
                                    }}
                                  >
                                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.3rem' }}>
                                      <span style={{ fontSize: '0.68rem', color: 'var(--at-text-muted)' }}>
                                        <i className="bi bi-bookmark me-1" />
                                        {chunk.section}
                                      </span>
                                      <span style={{ fontSize: '0.68rem', color: 'var(--at-cyan)', fontFamily: 'var(--at-font-mono)' }}>
                                        {chunk.similarity.toFixed(3)}
                                      </span>
                                    </div>
                                    {chunk.text.slice(0, 250)}{chunk.text.length > 250 ? '…' : ''}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RAGInsights;
