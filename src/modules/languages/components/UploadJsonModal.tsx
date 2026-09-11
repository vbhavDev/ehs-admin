'use client';
import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { UploadCloud, FileCode, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Language } from '../types/languages.types';

interface UploadJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language | null;
  onUpload: (params: { code: string; file: File; mode: 'merge' | 'replace' }) => Promise<unknown>;
}

export const UploadJsonModal: React.FC<UploadJsonModalProps> = ({
  isOpen,
  onClose,
  language,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [parsedKeyCount, setParsedKeyCount] = useState<number | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setParsedKeyCount(null);
    setJsonError(null);
    setMode('merge');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const countKeys = (obj: unknown): number => {
    if (!obj || typeof obj !== 'object') return 0;
    let count = 0;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        count += countKeys(value);
      } else {
        count += 1;
      }
    }
    return count;
  };

  const processFile = (file: File) => {
    setJsonError(null);
    setParsedKeyCount(null);

    if (!file.name.endsWith('.json')) {
      setJsonError('Only .json translation files are accepted.');
      setSelectedFile(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
          setJsonError('File root must be a valid JSON key-value object.');
          setSelectedFile(null);
          return;
        }
        const total = countKeys(parsed);
        setParsedKeyCount(total);
        setSelectedFile(file);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Invalid JSON format';
        setJsonError(`Invalid JSON syntax: ${errorMsg}`);
        setSelectedFile(null);
      }
    };
    reader.onerror = () => {
      setJsonError('Error reading the selected file.');
      setSelectedFile(null);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !language) return;

    try {
      setIsSubmitting(true);
      await onUpload({
        code: language.code,
        file: selectedFile,
        mode,
      });
      handleClose();
    } catch (error) {
      // Error handled by hook toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!language) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Upload Translation Catalog — ${language.name} (${language.code.toUpperCase()})`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {/* Language Badge Header */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
          <span className="text-2xl leading-none">{language.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white text-sm">
                {language.name} ({language.nativeName})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 font-bold">
                {language.code.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Current catalog contains {language.totalKeys} keys.
            </p>
          </div>
        </div>

        {/* File Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            selectedFile
              ? 'border-success-500 bg-success-50/20 dark:border-success-500/40 dark:bg-success-500/5'
              : jsonError
                ? 'border-error-500 bg-error-50/20 dark:border-error-500/40 dark:bg-error-500/5'
                : 'border-gray-300 dark:border-gray-700 hover:border-brand-500 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                selectedFile
                  ? 'bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400'
                  : 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
              }`}
            >
              {selectedFile ? <FileCode size={24} /> : <UploadCloud size={24} />}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop JSON file'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Must be a valid JSON dictionary file (e.g. {language.code}.json)
              </p>
            </div>
          </div>
        </div>

        {/* Validation Feedback */}
        {selectedFile && parsedKeyCount !== null && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400 border border-success-200 dark:border-success-500/20 text-xs">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>
              Valid translation JSON detected: <strong>{parsedKeyCount} keys</strong> ready to
              import.
            </span>
          </div>
        )}

        {jsonError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400 border border-error-200 dark:border-error-500/20 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{jsonError}</span>
          </div>
        )}

        {/* Import Strategy / Mode */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Import Strategy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                mode === 'merge'
                  ? 'border-brand-500 bg-brand-50/30 dark:border-brand-500/50 dark:bg-brand-500/10'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40'
              }`}
            >
              <input
                type="radio"
                name="importMode"
                value="merge"
                checked={mode === 'merge'}
                onChange={() => setMode('merge')}
                className="mt-0.5 text-brand-600 focus:ring-brand-500"
              />
              <div className="text-xs">
                <span className="font-bold text-gray-900 dark:text-white block">
                  Deep Merge (Recommended)
                </span>
                <span className="text-gray-500 mt-0.5 block">
                  Updates uploaded keys while preserving existing translations that aren&apos;t in
                  this file.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                mode === 'replace'
                  ? 'border-brand-500 bg-brand-50/30 dark:border-brand-500/50 dark:bg-brand-500/10'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40'
              }`}
            >
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={mode === 'replace'}
                onChange={() => setMode('replace')}
                className="mt-0.5 text-brand-600 focus:ring-brand-500"
              />
              <div className="text-xs">
                <span className="font-bold text-gray-900 dark:text-white block">Full Replace</span>
                <span className="text-gray-500 mt-0.5 block">
                  Completely wipes the catalog and replaces it with the contents of this uploaded
                  JSON file.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700/60">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!selectedFile || isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting && <RefreshCw size={16} className="animate-spin" />}
            {isSubmitting ? 'Importing...' : 'Upload & Import Catalog'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
