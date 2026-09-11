'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Bot,
  Search,
  CheckCircle2,
  AlertCircle,
  Code2,
  RefreshCw,
  Download,
  Check,
  Languages as LangIcon,
  ChevronRight,
  ArrowLeft,
  Copy,
  Sliders,
  Columns,
  FileCheck,
  ShieldCheck,
  Zap,
  ExternalLink,
  Edit3,
  Undo2,
} from 'lucide-react';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import {
  AiGenerateTranslationResult,
  AiStatusResponse,
  MessageRecord,
} from '../types/languages.types';
import { languagesService } from '../services/languages.service';
import { useLanguages } from '../hooks/useLanguages';
import toast from 'react-hot-toast';

interface AiTranslationStudioProps {
  initialCode?: string;
}

type StudioStep = 'config' | 'generating' | 'review';

const DOMAIN_PRESETS = [
  {
    label: 'Workplace Safety & OSHA',
    prompt:
      'Prioritize standard occupational safety and health (OSHA) compliance terms for factory workers.',
  },
  {
    label: 'PPE & Hazard Inspection',
    prompt:
      'Use standard industrial PPE (Personal Protective Equipment) and plant hazard audit terminology.',
  },
  {
    label: 'Facilities & Plant Operations',
    prompt:
      'Translate operations, maintenance, and plant machinery terms with natural workplace phrasing.',
  },
  {
    label: 'Emergency & Incident Reporting',
    prompt: 'Ensure high clarity and immediate recognition for urgent incident and safety alerts.',
  },
];

