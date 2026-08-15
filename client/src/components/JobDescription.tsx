import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadJobDescription } from '../services/api';
import { useFileUpload } from '../hooks/useFileUpload';
import { formatFileSize } from '../utils/formatters';

interface JobDescriptionProps {
  value: string;
  onChange: (text: string) => void;
  error?: string;
}

type JDTab = 'paste' | 'upload';

const JD_MIN_CHARS = 50;
const JD_MAX_CHARS = 20000;
const ACCEPTED = ['.pdf', '.docx', '.txt'];
const MAX_SIZE_MB = 10;

const JobDescription = ({ value, onChange, error }: JobDescriptionProps) => {
  const [activeTab, setActiveTab] = useState<JDTab>('paste');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [uploadError, setUploadError] = useState('');

  const handleJDFile = useCallback(async (file: File) => {
    setUploadStatus('uploading');
    setUploadError('');
    try {
      const res = await uploadJobDescription(file);
      onChange(res.extractedText);
      setUploadedFilename(file.name);
      setUploadStatus('success');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process file.');
      setUploadStatus('error');
    }
  }, [onChange]);

  const {
    isDragging,
    error: fileError,
    inputRef,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onInputChange,
    openFileDialog,
    clearFile,
  } = useFileUpload({ accept: ACCEPTED, maxSizeMB: MAX_SIZE_MB, onFile: handleJDFile });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCount = value.length;
  const charPct = Math.min(100, (charCount / JD_MAX_CHARS) * 100);
  const isValid = charCount >= JD_MIN_CHARS;

  const handlePaste = useCallback(() => {
    navigator.clipboard.readText().then(t => {
      if (t) onChange(value + t);
    }).catch(() => {});
  }, [value, onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    clearFile();
    setUploadStatus('idle');
    setUploadedFilename('');
    setUploadError('');
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [onChange, clearFile]);

  return (
    <div>
      {/* Section label */}
      <div className="at-section-label mb-3">
        <i className="bi bi-file-text" />
        Job Description
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--at-text-primary)', marginBottom: '0.4rem' }}>
        Add Job Description
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--at-text-muted)', marginBottom: '1.25rem' }}>
        Paste the job description or upload a file. ATSense extracts requirements automatically.
      </p>

      {/* Tab Toggle */}
      <ul className="nav nav-tabs tabs-analyzer mb-3" role="tablist" aria-label="Job description input method">
        {(['paste', 'upload'] as JDTab[]).map(tab => (
          <li className="nav-item" role="presentation" key={tab}>
            <button
              className={`nav-link${activeTab === tab ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`jd-${tab}-panel`}
              id={`jd-${tab}-tab`}
              onClick={() => setActiveTab(tab)}
            >
              <i className={`bi ${tab === 'paste' ? 'bi-clipboard-plus' : 'bi-cloud-upload'} me-2`} aria-hidden="true" />
              {tab === 'paste' ? 'Paste JD' : 'Upload JD'}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {/* ---- PASTE TAB ---- */}
        {activeTab === 'paste' && (
          <motion.div
            key="paste"
            id="jd-paste-panel"
            role="tabpanel"
            aria-labelledby="jd-paste-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ position: 'relative' }}>
              <textarea
                ref={textareaRef}
                className="form-control"
                placeholder="Paste the job description here...&#10;&#10;Include the full job posting for best results — requirements, responsibilities, qualifications, and any skills mentioned."
                value={value}
                onChange={e => onChange(e.target.value.slice(0, JD_MAX_CHARS))}
                rows={10}
                style={{ minHeight: 240, resize: 'vertical', paddingRight: '80px', fontFamily: 'var(--at-font-sans)', lineHeight: 1.7 }}
                aria-label="Job description text"
                aria-required="true"
                aria-describedby="jd-char-count jd-error"
              />

              {/* Action buttons inside textarea */}
              <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <button
                  className="btn-at-ghost"
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', color: 'var(--at-text-muted)' }}
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  aria-label="Paste from clipboard"
                  type="button"
                >
                  <i className="bi bi-clipboard" aria-hidden="true" />
                </button>
                {value && (
                  <button
                    className="btn-at-ghost"
                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', color: 'var(--at-danger-light)' }}
                    onClick={handleClear}
                    title="Clear text"
                    aria-label="Clear job description text"
                    type="button"
                  >
                    <i className="bi bi-x-lg" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Char counter and status */}
            <div className="d-flex justify-content-between align-items-center mt-2">
              <div id="jd-char-count" style={{ fontSize: '0.75rem', color: isValid ? 'var(--at-success)' : 'var(--at-text-muted)' }}>
                {isValid
                  ? <><i className="bi bi-check2-circle me-1" aria-hidden="true" />Ready to analyze</>
                  : charCount > 0
                  ? `${JD_MIN_CHARS - charCount} more characters needed`
                  : 'Minimum 50 characters required'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 'var(--at-radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${charPct}%`, height: '100%', background: isValid ? 'var(--at-success)' : 'var(--at-indigo)', borderRadius: 'var(--at-radius-full)', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--at-text-muted)', fontFamily: 'var(--at-font-mono)' }}>
                  {charCount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Tip */}
            {!value && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 'var(--at-radius)', fontSize: '0.78rem', color: 'var(--at-text-muted)', lineHeight: 1.6 }}>
                <i className="bi bi-lightbulb me-2" style={{ color: 'var(--at-warning)' }} aria-hidden="true" />
                Tip: Include the full job posting for best results. ATSense extracts required skills, preferred skills, responsibilities, and experience requirements automatically.
              </div>
            )}
          </motion.div>
        )}

        {/* ---- UPLOAD TAB ---- */}
        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            id="jd-upload-panel"
            role="tabpanel"
            aria-labelledby="jd-upload-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {/* Success state */}
              {uploadStatus === 'success' && (
                <motion.div
                  key="jd-success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div style={{ background: 'var(--at-success-bg)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--at-radius-lg)', padding: '1.25rem' }}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div style={{ fontSize: '1.75rem', color: 'var(--at-success)' }} aria-hidden="true">
                        <i className="bi bi-file-earmark-check-fill" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--at-success-light)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                          {uploadedFilename}
                        </div>
                        <span className="at-badge at-badge-success" style={{ fontSize: '0.72rem' }}>
                          <i className="bi bi-check2" /> Text extracted successfully
                        </span>
                      </div>
                    </div>

                    {value && (
                      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--at-radius)', padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--at-text-muted)', fontFamily: 'var(--at-font-mono)', maxHeight: 120, overflow: 'hidden', position: 'relative' }}>
                        {value.slice(0, 350)}…
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, rgba(0,0,0,0.4))' }} aria-hidden="true" />
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-3">
                      <button className="btn-at-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }} onClick={() => { openFileDialog(); setUploadStatus('idle'); }} aria-label="Upload different file">
                        <i className="bi bi-arrow-repeat me-1" />Replace
                      </button>
                      <button className="btn-at-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', color: 'var(--at-danger-light)' }} onClick={handleClear} aria-label="Clear job description">
                        <i className="bi bi-trash me-1" />Clear
                      </button>
                    </div>
                  </div>
                  <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" onChange={onInputChange} style={{ display: 'none' }} />
                </motion.div>
              )}

              {/* Uploading state */}
              {uploadStatus === 'uploading' && (
                <motion.div key="jd-uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ border: '2px dashed rgba(99,102,241,0.5)', borderRadius: 'var(--at-radius-lg)', padding: '2.5rem', textAlign: 'center', background: 'rgba(99,102,241,0.04)' }}>
                    <div className="at-spinner at-spinner-lg" style={{ margin: '0 auto 1rem' }} aria-hidden="true" />
                    <div style={{ fontWeight: 600, color: 'var(--at-text-primary)' }}>Extracting text from file…</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--at-text-muted)', marginTop: '0.4rem' }}>This may take a moment</div>
                  </div>
                </motion.div>
              )}

              {/* Drop zone */}
              {(uploadStatus === 'idle' || uploadStatus === 'error') && (
                <motion.div key="jd-dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload job description file"
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onClick={openFileDialog}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openFileDialog(); }}
                    className="upload-dropzone"
                    style={{
                      border: `2px dashed ${isDragging ? 'var(--at-indigo)' : uploadStatus === 'error' ? 'var(--at-danger)' : 'var(--at-border-hover)'}`,
                      borderRadius: 'var(--at-radius-lg)',
                      padding: '2.5rem 2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragging ? 'rgba(99,102,241,0.07)' : uploadStatus === 'error' ? 'var(--at-danger-bg)' : 'rgba(255,255,255,0.02)',
                      transition: 'all var(--at-transition)',
                      outline: 'none',
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: isDragging ? 'var(--at-indigo)' : 'var(--at-text-muted)' }} aria-hidden="true">
                      <i className="bi bi-cloud-arrow-up" />
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--at-text-primary)', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                      {isDragging ? 'Drop file here' : 'Drop JD file or click to browse'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--at-text-muted)', marginBottom: '0.75rem' }}>
                      PDF, DOCX, or TXT — up to {MAX_SIZE_MB}MB
                    </div>
                    <div className="d-flex gap-2 justify-content-center">
                      {['.pdf', '.docx', '.txt'].map(ext => (
                        <span key={ext} className="at-badge at-badge-accent" style={{ fontSize: '0.7rem' }}>
                          {ext.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {(uploadStatus === 'error' || fileError || uploadError) && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="alert alert-danger mt-2 mb-0 d-flex align-items-center gap-2"
                      role="alert"
                    >
                      <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                      {uploadError || fileError}
                    </motion.div>
                  )}

                  <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" onChange={onInputChange} style={{ display: 'none' }} aria-label="Select JD file" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global validation error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-danger mt-3 mb-0 d-flex align-items-center gap-2"
          id="jd-error"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default JobDescription;
