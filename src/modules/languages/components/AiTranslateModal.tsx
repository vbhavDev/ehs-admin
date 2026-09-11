'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  Language,
  AiGenerateTranslationResult,
  AiGenerateTranslationDto,
  AiStatusResponse,
  MessageRecord,
} from '../types/languages.types';
import { languagesService } from '../services/languages.service';
import toast from 'react-hot-toast';

interface AiTranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language | null;
  onGenerate: (dto: AiGenerateTranslationDto) => Promise<AiGenerateTranslationResult>;
  onSaveCatalog: (params: {
    code: string;
    messages: MessageRecord;
    mode: 'merge' | 'replace';
  }) => Promise<unknown>;
}

export const AiTranslateModal: React.FC<AiTranslateModalProps> = ({
  isOpen,
  onClose,
  language,
  onGenerate,
  onSaveCatalog,
}) => {
  const [step, setStep] = useState<'config' | 'review'>('config');
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [rememberKey, setRememberKey] = useState(true);
  const [customGuidelines, setCustomGuidelines] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatusResponse | null>(null);

  // Review step state
  const [generatedResult, setGeneratedResult] = useState<AiGenerateTranslationResult | null>(null);
  const [sourceMessages, setSourceMessages] = useState<MessageRecord>({});
  const [editedMessages, setEditedMessages] = useState<MessageRecord>({});
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'json'>('split');
  const [rawJsonString, setRawJsonString] = useState('');

  // Fetch AI plugins status from backend
  useEffect(() => {
    if (isOpen) {
      languagesService
        .getAiStatus()
        .then((res) => setAiStatus(res))
        .catch(() => {});
    }
  }, [isOpen]);

  // Restore remembered API keys from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedGeminiKey = localStorage.getItem('ehs_gemini_api_key') || '';
      const storedOpenAiKey = localStorage.getItem('ehs_openai_api_key') || '';
      if (provider === 'gemini' && storedGeminiKey) {
        setApiKey(storedGeminiKey);
      } else if (provider === 'openai' && storedOpenAiKey) {
        setApiKey(storedOpenAiKey);
      }
    }
  }, [provider, isOpen]);

  const handleProviderChange = (newProvider: 'gemini' | 'openai') => {
    setProvider(newProvider);
    if (typeof window !== 'undefined') {
      const stored =
        newProvider === 'gemini'
          ? localStorage.getItem('ehs_gemini_api_key') || ''
          : localStorage.getItem('ehs_openai_api_key') || '';
      setApiKey(stored);
    }
  };

  const handleClose = () => {
    setStep('config');
    setGeneratedResult(null);
    setEditedMessages({});
    setSearchQuery('');
    setSelectedNamespace('all');
    onClose();
  };

  const handleGenerate = async () => {
    if (!language) return;

    const currentPlugin = aiStatus ? aiStatus[provider] : null;
    if (currentPlugin && !currentPlugin.isEnabled) {
      toast.error('AI Plugin is disabled please contact admin for enabling.');
      return;
    }

    try {
      setIsGenerating(true);

      // Persist API key if requested
      if (typeof window !== 'undefined' && apiKey.trim()) {
        if (rememberKey) {
          localStorage.setItem(
            provider === 'gemini' ? 'ehs_gemini_api_key' : 'ehs_openai_api_key',
            apiKey.trim(),
          );
        }
      }

      const result = await onGenerate({
        targetCode: language.code,
        targetName: language.name,
        provider,
        apiKey: apiKey.trim() || undefined,
        customGuidelines: customGuidelines.trim() || undefined,
      });

      setGeneratedResult(result);
      setEditedMessages(result.messages);
      setRawJsonString(JSON.stringify(result.messages, null, 2));

      if (result.sourceMessages && Object.keys(result.sourceMessages).length > 0) {
        setSourceMessages(result.sourceMessages);
      } else {
        try {
          const enData = await languagesService.getCatalogMessages('en');
          if (enData && typeof enData === 'object') {
            setSourceMessages(enData);
          }
        } catch {
          // Fallback gracefully
        }
      }

      setStep('review');
      toast.success(`AI generated ${result.totalKeys} keys for ${language.name}!`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate AI translation';
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Flattens nested JSON object into dot-notated key-value pairs.
   */
  const flattenObject = (
    obj: Record<string, unknown>,
    prefix = '',
  ): Array<{ path: string; namespace: string; key: string; value: string }> => {
    const rows: Array<{
      path: string;
      namespace: string;
      key: string;
      value: string;
    }> = [];

    for (const [k, v] of Object.entries(obj)) {
      const currentPath = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        rows.push(...flattenObject(v as Record<string, unknown>, currentPath));
      } else {
        const parts = currentPath.split('.');
        const namespace = parts[0] || 'general';
        rows.push({
          path: currentPath,
          namespace,
          key: parts.slice(1).join('.'),
          value: String(v),
        });
      }
    }
    return rows;
  };

  /**
   * Updates a deep nested key in the editedMessages object.
   */
  const handleKeyEdit = (path: string, newValue: string) => {
    setEditedMessages((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let current = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]!;
        if (!current[part]) current[part] = {};
        current = current[part];
      }
      const lastKey = parts[parts.length - 1]!;
      current[lastKey] = newValue;
      setRawJsonString(JSON.stringify(clone, null, 2));
      return clone;
    });
  };

  const handleRawJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawJsonString(val);
    try {
      const parsed = JSON.parse(val);
      setEditedMessages(parsed);
    } catch {
      // Allow user to keep typing
    }
  };

  // Extract all unique namespaces
  const namespaces = useMemo(() => {
    if (!editedMessages) return ['all'];
    const keys = Object.keys(editedMessages);
    return ['all', ...keys];
  }, [editedMessages]);

  // Flatten for table display
  const flattenedEntries = useMemo(() => {
    return flattenObject(editedMessages);
  }, [editedMessages]);

  // Filtered rows for review
  const filteredEntries = useMemo(() => {
    return flattenedEntries.filter((item) => {
      const matchesNamespace = selectedNamespace === 'all' || item.namespace === selectedNamespace;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        item.path.toLowerCase().includes(query) ||
        item.value.toLowerCase().includes(query);
      return matchesNamespace && matchesSearch;
    });
  }, [flattenedEntries, selectedNamespace, searchQuery]);

  // Get source English string for a given path
  const getSourceValue = (path: string): string => {
    const parts = path.split('.');
    let cur: unknown = sourceMessages;
    for (const part of parts) {
      if (!cur || typeof cur !== 'object') return '';
      cur = (cur as Record<string, unknown>)[part];
    }
    return typeof cur === 'string' ? cur : '';
  };

  const handleDownloadDraft = () => {
    if (!language) return;
    const blob = new Blob([rawJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${language.code}-ai-translation.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded translation draft JSON');
  };

  const handleApproveAndSave = async () => {
    if (!language) return;

    try {
      setIsSaving(true);
      // Validate JSON syntax
      let finalMessages: MessageRecord;
      try {
        finalMessages = JSON.parse(rawJsonString) as MessageRecord;
      } catch {
        toast.error('JSON syntax error. Please fix the JSON before saving.');
        setViewMode('json');
        return;
      }

      await onSaveCatalog({
        code: language.code,
        messages: finalMessages,
        mode: 'replace',
      });

      handleClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to publish catalog';
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={step === 'review' ? '5xl' : 'lg'}
      className="p-6 md:p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-navy-700">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                AI Translation Generator
              </h2>
              {language && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
                  <span>{language.flag || '🌐'}</span>
                  <span>{language.name}</span>
                  <span className="uppercase text-[11px] opacity-75">({language.code})</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {step === 'config'
                ? 'Generate native translation dictionary using Gemini or OpenAI'
                : 'Review, edit, and approve translated strings before publishing'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {language && (
            <Link
              href={`/languages/translate?code=${language.code}`}
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors mr-6"
            >
              <ExternalLink size={13} />
              Open in Studio Page
            </Link>
          )}

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                step === 'config'
                  ? 'bg-brand-600 text-white'
                  : 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400'
              }`}
            >
              1
            </span>
            <div className="w-4 h-0.5 bg-gray-200 dark:bg-navy-700" />
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                step === 'review'
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-200 text-gray-600 dark:bg-navy-800 dark:text-gray-400'
              }`}
            >
              2
            </span>
          </div>
        </div>
      </div>

      {/* STEP 1: CONFIGURATION */}
      {step === 'config' && (
        <div className="space-y-5 pt-5">
          {/* Provider Selection Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Select AI Engine (Pulled from Plugins)
              </label>
              <a
                href="/plugins"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Manage Plugins</span>
                <span>→</span>
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  provider === 'gemini'
                    ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-500/10 ring-2 ring-brand-500/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-navy-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-brand-600 dark:text-brand-400" />
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Google Gemini
                    </span>
                  </div>
                  {aiStatus?.gemini?.isEnabled ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-success-100 text-success-800 dark:bg-success-500/20 dark:text-success-400">
                      Active Plugin
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-error-100 text-error-800 dark:bg-error-500/20 dark:text-error-400">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ultra-fast Gemini 3.6 Flash with structured JSON output and deep domain context.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleProviderChange('openai')}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  provider === 'openai'
                    ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-500/10 ring-2 ring-brand-500/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-navy-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <Bot size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-sm text-gray-900 dark:text-white">OpenAI</span>
                  </div>
                  {aiStatus?.openai?.isEnabled ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-success-100 text-success-800 dark:bg-success-500/20 dark:text-success-400">
                      Active Plugin
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-error-100 text-error-800 dark:bg-error-500/20 dark:text-error-400">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  OpenAI GPT-4o with json_object enforcement and high translation accuracy.
                </p>
              </button>
            </div>
          </div>

          {/* Plugin Status Alert Banner */}
          {aiStatus && !aiStatus[provider]?.isEnabled ? (
            <div className="p-4 rounded-xl border border-error-300 dark:border-error-500/30 bg-error-50/90 dark:bg-error-500/10 flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-error-600 dark:text-error-400 mt-0.5 shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-error-900 dark:text-error-200">
                    AI Plugin is disabled please contact admin for enabling.
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-300 uppercase">
                    Disabled
                  </span>
                </div>
                <p className="text-xs text-error-700 dark:text-error-300 mt-1">
                  The {provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} AI plugin is currently
                  disabled in system settings. You must enable it before generating automated
                  translations.
                </p>
                <div className="mt-2.5">
                  <a
                    href="/plugins"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-600 hover:bg-error-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Enable Plugin in Plugins & Integrations</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          ) : aiStatus && aiStatus[provider]?.isEnabled && aiStatus[provider]?.hasKey ? (
            <div className="p-3.5 rounded-xl border border-success-200 dark:border-success-500/30 bg-success-50/70 dark:bg-success-500/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="text-success-600 dark:text-success-400 shrink-0"
                />
                <span className="text-success-900 dark:text-success-200">
                  <strong>{aiStatus[provider]?.name}</strong> is enabled. Keys will be pulled
                  automatically from the Plugin model.
                </span>
              </div>
              <a
                href="/plugins"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-success-700 dark:text-success-300 hover:underline font-medium ml-2"
              >
                Plugin Settings →
              </a>
            </div>
          ) : null}

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {provider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'} (Optional)
              </label>
              <span className="text-[11px] text-gray-400">
                Leave blank to use server environment key
              </span>
            </div>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                placeholder={`Paste ${provider === 'gemini' ? 'AIzaSy...' : 'sk-...'} key (optional)`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberKey}
                  onChange={(e) => setRememberKey(e.target.checked)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                Remember this key in my browser
              </label>
              <a
                href={
                  provider === 'gemini'
                    ? 'https://aistudio.google.com/app/apikey'
                    : 'https://platform.openai.com/api-keys'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:underline"
              >
                Get {provider === 'gemini' ? 'Gemini' : 'OpenAI'} Key →
              </a>
            </div>
          </div>

          {/* Custom Guidelines */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Custom Translation Guidelines (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Use formal French phrasing; prioritize industrial factory inspection safety terminology..."
              value={customGuidelines}
              onChange={(e) => setCustomGuidelines(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-navy-700 bg-transparent p-3 text-xs text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Safety Notice */}
          <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-500/5 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Automated Parity Protection:</span> All application
              keys and interpolation tokens (e.g.{' '}
              <code className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded">{`{count}`}</code>
              ) are automatically guarded against alterations. You will review all translated text
              before saving.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-navy-700">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || (!!aiStatus && !aiStatus[provider]?.isEnabled)}
              title={
                aiStatus && !aiStatus[provider]?.isEnabled
                  ? 'AI Plugin is disabled please contact admin for enabling.'
                  : undefined
              }
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={16} className={isGenerating ? 'animate-spin' : ''} />
              {isGenerating
                ? 'Translating entire catalog...'
                : aiStatus && !aiStatus[provider]?.isEnabled
                  ? 'AI Plugin Disabled'
                  : '✨ Generate Translation'}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: INTERACTIVE REVIEW & LIVE EDIT */}
      {step === 'review' && (
        <div className="space-y-4 pt-4">
          {/* Top Review Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-success-200/60 dark:border-success-500/20 bg-success-50/40 dark:bg-success-500/5">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-success-600 dark:text-success-400" />
              <div>
                <span className="text-xs font-bold text-success-900 dark:text-success-300">
                  Translation Generated Successfully
                </span>
                <p className="text-[11px] text-success-700 dark:text-success-400">
                  Engine:{' '}
                  <span className="font-semibold uppercase">{generatedResult?.providerUsed}</span> |
                  Total Keys: <span className="font-semibold">{generatedResult?.totalKeys}</span>{' '}
                  (100% matched with English source)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadDraft}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-navy-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
                title="Download JSON draft"
              >
                <Download size={14} />
                Download JSON
              </button>

              <div className="flex items-center rounded-lg border border-gray-200 dark:border-navy-700 p-0.5 bg-gray-100 dark:bg-navy-900">
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'split'
                      ? 'bg-white dark:bg-navy-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
                  }`}
                >
                  Side-by-Side Review
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('json')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'json'
                      ? 'bg-white dark:bg-navy-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
                  }`}
                >
                  Raw JSON
                </button>
              </div>
            </div>
          </div>

          {/* Filters Bar (Only for split view) */}
          {viewMode === 'split' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Namespace Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                {namespaces.map((ns) => (
                  <button
                    key={ns}
                    type="button"
                    onClick={() => setSelectedNamespace(ns)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${
                      selectedNamespace === ns
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700'
                    }`}
                  >
                    {ns}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter keys or text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-navy-700 bg-transparent text-xs text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {/* Content: Split Side-by-Side View */}
          {viewMode === 'split' ? (
            <div className="border border-gray-200 dark:border-navy-700 rounded-xl overflow-hidden">
              <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100 dark:divide-navy-800">
                {filteredEntries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    No keys matched your search filter.
                  </div>
                ) : (
                  filteredEntries.map((entry) => {
                    const sourceText = getSourceValue(entry.path);

                    return (
                      <div
                        key={entry.path}
                        className="p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center hover:bg-gray-50/50 dark:hover:bg-navy-800/50 transition-colors"
                      >
                        {/* Key Name */}
                        <div className="md:col-span-3">
                          <span
                            className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300 block truncate"
                            title={entry.path}
                          >
                            {entry.path}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                            {entry.namespace}
                          </span>
                        </div>

                        {/* English Source */}
                        <div className="md:col-span-4 bg-gray-50 dark:bg-navy-900/60 p-2 rounded-lg border border-gray-200/50 dark:border-navy-700">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                            English Reference
                          </span>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {sourceText || '—'}
                          </p>
                        </div>

                        {/* Translated Target (Editable!) */}
                        <div className="md:col-span-5">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400">
                              {language?.name} (Editable)
                            </span>
                          </div>
                          <input
                            type="text"
                            value={entry.value}
                            onChange={(e) => handleKeyEdit(entry.path, e.target.value)}
                            className="w-full h-8 px-2.5 rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-900 text-xs text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Raw JSON Editor */
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Raw JSON Catalog
                </span>
                <span className="text-[11px] text-gray-400">
                  Direct edits will be validated and applied on save
                </span>
              </div>
              <textarea
                rows={16}
                value={rawJsonString}
                onChange={handleRawJsonChange}
                className="w-full font-mono text-xs p-4 rounded-xl border border-gray-300 dark:border-navy-700 bg-gray-50 dark:bg-navy-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-500 leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-navy-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('config')}
              disabled={isSaving}
              className="flex items-center gap-1.5 text-xs"
            >
              <RefreshCw size={14} />
              Back to Configuration
            </Button>

            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleApproveAndSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-success-600 hover:bg-success-700 text-white font-semibold"
              >
                <Check size={16} />
                {isSaving ? 'Publishing catalog...' : 'Approve & Save Catalog'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
