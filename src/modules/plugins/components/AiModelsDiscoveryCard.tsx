'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PluginItem, AiModelInfo } from '@/types/plugin.types';
import { pluginsService } from '@/services/plugins.service';
import {
  Cpu,
  RefreshCw,
  Star,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Zap,
  Search,
  Eye,
  Sliders,
  Terminal,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AiModelsDiscoveryCardProps {
  plugin: PluginItem;
  onModelChanged?: (newDefaultModel: string) => void;
}

// Comprehensive Metadata & EHS Platform Parameter Specs Mapping
interface ModelExtendedDetails {
  category: string;
  categoryColor: string;
  bestFor: string;
  ehsPlatformRecommendation: string;
  recommendedRoles: string[];
  contextWindow: string;
  maxOutputTokens: string;
  latencyTier: string;
  costTier: string;
  modalities: string[];
  recommendedTemp: number;
}

function resolveModelDetails(modelId: string, pluginKey: string): ModelExtendedDetails {
  const idLower = modelId.toLowerCase();

  // Gemini models
  if (
    idLower.includes('gemini-3.5-flash') ||
    idLower.includes('gemini-2.5-flash') ||
    idLower.includes('gemini-1.5-flash') ||
    idLower.includes('gemini-flash')
  ) {
    return {
      category: 'Multimodal Vision & Real-time Processing',
      categoryColor: 'purple',
      bestFor:
        'Ultra-fast visual hazard identification, high-accuracy PPE compliance detection, OCR on safety signage, and low-latency safety copilot chat.',
      ehsPlatformRecommendation:
        'Primary Engine for Hazard & Incident Photo Audits, Automated Observation Triage, and Field Worker Voice Copilot.',
      recommendedRoles: [
        'Hazard Photo Inspections',
        'Safety Copilot Assistant',
        'Multi-Language Safety Translation',
      ],
      contextWindow: '1,048,576 Tokens (1M)',
      maxOutputTokens: '8,192 Tokens',
      latencyTier: 'Ultra Fast (~320ms)',
      costTier: 'Cost-Optimized / Economy Tier',
      modalities: ['Vision & Images', 'Text & Code', 'Audio Streams', 'Structured JSON'],
      recommendedTemp: 0.2,
    };
  }

  if (idLower.includes('gemini-3.1-flash-lite') || idLower.includes('flash-lite')) {
    return {
      category: 'Ultra-Low Latency & High-Throughput Engine',
      categoryColor: 'cyan',
      bestFor:
        'High-volume stream processing, batch hazard log classification, telemetry parsing, and instant multi-lingual string translations.',
      ehsPlatformRecommendation:
        'Real-time Telemetry Parsing, Continuous Field Observation Streams, and Quick Safety Translations.',
      recommendedRoles: ['Batch Telemetry Logs', 'Field Translations', 'High-Volume Triage'],
      contextWindow: '1,048,576 Tokens (1M)',
      maxOutputTokens: '8,192 Tokens',
      latencyTier: 'Instant (<250ms)',
      costTier: 'Lowest Cost Tier',
      modalities: ['Vision & Images', 'Text', 'Structured JSON'],
      recommendedTemp: 0.2,
    };
  }

  if (
    idLower.includes('gemini-2.5-pro') ||
    idLower.includes('gemini-1.5-pro') ||
    idLower.includes('gemini-3.8-flash')
  ) {
    return {
      category: 'Deep Reasoning & Compliance Audits',
      categoryColor: 'indigo',
      bestFor:
        'Complex OSHA / ISO 45001 regulatory compliance verification, root-cause investigation, and multi-page safety manual cross-referencing.',
      ehsPlatformRecommendation:
        'Automated Risk Assessment Reports, Legal & Compliance Checks, and Safety Management Systems (SMS) audits.',
      recommendedRoles: ['Compliance Audits', 'Root Cause Analysis', 'Risk Assessment Reports'],
      contextWindow: '2,097,152 Tokens (2M)',
      maxOutputTokens: '8,192 Tokens',
      latencyTier: 'Balanced Reasoning (~850ms)',
      costTier: 'Enterprise Flagship Tier',
      modalities: ['Vision & Images', 'Full PDFs / Manuals', 'Audio', 'Structured JSON'],
      recommendedTemp: 0.1,
    };
  }

  // OpenAI models
  if (idLower.includes('gpt-4o-mini')) {
    return {
      category: 'Fast, Lightweight & Cost-Efficient Multimodal',
      categoryColor: 'emerald',
      bestFor:
        'Everyday conversational assistant, safety checklist item generation, and secondary fallback for photo vision inspections.',
      ehsPlatformRecommendation:
        'Primary Interactive Copilot, Standby Secondary Failover Engine, and Automated Worker Alerts.',
      recommendedRoles: ['Safety Copilot Chat', 'Secondary Failover Engine', 'Observation Triage'],
      contextWindow: '128,000 Tokens (128k)',
      maxOutputTokens: '16,384 Tokens',
      latencyTier: 'Ultra Fast (~300ms)',
      costTier: 'Cost-Efficient',
      modalities: ['Vision & Images', 'Text', 'Structured JSON'],
      recommendedTemp: 0.3,
    };
  }

  if (idLower.includes('gpt-4o') || idLower.includes('gpt-4-turbo')) {
    return {
      category: 'Flagship Multimodal Intelligence & Reasoning',
      categoryColor: 'blue',
      bestFor:
        'High-fidelity visual understanding, spatial coordinate mapping for hazard bounding boxes, and natural safety guidance dialogue.',
      ehsPlatformRecommendation:
        'High-Precision Hazard Detection, Executive Safety Incident Briefings, and Interactive Copilot.',
      recommendedRoles: [
        'Hazard Photo Inspections',
        'Safety Copilot Assistant',
        'Executive Reporting',
      ],
      contextWindow: '128,000 Tokens (128k)',
      maxOutputTokens: '4,096 Tokens',
      latencyTier: 'Fast (~550ms)',
      costTier: 'Flagship Enterprise Tier',
      modalities: ['Vision & Images', 'Text', 'Structured JSON'],
      recommendedTemp: 0.2,
    };
  }

  if (idLower.includes('o1') || idLower.includes('o3')) {
    return {
      category: 'Advanced STEM & Deliberative Reasoning',
      categoryColor: 'violet',
      bestFor:
        'Multi-step safety root-cause investigation, complex chemical / environmental risk modeling, and technical equipment engineering failure audits.',
      ehsPlatformRecommendation:
        'Deep Incident Root Cause Investigation, Technical Equipment Failure Analysis, and Chemical Hazard Assessments.',
      recommendedRoles: [
        'Root Cause Investigation',
        'Chemical Hazard Assessment',
        'Technical Compliance',
      ],
      contextWindow: '128,000 - 200,000 Tokens',
      maxOutputTokens: '32,768 - 100,000 Tokens',
      latencyTier: 'Reasoning Deliberation (~2-4s)',
      costTier: 'Deep Reasoning Tier',
      modalities: ['Text & Technical Reports', 'Code', 'Mathematical Risk Modeling'],
      recommendedTemp: 1.0,
    };
  }

  // YOLO models
  if (idLower.includes('yolo')) {
    return {
      category: 'Local Edge Vision & Semantic Segmentation',
      categoryColor: 'amber',
      bestFor:
        'Sub-100ms bounding-box identification of hard hats, safety vests, boots, goggles, and restricted zone incursions directly on video feeds.',
      ehsPlatformRecommendation:
        'On-Premises CCTV Video PPE Audits, Instant Bounding-Box Generation, and Offline Failover Tier.',
      recommendedRoles: ['PPE Bounding Boxes', 'Restricted Zone Incursions', 'Offline Fallback'],
      contextWindow: 'N/A (Spatial Coordinates Grid)',
      maxOutputTokens: 'N/A (Bounding Coordinates JSON)',
      latencyTier: 'Instant Edge (<80ms)',
      costTier: 'Zero Cloud Cost / Self-Hosted',
      modalities: ['CCTV Video Streams', 'Field Photos', 'Bounding Coordinates'],
      recommendedTemp: 0.0,
    };
  }

  // Google Translate / NMT
  if (
    idLower.includes('translate') ||
    idLower.includes('nmt') ||
    pluginKey === 'google-translate'
  ) {
    return {
      category: 'Enterprise Neural Machine Translation',
      categoryColor: 'teal',
      bestFor:
        'Instant multi-lingual translation of safety signs, emergency protocols, and worker observation reports across 100+ languages.',
      ehsPlatformRecommendation:
        'Platform UI Localization, Worker Safety Protocol Translation, and Emergency Incident Broadcasting.',
      recommendedRoles: [
        'Safety UI Translation',
        'Emergency Protocol Localization',
        'Multi-Language Field App',
      ],
      contextWindow: '128,000 Characters per Request',
      maxOutputTokens: 'Direct Text Output',
      latencyTier: 'Ultra Fast (~180ms)',
      costTier: 'Standard Cloud Translation Tier',
      modalities: ['Multi-Language Text', 'HTML / Markup'],
      recommendedTemp: 0.0,
    };
  }

  // Generic fallback
  return {
    category: 'General Multimodal AI Model',
    categoryColor: 'gray',
    bestFor:
      'General natural language processing, safety analysis, and structured completion tasks.',
    ehsPlatformRecommendation: 'General Safety Platform Operations & Experimental Workflows.',
    recommendedRoles: ['General EHS Tasks', 'Field Operations'],
    contextWindow: '128,000 Tokens',
    maxOutputTokens: '4,096 Tokens',
    latencyTier: 'Standard (~600ms)',
    costTier: 'Standard Tier',
    modalities: ['Text', 'Structured JSON'],
    recommendedTemp: 0.2,
  };
}

export function AiModelsDiscoveryCard({ plugin, onModelChanged }: AiModelsDiscoveryCardProps) {
  const [models, setModels] = useState<AiModelInfo[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>(
    (plugin.settings?.defaultModel as string) ||
      (plugin.settings?.model as string) ||
      (plugin.pluginKey === 'openai' ? 'gpt-4o' : 'gemini-3.5-flash'),
  );
  const [inspectingModelId, setInspectingModelId] = useState<string>(
    (plugin.settings?.defaultModel as string) ||
      (plugin.settings?.model as string) ||
      (plugin.pluginKey === 'openai' ? 'gpt-4o' : 'gemini-3.5-flash'),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const [customModelInput, setCustomModelInput] = useState('');
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'vision' | 'reasoning' | 'copilot'>(
    'all',
  );
  const [searchFilter, setSearchFilter] = useState('');

  const fetchModels = async (showToast = true) => {
    try {
      setIsLoading(true);
      const res = await pluginsService.getAvailableAiModels(plugin.pluginKey);
      if (res && res.models) {
        setModels(res.models);
        if (res.defaultModel) {
          setDefaultModel(res.defaultModel);
          setInspectingModelId(res.defaultModel);
        }
        setLastFetched(new Date().toLocaleTimeString());
        if (showToast) {
          toast.success(
            `Successfully fetched ${res.models.length} model(s) from ${plugin.name} API!`,
          );
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to fetch AI models via API';
      if (showToast) {
        toast.error(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels(false);
  }, [plugin.pluginKey]);

  const handleSetDefault = async (modelId: string) => {
    try {
      setIsSettingDefault(modelId);
      const res = await pluginsService.setDefaultAiModel(plugin.pluginKey, modelId);
      setDefaultModel(modelId);
      setInspectingModelId(modelId);
      setModels((prev) =>
        prev.map((m) => ({
          ...m,
          isDefault: m.id === modelId,
        })),
      );
      toast.success(
        res.message || `Set "${modelId}" as the default model for all platform AI workflows!`,
      );
      if (onModelChanged) onModelChanged(modelId);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to update default model';
      toast.error(errMsg);
    } finally {
      setIsSettingDefault(null);
    }
  };

  const handleApplyCustomModel = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customModelInput.trim();
    if (!trimmed) {
      toast.error('Please enter a valid model identifier');
      return;
    }
    await handleSetDefault(trimmed);
    setCustomModelInput('');
  };

  // Inspect details for active inspected model
  const activeInspectedDetails = useMemo(() => {
    return resolveModelDetails(inspectingModelId, plugin.pluginKey);
  }, [inspectingModelId, plugin.pluginKey]);

  // Filtered models
  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const details = resolveModelDetails(m.id, plugin.pluginKey);
      const matchesSearch =
        m.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (m.name && m.name.toLowerCase().includes(searchFilter.toLowerCase())) ||
        details.category.toLowerCase().includes(searchFilter.toLowerCase());

      if (!matchesSearch) return false;

      if (categoryFilter === 'vision') {
        return details.category.toLowerCase().includes('vision');
      }
      if (categoryFilter === 'reasoning') {
        return (
          details.category.toLowerCase().includes('reasoning') ||
          details.category.toLowerCase().includes('compliance')
        );
      }
      if (categoryFilter === 'copilot') {
        return (
          details.category.toLowerCase().includes('fast') ||
          details.category.toLowerCase().includes('lightweight') ||
          details.recommendedRoles.some((r) => r.includes('Copilot'))
        );
      }

      return true;
    });
  }, [models, searchFilter, categoryFilter, plugin.pluginKey]);

  return (
    <div className="rounded-3xl border border-purple-200/70 bg-gradient-to-br from-white via-purple-50/15 to-indigo-50/20 p-6 md:p-8 shadow-sm dark:border-navy-800 dark:from-navy-900 dark:via-navy-900 dark:to-navy-950 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-navy-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
              <Cpu size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Live AI Models & Category Capability Inspector
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Inspect model parameters, domain strengths, and set the default engine for EHS
                workflows.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {lastFetched && (
            <span className="text-[11px] font-mono text-gray-400">Synced: {lastFetched}</span>
          )}
          <button
            type="button"
            onClick={() => fetchModels(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-200 dark:hover:bg-navy-700 transition-all disabled:opacity-50 shadow-xs"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-purple-600' : ''} />
            <span>{isLoading ? 'Querying API...' : 'Fetch Live Models via API'}</span>
          </button>
        </div>
      </div>

      {/* Primary Highlighted Model Category & Parameter Spec Card */}
      <div className="rounded-2xl border-2 border-purple-500/40 bg-white p-6 shadow-md dark:border-purple-500/30 dark:bg-navy-800/95 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 dark:border-navy-700">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-purple-600 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-white uppercase">
                {activeInspectedDetails.category}
              </span>

              {inspectingModelId === defaultModel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300 border border-emerald-500/20">
                  <Star size={11} className="fill-emerald-600 text-emerald-600" />
                  CURRENT PLATFORM DEFAULT
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <h4 className="text-lg font-extrabold text-gray-900 dark:text-white font-mono">
                {inspectingModelId}
              </h4>
              <span className="text-xs text-gray-400">({plugin.name})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {inspectingModelId !== defaultModel && (
              <button
                type="button"
                onClick={() => handleSetDefault(inspectingModelId)}
                disabled={isSettingDefault !== null}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/20 hover:bg-purple-700 transition-all disabled:opacity-50 active:scale-95"
              >
                {isSettingDefault === inspectingModelId ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Star size={13} />
                )}
                <span>Set this Model as Platform Default</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Insight: Best For & EHS Platform Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Best For (Core Capabilities) */}
          <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 dark:border-purple-900/40 dark:bg-purple-950/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-950 dark:text-purple-200">
              <Zap size={15} className="text-purple-600" />
              <span>What this Model is Best For</span>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              {activeInspectedDetails.bestFor}
            </p>
          </div>

          {/* EHS Platform Recommendation */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-indigo-200">
              <ShieldCheck size={15} className="text-indigo-600" />
              <span>Recommended Usage on EHS Platform</span>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              {activeInspectedDetails.ehsPlatformRecommendation}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeInspectedDetails.recommendedRoles.map((role) => (
                <span
                  key={role}
                  className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-bold text-indigo-700 shadow-xs border border-indigo-200/60 dark:bg-navy-900 dark:text-indigo-300 dark:border-indigo-800"
                >
                  ✓ {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Parameter Specifications Grid */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-navy-700 dark:bg-navy-900/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
            <Sliders size={13} className="text-purple-600" />
            <span>Technical Parameter Details</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="rounded-lg bg-white p-2.5 border border-gray-100 dark:bg-navy-800 dark:border-navy-700">
              <span className="block text-[10px] font-medium text-gray-400">Context Window</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                {activeInspectedDetails.contextWindow}
              </span>
            </div>

            <div className="rounded-lg bg-white p-2.5 border border-gray-100 dark:bg-navy-800 dark:border-navy-700">
              <span className="block text-[10px] font-medium text-gray-400">Max Output Tokens</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                {activeInspectedDetails.maxOutputTokens}
              </span>
            </div>

            <div className="rounded-lg bg-white p-2.5 border border-gray-100 dark:bg-navy-800 dark:border-navy-700">
              <span className="block text-[10px] font-medium text-gray-400">Latency Benchmark</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {activeInspectedDetails.latencyTier}
              </span>
            </div>

            <div className="rounded-lg bg-white p-2.5 border border-gray-100 dark:bg-navy-800 dark:border-navy-700">
              <span className="block text-[10px] font-medium text-gray-400">Cost Profile</span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                {activeInspectedDetails.costTier}
              </span>
            </div>

            <div className="rounded-lg bg-white p-2.5 border border-gray-100 dark:bg-navy-800 dark:border-navy-700">
              <span className="block text-[10px] font-medium text-gray-400">
                Safety Temperature
              </span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                {activeInspectedDetails.recommendedTemp} (Audits)
              </span>
            </div>

            <div className="rounded-lg bg-white p-2.5 border border-gray-100 dark:bg-navy-800 dark:border-navy-700">
              <span className="block text-[10px] font-medium text-gray-400">
                Supported Modalities
              </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                {activeInspectedDetails.modalities.length} Types
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Models Catalog Grid with Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 ${
                categoryFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-navy-800 dark:text-gray-300 border border-gray-200 dark:border-navy-700'
              }`}
            >
              All Discovered Models ({models.length})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('vision')}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 ${
                categoryFilter === 'vision'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-navy-800 dark:text-gray-300 border border-gray-200 dark:border-navy-700'
              }`}
            >
              Vision & Hazard Inspection
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('copilot')}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 ${
                categoryFilter === 'copilot'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-navy-800 dark:text-gray-300 border border-gray-200 dark:border-navy-700'
              }`}
            >
              Copilot & Low Latency
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('reasoning')}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 ${
                categoryFilter === 'reasoning'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-navy-800 dark:text-gray-300 border border-gray-200 dark:border-navy-700'
              }`}
            >
              Deep Reasoning & Compliance
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search model or capability..."
              className="w-full rounded-xl border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-900 outline-none focus:border-purple-500 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
            />
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Models Grid */}
        {isLoading && models.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500 dark:border-navy-700 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-purple-600" />
            <span>Querying live models from provider endpoint...</span>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-500 dark:border-navy-700 dark:text-gray-400">
            No models match the selected filter. Click <strong>Fetch Live Models via API</strong> or
            reset the filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredModels.map((m) => {
              const isDefault = defaultModel === m.id || m.isDefault;
              const isInspected = inspectingModelId === m.id;
              const details = resolveModelDetails(m.id, plugin.pluginKey);

              return (
                <div
                  key={m.id}
                  onClick={() => setInspectingModelId(m.id)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                    isInspected
                      ? 'border-purple-600 bg-white shadow-md ring-2 ring-purple-600/25 dark:border-purple-500 dark:bg-navy-800'
                      : 'border-gray-200 bg-white/80 hover:border-purple-300 dark:border-navy-700 dark:bg-navy-800/60 dark:hover:border-navy-600'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[9px] font-extrabold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                          {details.category.split('&')[0]}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white font-mono mt-1">
                          {m.name || m.id}
                        </h4>
                      </div>

                      {isDefault ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5 text-[9px] font-extrabold text-white shadow-xs shrink-0">
                          <Star size={10} className="fill-white" />
                          DEFAULT
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono">
                          {details.latencyTier.split('(')[0]}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">
                      {details.bestFor}
                    </p>

                    {/* Quick Specs Pill */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono text-gray-500 dark:text-gray-400">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-navy-700">
                        Ctx: {details.contextWindow.split(' ')[0]}
                      </span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-navy-700">
                        {details.costTier.split('/')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-2 border-t border-gray-100 dark:border-navy-700 flex items-center justify-between text-[11px]">
                    <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                      <Eye size={12} />
                      {isInspected ? 'Viewing Specs' : 'Click to Inspect'}
                    </span>

                    {!isDefault && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(m.id);
                        }}
                        disabled={isSettingDefault === m.id}
                        className="inline-flex items-center gap-1 font-bold text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 underline"
                      >
                        {isSettingDefault === m.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Star size={11} />
                        )}
                        <span>Set Default</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Fine-Tuned Model Input Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-navy-700 dark:bg-navy-800/60 space-y-2">
        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <Terminal size={14} className="text-purple-600" />
          Specify Custom or Fine-Tuned Model Identifier
        </label>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Enter a custom model string to assign proprietary or fine-tuned EHS weights as the
          platform default.
        </p>
        <form onSubmit={handleApplyCustomModel} className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            value={customModelInput}
            onChange={(e) => setCustomModelInput(e.target.value)}
            placeholder="e.g. ft:gpt-4o:my-org:custom-01 or gemini-2.5-flash-custom"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-mono text-gray-900 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!customModelInput.trim() || isSettingDefault !== null}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-5 py-2 text-xs font-semibold text-white hover:bg-black dark:bg-navy-700 dark:hover:bg-navy-600 transition-all disabled:opacity-50 shrink-0"
          >
            <CheckCircle2 size={13} />
            <span>Apply as Platform Default</span>
          </button>
        </form>
      </div>
    </div>
  );
}
