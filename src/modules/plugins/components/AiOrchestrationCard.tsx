'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AiOrchestrationConfig, AiModelInfo } from '@/types/plugin.types';
import { pluginsService } from '@/services/plugins.service';
import {
  Cpu,
  ShieldCheck,
  Zap,
  RefreshCw,
  Loader2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ChevronDown,
  Layers,
  Sparkles,
  Network,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AiOrchestrationCardProps {
  onConfigSaved?: () => void;
}

const FALLBACK_STRATEGIES = [
  {
    id: 'AUTO_FAILOVER' as const,
    name: 'Smart Auto-Failover (Recommended)',
    badge: 'High Availability',
    description:
      'Instantly failover to the secondary engine upon network timeouts (429/5xx), quota exhaustion, or gateway errors.',
    icon: ShieldCheck,
    color: 'emerald',
  },
  {
    id: 'COST_OPTIMIZED' as const,
    name: 'Cost-Optimized Routing',
    badge: 'Efficiency',
    description:
      'Utilize ultra-fast, budget-conscious models for routine tasks and seamlessly escalate to flagship reasoning engines for complex multi-hazard analysis.',
    icon: Zap,
    color: 'amber',
  },
  {
    id: 'SEQUENTIAL_CHAIN' as const,
    name: 'Sequential Multi-Tier Chain',
    badge: 'Full Redundancy',
    description:
      'Execute primary cloud LLM -> secondary backup LLM -> local on-premise YOLO computer vision microservice.',
    icon: Layers,
    color: 'purple',
  },
];

const PROVIDER_OPTIONS = [
  {
    key: 'gemini',
    name: 'Google Gemini AI',
    defaultModels: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  },
  {
    key: 'openai',
    name: 'OpenAI GPT-4o',
    defaultModels: ['gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o3-mini'],
  },
  {
    key: 'yolo-ai-service',
    name: 'YOLOv11 Microservice',
    defaultModels: ['yolo11x-seg-custom', 'yolo11n-general', 'yolo11m-ppe'],
  },
  {
    key: 'google-translate',
    name: 'Google Cloud Translation',
    defaultModels: ['nmt-standard-v3', 'google-translate-v2'],
  },
];

export function AiOrchestrationCard({ onConfigSaved }: AiOrchestrationCardProps) {
  const [config, setConfig] = useState<AiOrchestrationConfig>({
    primaryProvider: 'gemini',
    primaryModel: 'gemini-2.5-flash',
    secondaryProvider: 'openai',
    secondaryModel: 'gpt-4o-mini',
    fallbackMethod: 'AUTO_FAILOVER',
    timeoutSeconds: 20,
    retryAttempts: 2,
    enableAutomaticFallback: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<{
    primary: { status: 'healthy' | 'error'; latency: number; message: string };
    secondary: { status: 'healthy' | 'error'; latency: number; message: string };
  } | null>(null);

  // Live fetched models state per provider
  const [fetchedModels, setFetchedModels] = useState<Record<string, AiModelInfo[]>>({});
  const [fetchingProviderKey, setFetchingProviderKey] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await pluginsService.getAiOrchestrationConfig();
      if (data) {
        setConfig((prev) => ({
          ...prev,
          primaryProvider: data.primaryProvider || 'gemini',
          primaryModel: data.primaryModel || 'gemini-2.5-flash',
          secondaryProvider: data.secondaryProvider || 'openai',
          secondaryModel: data.secondaryModel || 'gpt-4o-mini',
          fallbackMethod: data.fallbackMethod || 'AUTO_FAILOVER',
          timeoutSeconds: data.timeoutSeconds || 20,
          retryAttempts: data.retryAttempts || 2,
          enableAutomaticFallback:
            typeof data.enableAutomaticFallback === 'boolean' ? data.enableAutomaticFallback : true,
          features: data.features,
          availableProviders: data.availableProviders,
        }));
      }
    } catch {
      // Use fallback default config
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleFetchModelsForProvider = async (providerKey: string) => {
    try {
      setFetchingProviderKey(providerKey);
      const res = await pluginsService.getAvailableAiModels(providerKey);
      if (res && res.models) {
        setFetchedModels((prev) => ({ ...prev, [providerKey]: res.models }));
        toast.success(`Fetched ${res.models.length} live models for ${providerKey.toUpperCase()}!`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to query live provider models';
      toast.error(errMsg);
    } finally {
      setFetchingProviderKey(null);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await pluginsService.updateAiOrchestrationConfig(
        config as unknown as Record<string, unknown>,
      );
      toast.success(res.message || 'AI Orchestration & Failover settings saved successfully!');
      if (onConfigSaved) onConfigSaved();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save AI orchestration config';
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulateFailover = async () => {
    try {
      setIsSimulating(true);
      setSimulationResults(null);

      // Test primary
      const startPrimary = Date.now();
      let primaryRes: { status: 'healthy' | 'error'; latency: number; message: string };
      try {
        await pluginsService.testConnection(config.primaryProvider);
        primaryRes = {
          status: 'healthy',
          latency: Date.now() - startPrimary,
          message: `${config.primaryProvider.toUpperCase()} (${config.primaryModel}) is online and accepting requests.`,
        };
      } catch {
        primaryRes = {
          status: 'error',
          latency: Date.now() - startPrimary,
          message: `Primary connection test timed out or returned error. Fallback mechanism will engage.`,
        };
      }

      // Test secondary
      const startSecondary = Date.now();
      let secondaryRes: { status: 'healthy' | 'error'; latency: number; message: string };
      try {
        await pluginsService.testConnection(config.secondaryProvider);
        secondaryRes = {
          status: 'healthy',
          latency: Date.now() - startSecondary,
          message: `${config.secondaryProvider.toUpperCase()} (${config.secondaryModel}) standby verification passed.`,
        };
      } catch {
        secondaryRes = {
          status: 'error',
          latency: Date.now() - startSecondary,
          message: `Secondary standby engine requires credential verification.`,
        };
      }

      setSimulationResults({ primary: primaryRes, secondary: secondaryRes });
      toast.success('AI Redundancy Simulation complete!');
    } finally {
      setIsSimulating(false);
    }
  };

  const getModelOptions = (providerKey: string) => {
    const fetched = fetchedModels[providerKey];
    if (fetched && fetched.length > 0) {
      return fetched.map((m) => m.id);
    }
    const defaultObj = PROVIDER_OPTIONS.find((p) => p.key === providerKey);
    return defaultObj ? defaultObj.defaultModels : ['default-model'];
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-navy-800 dark:bg-navy-900 flex flex-col items-center justify-center min-h-[220px]">
        <Loader2 size={32} className="animate-spin text-purple-600 mb-3" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Loading AI Multi-Engine Orchestration Configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-purple-200/80 bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/30 p-6 md:p-8 shadow-sm dark:border-purple-500/20 dark:from-navy-900 dark:via-navy-900 dark:to-purple-950/20 space-y-6 mb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-5 dark:border-purple-900/40">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25">
            <Cpu size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                AI Redundancy & Intelligent Failover Orchestration
              </h2>
              <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-500/20">
                ACTIVE MULTI-ENGINE ROUTER
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 max-w-2xl">
              Configure primary and secondary AI engines, live model API discovery, and
              fault-tolerant fallback policies across platform hazard observation, vision analysis,
              copilot, and translations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchConfig}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700 transition-colors"
          >
            <RefreshCw size={13} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/20 hover:bg-purple-700 transition-all disabled:opacity-50 active:scale-95"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Policies</span>
          </button>
        </div>
      </div>

      {/* Primary & Secondary Dual-Engine Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Primary AI Engine Box */}
        <div className="rounded-2xl border-2 border-purple-500/30 bg-white/80 p-5 dark:border-purple-500/20 dark:bg-navy-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-bold text-xs">
                1
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Primary AI Engine (Default Live)
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  First-line processor for image hazard audits, copilot prompts & telemetry
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE PRIMARY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Primary Provider */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                AI Provider
              </label>
              <div className="relative">
                <select
                  value={config.primaryProvider}
                  onChange={(e) => {
                    const newProv = e.target.value;
                    const defaultModels = getModelOptions(newProv);
                    setConfig((prev) => ({
                      ...prev,
                      primaryProvider: newProv,
                      primaryModel: defaultModels[0] || 'default-model',
                    }));
                  }}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                >
                  {PROVIDER_OPTIONS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* Primary Model */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Target AI Model
                </label>
                <button
                  type="button"
                  onClick={() => handleFetchModelsForProvider(config.primaryProvider)}
                  disabled={fetchingProviderKey === config.primaryProvider}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  <RefreshCw
                    size={10}
                    className={fetchingProviderKey === config.primaryProvider ? 'animate-spin' : ''}
                  />
                  <span>Fetch API Models</span>
                </button>
              </div>

              <div className="relative">
                <select
                  value={config.primaryModel}
                  onChange={(e) => setConfig((prev) => ({ ...prev, primaryModel: e.target.value }))}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-mono font-medium text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                >
                  {getModelOptions(config.primaryProvider).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-purple-50/60 p-3 text-[11px] text-purple-900 dark:bg-purple-950/20 dark:text-purple-300 flex items-center justify-between">
            <span className="font-mono">Selected: {config.primaryModel}</span>
            <span className="text-[10px] opacity-75">
              {fetchedModels[config.primaryProvider] ? 'Live API Verified' : 'Catalog Default'}
            </span>
          </div>
        </div>

        {/* Secondary (Failover / Backup) AI Engine Box */}
        <div className="rounded-2xl border-2 border-indigo-500/30 bg-white/80 p-5 dark:border-indigo-500/20 dark:bg-navy-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold text-xs">
                2
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Secondary AI Engine (Backup & Failover)
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Standby fallback engine invoked when primary engine encounters 429/5xx or timeout
                </p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={config.enableAutomaticFallback}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, enableAutomaticFallback: e.target.checked }))
                }
                className="peer sr-only"
              />
              <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-navy-600 dark:bg-navy-700" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Secondary Provider */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Secondary Provider
              </label>
              <div className="relative">
                <select
                  disabled={!config.enableAutomaticFallback}
                  value={config.secondaryProvider}
                  onChange={(e) => {
                    const newProv = e.target.value;
                    const defaultModels = getModelOptions(newProv);
                    setConfig((prev) => ({
                      ...prev,
                      secondaryProvider: newProv,
                      secondaryModel: defaultModels[0] || 'default-model',
                    }));
                  }}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white disabled:opacity-50"
                >
                  {PROVIDER_OPTIONS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* Secondary Model */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Backup Target Model
                </label>
                <button
                  type="button"
                  onClick={() => handleFetchModelsForProvider(config.secondaryProvider)}
                  disabled={
                    !config.enableAutomaticFallback ||
                    fetchingProviderKey === config.secondaryProvider
                  }
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 disabled:opacity-50"
                >
                  <RefreshCw
                    size={10}
                    className={
                      fetchingProviderKey === config.secondaryProvider ? 'animate-spin' : ''
                    }
                  />
                  <span>Fetch API Models</span>
                </button>
              </div>

              <div className="relative">
                <select
                  disabled={!config.enableAutomaticFallback}
                  value={config.secondaryModel}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, secondaryModel: e.target.value }))
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-mono font-medium text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white disabled:opacity-50"
                >
                  {getModelOptions(config.secondaryProvider).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50/60 p-3 text-[11px] text-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-300 flex items-center justify-between">
            <span className="font-mono">Standby Model: {config.secondaryModel}</span>
            <span className="text-[10px] opacity-75">
              {config.enableAutomaticFallback ? 'Active Standby' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Fallback Strategy Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Sliders size={14} className="text-purple-600" />
            <span>Select Failover Routing Method</span>
          </label>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500 dark:text-gray-400">Timeout Threshold:</span>
            <div className="flex items-center gap-1.5 font-mono">
              <input
                type="number"
                min={5}
                max={120}
                value={config.timeoutSeconds}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    timeoutSeconds: Math.max(5, parseInt(e.target.value, 10) || 20),
                  }))
                }
                className="w-14 rounded-lg border border-gray-200 bg-white px-2 py-1 text-center font-bold text-gray-900 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
              />
              <span className="text-gray-500">sec</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {FALLBACK_STRATEGIES.map((strat) => {
            const isSelected = config.fallbackMethod === strat.id;
            const Icon = strat.icon;
            return (
              <div
                key={strat.id}
                onClick={() => setConfig((prev) => ({ ...prev, fallbackMethod: strat.id }))}
                className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/70 shadow-md ring-2 ring-purple-600/20 dark:border-purple-500 dark:bg-purple-950/30'
                    : 'border-gray-200 bg-white/70 hover:border-purple-200 dark:border-navy-700 dark:bg-navy-800/40 dark:hover:border-navy-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-300'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {strat.name}
                      </h4>
                      <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[9px] font-extrabold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        {strat.badge}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : 'border-gray-300 dark:border-navy-600'
                      }`}
                    >
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-3">
                  {strat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulation / Dry Run Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white/60 p-4 dark:border-navy-700 dark:bg-navy-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            <Network size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              Simulate Dual-Engine Failover & Health
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Trigger instant connectivity and benchmark latency on primary & secondary AI nodes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulateFailover}
          disabled={isSimulating}
          className="inline-flex items-center gap-2 rounded-xl border border-purple-300 bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-950/40 dark:text-purple-300 transition-all disabled:opacity-50 shrink-0"
        >
          {isSimulating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          <span>{isSimulating ? 'Testing Engines...' : 'Run Redundancy Benchmark'}</span>
        </button>
      </div>

      {/* Simulation Results Banner */}
      {simulationResults && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Primary Result */}
          <div
            className={`rounded-xl p-3.5 border flex items-start gap-3 ${
              simulationResults.primary.status === 'healthy'
                ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800/30 dark:bg-emerald-950/20 dark:text-emerald-300'
                : 'border-rose-200 bg-rose-50/50 text-rose-900 dark:border-rose-800/30 dark:bg-rose-950/20 dark:text-rose-300'
            }`}
          >
            {simulationResults.primary.status === 'healthy' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold">Primary Engine Status</span>
                <span className="font-mono text-[10px] opacity-80">
                  {simulationResults.primary.latency} ms
                </span>
              </div>
              <p className="text-[11px] opacity-90">{simulationResults.primary.message}</p>
            </div>
          </div>

          {/* Secondary Result */}
          <div
            className={`rounded-xl p-3.5 border flex items-start gap-3 ${
              simulationResults.secondary.status === 'healthy'
                ? 'border-indigo-200 bg-indigo-50/50 text-indigo-900 dark:border-indigo-800/30 dark:bg-indigo-950/20 dark:text-indigo-300'
                : 'border-rose-200 bg-rose-50/50 text-rose-900 dark:border-rose-800/30 dark:bg-rose-950/20 dark:text-rose-300'
            }`}
          >
            {simulationResults.secondary.status === 'healthy' ? (
              <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold">Secondary Standby Status</span>
                <span className="font-mono text-[10px] opacity-80">
                  {simulationResults.secondary.latency} ms
                </span>
              </div>
              <p className="text-[11px] opacity-90">{simulationResults.secondary.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
