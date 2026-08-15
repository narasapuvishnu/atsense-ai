import { useState, useCallback, useRef } from 'react';

export interface FileUploadState {
  file: File | null;
  isDragging: boolean;
  error: string | null;
}

interface UseFileUploadOptions {
  accept: string[];
  maxSizeMB: number;
  onFile: (file: File) => void;
}

export const useFileUpload = ({ accept, maxSizeMB, onFile }: UseFileUploadOptions) => {
  const [state, setState] = useState<FileUploadState>({ file: null, isDragging: false, error: null });
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!accept.includes(ext)) {
      return `Unsupported file type. Allowed: ${accept.join(', ')}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size is ${maxSizeMB}MB.`;
    }
    return null;
  }, [accept, maxSizeMB]);

  const handleFile = useCallback((file: File) => {
    const err = validate(file);
    if (err) {
      setState(s => ({ ...s, error: err, isDragging: false }));
      return;
    }
    setState({ file, isDragging: false, error: null });
    onFile(file);
  }, [validate, onFile]);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState(s => ({ ...s, isDragging: true }));
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState(s => ({ ...s, isDragging: false }));
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
    else setState(s => ({ ...s, isDragging: false }));
  }, [handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const clearFile = useCallback(() => {
    setState({ file: null, isDragging: false, error: null });
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  return {
    ...state,
    inputRef,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onInputChange,
    openFileDialog,
    clearFile,
  };
};