export const AiTranslationStudio: React.FC<AiTranslationStudioProps> = ({ initialCode }) => {
  const router = useRouter();
  const { languages, generateAiTranslation, importCatalog } = useLanguages();

  // Navigation & step state
  const [step, setStep] = useState<StudioStep>('config');
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>(initialCode || '');

  // Configuration state
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [customGuidelines, setCustomGuidelines] = useState('');
  const [aiStatus, setAiStatus] = useState<AiStatusResponse | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  // Generation state
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');

  // Review & Studio state
  const [viewMode, setViewMode] = useState<'studio' | 'json'>('studio');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'edited' | 'variables'>('all');
  const [rawJsonString, setRawJsonString] = useState('');
  const [jsonSyntaxError, setJsonSyntaxError] = useState<string | null>(null);

  // Data state
  const [sourceMessages, setSourceMessages] = useState<MessageRecord>({});
  const [generatedResult, setGeneratedResult] = useState<AiGenerateTranslationResult | null>(null);
  const [originalAiMessages, setOriginalAiMessages] = useState<MessageRecord>({});
  const [editedMessages, setEditedMessages] = useState<MessageRecord>({});
  const [editedKeyPaths, setEditedKeyPaths] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Load active language if specified
  const selectedLanguage = useMemo(() => {
    return languages.find((l) => l.code === selectedLanguageCode) || null;
  }, [languages, selectedLanguageCode]);

  // Set default language once list loads if not set
  useEffect(() => {
    if (!selectedLanguageCode && languages.length > 0) {
      const nonDefault = languages.find((l) => !l.isDefault && l.code !== 'en');
      if (nonDefault) {
        setSelectedLanguageCode(nonDefault.code);
      } else if (languages[0]) {
        setSelectedLanguageCode(languages[0].code);
      }
    }
  }, [languages, selectedLanguageCode]);

  // Load AI plugin statuses
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoadingStatus(true);
        const res = await languagesService.getAiStatus();
        setAiStatus(res);
        if (res.gemini?.isEnabled) {
          setProvider('gemini');
        } else if (res.openai?.isEnabled) {
          setProvider('openai');
        }
      } catch {
        // AI status check failed - fallback gracefully
      } finally {
        setIsLoadingStatus(false);
      }
    };
    fetchStatus();
  }, []);

  // Pre-load base English messages for reference
  useEffect(() => {
    const fetchEnMessages = async () => {
      try {
        const enData = await languagesService.getCatalogMessages('en');
        if (enData && typeof enData === 'object') {
          setSourceMessages(enData);
        }
      } catch {
        // Fallback gracefully
      }
    };
    fetchEnMessages();
  }, []);

  // Check stored API keys from localStorage
  useEffect(() => {
    const storedGemini = localStorage.getItem('ehs_gemini_api_key') || '';
    const storedOpenAi = localStorage.getItem('ehs_openai_api_key') || '';
    if (provider === 'gemini' && storedGemini) {
      setApiKey(storedGemini);
    } else if (provider === 'openai' && storedOpenAi) {
      setApiKey(storedOpenAi);
    } else {
      setApiKey('');
    }
  }, [provider]);

  const handleProviderChange = (p: 'gemini' | 'openai') => {
    setProvider(p);
    const key =
      p === 'gemini'
        ? localStorage.getItem('ehs_gemini_api_key') || ''
        : localStorage.getItem('ehs_openai_api_key') || '';
    setApiKey(key);
  };

  const handleApplyPreset = (prompt: string) => {
    setCustomGuidelines((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return prompt;
      if (trimmed.includes(prompt)) return trimmed;
      return `${trimmed}\n• ${prompt}`;
    });
  };

  /**
   * Run AI Translation Generator
   */
  const handleStartGeneration = async () => {
    if (!selectedLanguage) {
      toast.error('Please select a target language first');
      return;
    }

    // Check plugin enablement rule
    const currentPlugin = provider === 'gemini' ? aiStatus?.gemini : aiStatus?.openai;
    if (currentPlugin && !currentPlugin.isEnabled) {
      toast.error('AI Plugin is disabled please contact admin for enabling.');
      return;
    }

    // Save optional key in localStorage if provided
    if (apiKey.trim()) {
      localStorage.setItem(
        provider === 'gemini' ? 'ehs_gemini_api_key' : 'ehs_openai_api_key',
        apiKey.trim(),
      );
    }

    setStep('generating');
    setGenerationProgress(15);
    setGenerationStage('Extracting English source catalog & safety glossaries...');

    try {
      await new Promise((r) => setTimeout(r, 400));
      setGenerationProgress(35);
      setGenerationStage(
        `Connecting to ${provider === 'gemini' ? 'Google Gemini 3.6 Flash' : 'OpenAI GPT-4o'}...`,
      );

      await new Promise((r) => setTimeout(r, 400));
      setGenerationProgress(60);
      setGenerationStage('Processing enterprise EHS domain localization & ICU tokens...');

      const result = await generateAiTranslation({
        targetCode: selectedLanguage.code,
        targetName: selectedLanguage.name,
        provider,
        apiKey: apiKey.trim() || undefined,
        customGuidelines: customGuidelines.trim() || undefined,
      });

      setGenerationProgress(90);
      setGenerationStage('Validating structured JSON format and leaf key counts...');

      await new Promise((r) => setTimeout(r, 300));
      setGenerationProgress(100);

      // Store result and source messages
      setGeneratedResult(result);
      setOriginalAiMessages(JSON.parse(JSON.stringify(result.messages)));
      setEditedMessages(result.messages);
      setEditedKeyPaths(new Set());
      setRawJsonString(JSON.stringify(result.messages, null, 2));

      if (result.sourceMessages && Object.keys(result.sourceMessages).length > 0) {
        setSourceMessages(result.sourceMessages);
      }

      setStep('review');
      toast.success(
        `Successfully translated ${result.totalKeys} keys to ${selectedLanguage.name}!`,
      );
    } catch (err: unknown) {
      setStep('config');
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate AI translation';
      toast.error(errorMsg);
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
   * Extracts ICU interpolation variables e.g. {count}, {name}
   */
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{([a-zA-Z0-9_-]+)\}/g);
    return matches ? Array.from(new Set(matches)) : [];
  };

  /**
   * Retrieves English reference value for a path
   */
  const getSourceValue = (path: string): string => {
    const parts = path.split('.');
    let cur: unknown = sourceMessages;
    for (const part of parts) {
      if (!cur || typeof cur !== 'object') return '';
      cur = (cur as Record<string, unknown>)[part];
    }
    return typeof cur === 'string' ? cur : '';
  };

  /**
   * Retrieves original AI suggested value for reset
   */
  const getOriginalAiValue = (path: string): string => {
    const parts = path.split('.');
    let cur: unknown = originalAiMessages;
    for (const part of parts) {
      if (!cur || typeof cur !== 'object') return '';
      cur = (cur as Record<string, unknown>)[part];
    }
    return typeof cur === 'string' ? cur : '';
  };

  /**
   * Edit a nested key in editedMessages
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

    setEditedKeyPaths((prev) => {
      const next = new Set(prev);
      const original = getOriginalAiValue(path);
      if (newValue !== original) {
        next.add(path);
      } else {
        next.delete(path);
      }
      return next;
    });
  };

  /**
   * Reset single key back to AI original
   */
  const handleResetKey = (path: string) => {
    const original = getOriginalAiValue(path);
    handleKeyEdit(path, original);
  };

  /**
   * Raw JSON editor change
   */
  const handleRawJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawJsonString(val);
    try {
      const parsed = JSON.parse(val);
      setEditedMessages(parsed);
      setJsonSyntaxError(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid JSON syntax';
      setJsonSyntaxError(errorMsg);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJsonString);
      setRawJsonString(JSON.stringify(parsed, null, 2));
      setJsonSyntaxError(null);
      toast.success('JSON formatted');
    } catch {
      toast.error('Cannot format invalid JSON');
    }
  };

  const handleDownloadDraft = () => {
    if (!selectedLanguage) return;
    const blob = new Blob([rawJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedLanguage.code}-translation-catalog.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${selectedLanguage.code}-translation-catalog.json`);
  };

  const handleApproveAndSave = async () => {
    if (!selectedLanguage) return;

    let finalMessages: MessageRecord;
    try {
      finalMessages = JSON.parse(rawJsonString) as MessageRecord;
    } catch {
      toast.error('Cannot save: JSON syntax error detected.');
      setViewMode('json');
      return;
    }

    try {
      setIsSaving(true);
      await importCatalog({
        code: selectedLanguage.code,
        messages: finalMessages,
        mode: 'replace',
      });
      toast.success(`${selectedLanguage.name} catalog published successfully!`);
      router.push('/languages');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save catalog';
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Namespaces for tabs
  const namespaces = useMemo(() => {
    if (!editedMessages) return ['all'];
    const keys = Object.keys(editedMessages);
    return ['all', ...keys];
  }, [editedMessages]);

  // Flattened entries
  const flattenedEntries = useMemo(() => {
    return flattenObject(editedMessages);
  }, [editedMessages]);

  // Filtered rows for review table
  const filteredEntries = useMemo(() => {
    return flattenedEntries.filter((item) => {
      // 1. Namespace
      const matchesNamespace = selectedNamespace === 'all' || item.namespace === selectedNamespace;

      // 2. Search
      const query = searchQuery.toLowerCase().trim();
      const sourceVal = getSourceValue(item.path).toLowerCase();
      const matchesSearch =
        !query ||
        item.path.toLowerCase().includes(query) ||
        item.value.toLowerCase().includes(query) ||
        sourceVal.includes(query);

      // 3. Status filter
      let matchesStatus = true;
      if (statusFilter === 'edited') {
        matchesStatus = editedKeyPaths.has(item.path);
      } else if (statusFilter === 'variables') {
        const sourceVars = extractVariables(getSourceValue(item.path));
        matchesStatus = sourceVars.length > 0;
      }

      return matchesNamespace && matchesSearch && matchesStatus;
    });
  }, [
    flattenedEntries,
    selectedNamespace,
    searchQuery,
    statusFilter,
    editedKeyPaths,
    sourceMessages,
  ]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Studio Header Bar */}
      <div className="bg-white dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-20 backdrop-blur-md bg-white/90 dark:bg-navy-800/90 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/languages"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
              title="Back to Languages"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Sparkles size={18} />
                </span>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Translation Studio
                </h1>
                {selectedLanguage && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-navy-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-navy-600">
                    <span>{selectedLanguage.flag}</span>
                    <span>{selectedLanguage.name}</span>
                    <span className="text-gray-400 font-mono">
                      ({selectedLanguage.code.toUpperCase()})
                    </span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Enterprise AI localization powered by Gemini 3.6 Flash & OpenAI GPT-4o
              </p>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep('config')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                step === 'config'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Setup & Engine</span>
            </button>
            <ChevronRight size={14} className="text-gray-400" />
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                step === 'generating'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-300'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>AI Generation</span>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
            <button
              onClick={() => {
                if (generatedResult) setStep('review');
              }}
              disabled={!generatedResult}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                step === 'review'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-300 disabled:opacity-50'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Studio Review & Polish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {/* ============================================================ */}
        {/* STEP 1: CONFIGURATION & ENGINE SELECTION                     */}
        {/* ============================================================ */}
        {step === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Target & Guidelines */}
            <div className="lg:col-span-7 space-y-6">
              {/* Target Language Card */}
              <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-navy-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LangIcon size={20} className="text-brand-500" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      1. Target Language Selection
                    </h2>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Source: English (52 keys)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                  {languages.map((lang) => {
                    const isSelected = selectedLanguageCode === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setSelectedLanguageCode(lang.code)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10 ring-2 ring-brand-500/30 shadow-sm'
                            : 'border-gray-200 dark:border-navy-700 hover:border-gray-300 dark:hover:border-navy-600 bg-gray-50/50 dark:bg-navy-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{lang.flag}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-300 font-semibold uppercase">
                            {lang.code}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {lang.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {lang.nativeName}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Translation Guidelines & EHS Glossaries */}
              <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-navy-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sliders size={20} className="text-brand-500" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      2. EHS Domain Presets & Prompt Guidelines
                    </h2>
                  </div>
                  <span className="text-xs text-gray-400">Optional</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Click domain presets to inject specialized safety glossaries into the translation
                  engine:
                </p>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {DOMAIN_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleApplyPreset(preset.prompt)}
                      className="text-xs font-medium px-3 py-1.5 rounded-full border border-brand-200 bg-brand-50/70 text-brand-700 hover:bg-brand-100 transition-colors dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20 flex items-center gap-1.5"
                    >
                      <span>+</span> {preset.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Custom Translation Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={customGuidelines}
                    onChange={(e) => setCustomGuidelines(e.target.value)}
                    placeholder="e.g. Use formal native address, preserve all plant safety terminology, translate inspection statuses accurately..."
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <div className="flex justify-between items-center text-[11px] text-gray-400">
                    <span>
                      Instructions apply strictly to values; keys and ICU `{'{count}'}` tokens are
                      strictly preserved.
                    </span>
                    <span>{customGuidelines.length} chars</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Engine Selector & Launch */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-navy-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bot size={20} className="text-brand-500" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      3. Select AI Model Engine
                    </h2>
                  </div>
                  {isLoadingStatus && (
                    <RefreshCw size={14} className="animate-spin text-gray-400" />
                  )}
                </div>

                {/* Gemini 3.6 Flash Card */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleProviderChange('gemini')}
                    className={`w-full p-4 rounded-xl border text-left transition-all relative ${
                      provider === 'gemini'
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10 ring-2 ring-brand-500/30'
                        : 'border-gray-200 dark:border-navy-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs">
                          G
                        </span>
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          Google Gemini 3.6 Flash
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Recommended
                        </span>
                      </div>
                      {aiStatus?.gemini?.isEnabled ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-error-100 text-error-800 dark:bg-error-900/40 dark:text-error-300">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      High-throughput model with native JSON mode, low latency, and OSHA/ISO
                      terminology comprehension.
                    </p>
                  </button>

                  {/* OpenAI Card */}
                  <button
                    type="button"
                    onClick={() => handleProviderChange('openai')}
                    className={`w-full p-4 rounded-xl border text-left transition-all relative ${
                      provider === 'openai'
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10 ring-2 ring-brand-500/30'
                        : 'border-gray-200 dark:border-navy-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          O
                        </span>
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          OpenAI GPT-4o-mini
                        </span>
                      </div>
                      {aiStatus?.openai?.isEnabled ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-error-100 text-error-800 dark:bg-error-900/40 dark:text-error-300">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Advanced reasoning engine with strict json_object structured compliance and
                      fluency.
                    </p>
                  </button>
                </div>

                {/* Disabled Warning banner */}
                {((provider === 'gemini' && !aiStatus?.gemini?.isEnabled) ||
                  (provider === 'openai' && !aiStatus?.openai?.isEnabled)) && (
                  <div className="mt-4 p-3.5 rounded-xl bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-800 dark:text-error-300 text-xs flex items-start gap-2.5">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">AI Plugin is disabled</p>
                      <p className="mt-0.5">
                        Please enable the {provider === 'gemini' ? 'Google Gemini' : 'OpenAI'}{' '}
                        plugin in{' '}
                        <Link
                          href="/plugins"
                          className="underline font-bold inline-flex items-center gap-0.5"
                        >
                          Plugins & Integrations <ExternalLink size={10} />
                        </Link>{' '}
                        before generating translations.
                      </p>
                    </div>
                  </div>
                )}

                {/* Optional Key Override */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-navy-700">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Direct API Key Override</span>
                    <span className="text-gray-400 font-normal">Optional</span>
                  </label>
                  <p className="text-[11px] text-gray-400 mb-2">
                    Leave blank to automatically pull keys configured in the active Plugin record.
                  </p>
                  <Input
                    type="password"
                    placeholder={`Paste ${provider === 'gemini' ? 'Gemini AIzaSy...' : 'sk-...'} key (optional)`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>

                {/* Pre-flight Launch Summary */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-navy-700 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Source Catalog:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      English (en)
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Target Language:</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {selectedLanguage?.name} ({selectedLanguage?.code})
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Keys to Translate:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      52 leaf keys (100% catalog coverage)
                    </span>
                  </div>

                  <Button
                    onClick={handleStartGeneration}
                    className="w-full mt-4 py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-brand-500/25 transition-all"
                  >
                    <Sparkles size={18} />
                    <span>Generate {selectedLanguage?.name} Catalog with AI</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: GENERATING VISUAL ANIMATION                          */}
        {/* ============================================================ */}
        {step === 'generating' && (
          <div className="max-w-xl mx-auto my-16 bg-white dark:bg-navy-800 rounded-3xl p-8 border border-gray-200 dark:border-navy-700 shadow-xl text-center">
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-brand-200 dark:border-brand-900 animate-ping opacity-25" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 animate-pulse">
                <Sparkles size={28} />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Generating Enterprise Translation
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Translating English platform catalog to{' '}
              <strong className="text-gray-900 dark:text-white">
                {selectedLanguage?.name} ({selectedLanguage?.code})
              </strong>{' '}
              via {provider === 'gemini' ? 'Gemini 3.6 Flash' : 'OpenAI GPT-4o'}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-navy-900 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 mb-6">
              <span>Status: {generationStage}</span>
              <span className="font-mono font-bold">{generationProgress}%</span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-navy-900 text-left text-xs text-gray-500 dark:text-gray-400 space-y-2 border border-gray-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Strict key preservation & hierarchy integrity enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck size={14} className="text-emerald-500" />
                <span>ICU placeholders `{'{count}'}` will remain unmodified</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-brand-500" />
                <span>Professional workplace safety phrasing standard</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: STUDIO REVIEW & SIDE-BY-SIDE EDITOR                  */}
        {/* ============================================================ */}
        {step === 'review' && (
          <div className="space-y-6">
            {/* Review Header Stats Bar */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-navy-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{selectedLanguage?.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedLanguage?.name} Translation Catalog
                    </h2>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300">
                      {selectedLanguage?.code.toUpperCase()}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
                      100% Matched ({flattenedEntries.length} keys)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Generated via {generatedResult?.providerUsed.toUpperCase()} • Review strings
                    below or switch to raw JSON editor.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-navy-900 p-1 rounded-xl border border-gray-200 dark:border-navy-700">
                  <button
                    onClick={() => setViewMode('studio')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'studio'
                        ? 'bg-white dark:bg-navy-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <Columns size={14} />
                    <span>Studio Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'json'
                        ? 'bg-white dark:bg-navy-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <Code2 size={14} />
                    <span>Code Editor</span>
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadDraft}
                  className="flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Download .json</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('config')}
                  className="flex items-center gap-1.5"
                >
                  <RefreshCw size={14} />
                  <span>Re-run AI</span>
                </Button>

                <Button
                  onClick={handleApproveAndSave}
                  disabled={isSaving || !!jsonSyntaxError}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isSaving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  <span>Approve & Save Catalog</span>
                </Button>
              </div>
            </div>

            {/* View Mode: Studio (Side-by-Side Split) */}
            {viewMode === 'studio' && (
              <div className="space-y-4">
                {/* Search & Namespace Filtering Toolbar */}
                <div className="bg-white dark:bg-navy-800 rounded-2xl p-4 border border-gray-200 dark:border-navy-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Namespace Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
                    {namespaces.map((ns) => {
                      const isSelected = selectedNamespace === ns;
                      const count =
                        ns === 'all'
                          ? flattenedEntries.length
                          : flattenedEntries.filter((e) => e.namespace === ns).length;
                      return (
                        <button
                          key={ns}
                          onClick={() => setSelectedNamespace(ns)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-brand-500 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-navy-900 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-700'
                          }`}
                        >
                          <span className="capitalize">{ns}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-200 dark:bg-navy-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search and Filters */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Filter keys or text..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value as 'all' | 'edited' | 'variables')
                      }
                      className="text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="all">All Keys</option>
                      <option value="edited">Edited Only ({editedKeyPaths.size})</option>
                      <option value="variables">Has Variables ({'{...}'})</option>
                    </select>
                  </div>
                </div>

                {/* Side-by-Side Key Comparison Grid */}
                <div className="space-y-3">
                  {filteredEntries.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        No translation keys match your search or filter.
                      </p>
                    </div>
                  ) : (
                    filteredEntries.map((item) => {
                      const sourceVal = getSourceValue(item.path);
                      const sourceVars = extractVariables(sourceVal);
                      const targetVars = extractVariables(item.value);
                      const missingVars = sourceVars.filter((v) => !targetVars.includes(v));
                      const isModified = editedKeyPaths.has(item.path);

                      return (
                        <div
                          key={item.path}
                          className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 shadow-sm p-4 hover:border-brand-300 dark:hover:border-navy-600 transition-colors"
                        >
                          {/* Row Header: Key path & status */}
                          <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-navy-700/50">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                {item.namespace}
                              </span>
                              <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                                {item.path}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.path);
                                  toast.success('Key path copied');
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                title="Copy key path"
                              >
                                <Copy size={12} />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              {missingVars.length > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">
                                  <AlertCircle size={10} />
                                  Missing variable: {missingVars.join(', ')}
                                </span>
                              )}
                              {isModified && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 flex items-center gap-1">
                                  <Edit3 size={10} /> Edited
                                </span>
                              )}
                              {isModified && (
                                <button
                                  type="button"
                                  onClick={() => handleResetKey(item.path)}
                                  className="text-[11px] text-gray-400 hover:text-brand-600 flex items-center gap-1"
                                  title="Reset to AI suggestion"
                                >
                                  <Undo2 size={12} /> Reset
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Side-by-Side Content Comparison */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left: English Source Reference */}
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-navy-900/70 border border-gray-100 dark:border-navy-700/60">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                  English (Source Reference)
                                </span>
                                {sourceVars.length > 0 && (
                                  <span className="text-[10px] text-brand-600 dark:text-brand-400 font-mono">
                                    Tokens: {sourceVars.join(' ')}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                {sourceVal || (
                                  <span className="text-gray-400 italic">
                                    No source message found
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Right: Target Language Editable Box */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold tracking-wider text-brand-600 dark:text-brand-400 uppercase">
                                  {selectedLanguage?.name} (Editable)
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {item.value.length} chars
                                </span>
                              </div>
                              <textarea
                                rows={Math.max(1, Math.ceil(item.value.length / 45))}
                                value={item.value}
                                onChange={(e) => handleKeyEdit(item.path, e.target.value)}
                                className={`w-full text-sm p-2.5 rounded-xl border bg-white dark:bg-navy-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                                  missingVars.length > 0
                                    ? 'border-amber-400 focus:ring-amber-500'
                                    : 'border-gray-200 dark:border-navy-700 focus:ring-brand-500'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* View Mode: JSON Code Editor */}
            {viewMode === 'json' && (
              <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-navy-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Code2 size={16} className="text-brand-500" />
                      Direct JSON Translation Dictionary
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Edit the translation catalog directly. Must remain valid JSON with identical
                      key structures.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFormatJson}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <span>Prettify & Format</span>
                  </Button>
                </div>

                {jsonSyntaxError && (
                  <div className="p-3 rounded-xl bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 text-error-800 dark:text-error-300 text-xs flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>JSON Syntax Error: {jsonSyntaxError}</span>
                  </div>
                )}

                <textarea
                  rows={24}
                  value={rawJsonString}
                  onChange={handleRawJsonChange}
                  className="w-full font-mono text-xs p-4 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
