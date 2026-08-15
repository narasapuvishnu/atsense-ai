import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFileUpload } from '../hooks/useFileUpload';
import { ResumeUploadState } from '../types';
import { formatFileSize } from '../utils/formatters';

interface ResumeUploadProps {
  uploadState: ResumeUploadState;
  onFile: (file: File) => void;
  onRemove: () => void;
}

const ACCEPTED = ['.pdf', '.docx'];
const MAX_SIZE_MB = 10;

const ResumeUpload = ({ uploadState, onFile, onRemove }: ResumeUploadProps) => {
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
  } = useFileUpload({ accept: ACCEPTED, maxSizeMB: MAX_SIZE_MB, onFile });

  const handleRemove = useCallback(() => {
    clearFile();
    onRemove();
  }, [clearFile, onRemove]);

  const isUploading = uploadState.status === 'uploading';
  const isSuccess  = uploadState.status === 'success';
  const isError    = uploadState.status === 'error';
  const progress   = uploadState.status === 'uploading' ? uploadState.progress : 0;

  return (
    <div>
      {/* Section label */}
      <div className="at-section-label mb-3">
        <i className="bi bi-file-earmark-person" />
        Resume
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--at-text-primary)', marginBottom: '0.4rem' }}>
        Upload Your Resume
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--at-text-muted)', marginBottom: '1.25rem' }}>
        Drop your PDF or DOCX here, or browse from your device.
      </p>

      <AnimatePresence mode="wait">
        {/* ---- SUCCESS STATE ---- */}
        {isSuccess && uploadState.status === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div
              style={{
                background: 'var(--at-success-bg)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 'var(--at-radius-lg)',
                padding: '1.5rem',
              }}
            >
              {/* Top row */}
              <div className="d-flex align-items-start gap-3 mb-3">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--at-radius)',
                    background: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '1.4rem',
                    color: 'var(--at-success)',
                  }}
                  aria-hidden="true"
                >
                  <i className="bi bi-file-earmark-check-fill" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--at-success-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {uploadState.resume.filename}
                    </span>
                    <span
                      className="at-badge at-badge-success"
                      style={{ fontSize: '0.7rem', flexShrink: 0 }}
                    >
                      <i className="bi bi-check2" />
                      Uploaded
                    </span>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <span style={{ fontSize: '0.78rem', color: 'var(--at-text-muted)' }}>
                      <i className="bi bi-hdd me-1" aria-hidden="true" />
                      {formatFileSize(uploadState.resume.fileSize)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--at-text-muted)', textTransform: 'uppercase' }}>
                      <i className="bi bi-file-earmark me-1" aria-hidden="true" />
                      {uploadState.resume.fileType}
                    </span>
                    {uploadState.resume.pageCount && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--at-text-muted)' }}>
                        <i className="bi bi-book me-1" aria-hidden="true" />
                        {uploadState.resume.pageCount} {uploadState.resume.pageCount === 1 ? 'page' : 'pages'}
                      </span>
                    )}
                    <span style={{ fontSize: '0.78rem', color: 'var(--at-text-muted)' }}>
                      <i className="bi bi-grid-3x3-gap me-1" aria-hidden="true" />
                      {uploadState.resume.chunksCreated} chunks indexed
                    </span>
                  </div>
                </div>
              </div>

              {/* Detected sections */}
              {uploadState.resume.sections.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--at-text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Detected sections
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {uploadState.resume.sections.map(s => (
                      <span key={s} className="at-badge at-badge-info" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="d-flex gap-2">
                <button
                  className="btn-at-ghost"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', color: 'var(--at-text-muted)' }}
                  onClick={openFileDialog}
                  aria-label="Replace resume file"
                >
                  <i className="bi bi-arrow-repeat me-1" />
                  Replace
                </button>
                <button
                  className="btn-at-ghost"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', color: 'var(--at-danger-light)' }}
                  onClick={handleRemove}
                  aria-label="Remove resume file"
                >
                  <i className="bi bi-trash me-1" />
                  Remove
                </button>
              </div>
            </div>

            {/* Hidden file input for replace */}
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={onInputChange}
              style={{ display: 'none' }}
              aria-label="Replace resume file"
            />
          </motion.div>
        )}

        {/* ---- UPLOADING STATE ---- */}
        {isUploading && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="upload-dropzone"
              style={{
                border: '2px dashed rgba(99,102,241,0.5)',
                borderRadius: 'var(--at-radius-lg)',
                padding: '2.5rem',
                textAlign: 'center',
                background: 'rgba(99,102,241,0.04)',
              }}
            >
              <div className="at-spinner at-spinner-lg mx-auto mb-3" style={{ margin: '0 auto 1rem' }} aria-hidden="true" />
              <div style={{ fontWeight: 600, color: 'var(--at-text-primary)', marginBottom: '0.75rem' }}>
                Processing your resume...
              </div>
              <div className="at-progress mx-auto" style={{ maxWidth: 280 }}>
                <div
                  className="at-progress-bar"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Upload progress ${progress}%`}
                />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--at-text-muted)', marginTop: '0.6rem' }}>
                {progress < 100 ? `Uploading… ${progress}%` : 'Extracting & indexing…'}
              </div>
            </div>
          </motion.div>
        )}

        {/* ---- IDLE / ERROR DROP ZONE ---- */}
        {!isUploading && !isSuccess && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload resume — drag and drop or click to browse"
              className="upload-dropzone"
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onClick={openFileDialog}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openFileDialog(); }}
              style={{
                border: `2px dashed ${isDragging ? 'var(--at-indigo)' : isError ? 'var(--at-danger)' : 'var(--at-border-hover)'}`,
                borderRadius: 'var(--at-radius-lg)',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging
                  ? 'rgba(99,102,241,0.07)'
                  : isError
                  ? 'var(--at-danger-bg)'
                  : 'rgba(255,255,255,0.02)',
                transition: 'all var(--at-transition)',
                outline: 'none',
              }}
            >
              <div
                className="upload-icon-bounce"
                style={{ fontSize: '3rem', marginBottom: '1rem', color: isDragging ? 'var(--at-indigo)' : 'var(--at-text-muted)' }}
                aria-hidden="true"
              >
                <i className="bi bi-file-earmark-arrow-up" />
              </div>

              <div style={{ fontWeight: 700, color: 'var(--at-text-primary)', fontSize: '1rem', marginBottom: '0.4rem' }}>
                {isDragging ? 'Drop your resume here' : 'Drop resume here or click to browse'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--at-text-muted)', marginBottom: '1rem' }}>
                Supported formats: PDF, DOCX — up to {MAX_SIZE_MB}MB
              </div>

              <div className="d-flex gap-2 justify-content-center">
                <span className="at-badge at-badge-accent" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-filetype-pdf me-1" />PDF
                </span>
                <span className="at-badge at-badge-accent" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-filetype-docx me-1" />DOCX
                </span>
              </div>
            </div>

            {/* Error message */}
            {(isError || fileError) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-danger mt-2 mb-0 d-flex align-items-center gap-2"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                {isError ? (uploadState as { status: 'error'; message: string }).message : fileError}
              </motion.div>
            )}

            {/* Hidden file input */}
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={onInputChange}
              style={{ display: 'none' }}
              aria-label="Select resume file"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeUpload;
