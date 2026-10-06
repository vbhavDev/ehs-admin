'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Database,
  Clock,
  Sparkles,
  Cpu,
  Scan,
  Globe,
  Layers,
  Activity,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import Button from '@/components/ui/button/Button';
import { pluginService, AiTrackingStats, AiTokenLog } from '@/services/plugin.service';

const AI_ENGINES = [
  {
    key: 'all',
    name: 'All AI Providers',
    icon: Layers,
    color: 'from-gray-800 to-gray-950',
    description: 'Aggregated telemetry and token consumption across all AI integrations & engines',
  },
  {
    key: 'gemini',
    name: 'Google Gemini AI',
    icon: Sparkles,
    color: 'from-blue-500 to-indigo-600',
    description: 'Multimodal GenAI for hazard insights, translations & chat',
  },
  {
    key: 'openai',
    name: 'OpenAI GPT-4o',
    icon: Cpu,
    color: 'from-emerald-500 to-teal-600',
    description: 'GPT-4o Vision & language intelligence models',
  },
  {
    key: 'yolo-ai-service',
    name: 'YOLOv11 Vision Service',
    icon: Scan,
    color: 'from-purple-500 to-pink-600',
    description: 'Python CV microservice for PPE & real-time bounding boxes',
  },
  {
    key: 'google-translate',
    name: 'Google Translate',
    icon: Globe,
    color: 'from-amber-500 to-orange-600',
    description: '130+ language catalog translation engine',
  },
];

const FEATURE_NAMES: Record<string, string> = {
  HAZARD_DETECTION: 'AI Hazard & Vision Detection',
  AI_COPILOT: 'EHS AI Copilot Chat',
  AI_TRANSLATION: 'Multi-Language Translation',
  AI_REPORTING: 'Executive AI Reports',
};

const FEATURE_COLORS: Record<string, string> = {
  HAZARD_DETECTION:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  AI_COPILOT:
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  AI_TRANSLATION:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  AI_REPORTING:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function PluginUsagePage() {
  const params = useParams();
  const router = useRouter();
  const rawKey = (params?.key as string) || 'all';
  const pluginKey = rawKey.toLowerCase();

  const [stats, setStats] = useState<AiTrackingStats | null>(null);
  const [logs, setLogs] = useState<AiTokenLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFeature, setSelectedFeature] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const activeEngine = AI_ENGINES.find((e) => e.key === pluginKey) || {
    key: pluginKey,
    name: pluginKey.toUpperCase(),
    icon: Sparkles,
    color: 'from-brand-500 to-indigo-600',
    description: 'AI Engine telemetry & token monitoring',
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      let startDate: string | undefined = undefined;
      let endDate: string | undefined = undefined;

      const now = new Date();

      if (dateFilter === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        startDate = start.toISOString();
        endDate = end.toISOString();
      } else if (dateFilter === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        startDate = start.toISOString();
        endDate = end.toISOString();
      } else if (dateFilter === 'custom' && customStart && customEnd) {
        startDate = new Date(`${customStart}T00:00:00`).toISOString();
        endDate = new Date(`${customEnd}T23:59:59`).toISOString();
      }

      const providerParam = pluginKey === 'all' ? undefined : pluginKey;
      const featureParam = selectedFeature === 'all' ? undefined : selectedFeature;

      const [statsRes, logsRes] = await Promise.all([
        pluginService.getAiTrackingStats({
          provider: providerParam,
          feature: featureParam,
          startDate,
          endDate,
        }),
        pluginService.getAiTrackingLogs({
          provider: providerParam,
          feature: featureParam,
          page,
          limit: 15,
          startDate,
          endDate,
        }),
      ]);

      setStats(statsRes);
      setLogs(logsRes?.data || []);
      if (logsRes?.meta?.totalPages) {
        setTotalPages(logsRes.meta.totalPages);
      } else if ((logsRes as unknown as { totalPages?: number })?.totalPages) {
        setTotalPages((logsRes as unknown as { totalPages?: number }).totalPages || 1);
      }
    } catch {
      // Handled gracefully
    } finally {
      setIsLoading(false);
    }
  }, [pluginKey, page, selectedFeature, dateFilter, customStart, customEnd]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalTokens =
    stats?.totals?.totalTokens ||
    (stats?.totals?.totalInput || 0) + (stats?.totals?.totalOutput || 0);
  const totalRequests = stats?.totals?.totalRequests || logs.length || 0;
  const avgTokensPerReq =
    totalRequests > 0 ? Math.round(totalTokens / Math.max(totalRequests, 1)) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/plugins')}
            className="text-gray-500 rounded-xl"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {activeEngine.name} Telemetry & Usage
              </h1>
              <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:text-brand-400 border border-brand-500/20">
                AI Category: {selectedFeature === 'all' ? 'All Features' : selectedFeature}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {activeEngine.description}
            </p>
          </div>
        </div>

        {pluginKey !== 'all' && (
          <Link
            href={`/plugins/${pluginKey}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline shrink-0"
          >
            <span>View {activeEngine.name} Settings</span>
            <ArrowLeft size={14} className="rotate-180" />
          </Link>
        )}
      </div>

      {/* AI Engine Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {AI_ENGINES.map((engine) => {
          const isSelected = pluginKey === engine.key;
          const Icon = engine.icon;
          return (
            <button
              key={engine.key}
              type="button"
              onClick={() => {
                router.push(`/plugins/${engine.key}/usage`);
                setPage(1);
              }}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-gradient-to-r ' +
                    engine.color +
                    ' text-white border-transparent shadow-md shadow-brand-500/20 ring-2 ring-brand-500/30'
                  : 'bg-white dark:bg-navy-900 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-navy-800 hover:bg-gray-50 dark:hover:bg-navy-800'
              }`}
            >
              <Icon size={15} />
              <span>{engine.name}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm flex flex-wrap items-end gap-4">
        {/* Category / Feature Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            AI Feature Category
          </label>
          <select
            value={selectedFeature}
            onChange={(e) => {
              setSelectedFeature(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-800 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white min-w-[200px]"
          >
            <option value="all">All AI Categories</option>
            <option value="HAZARD_DETECTION">Hazard Detection & Vision</option>
            <option value="AI_COPILOT">EHS AI Copilot</option>
            <option value="AI_TRANSLATION">Multi-Language Translation</option>
            <option value="AI_REPORTING">Executive AI Reporting</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Date Range
          </label>
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value as 'all' | 'today' | 'month' | 'custom');
              setPage(1);
            }}
            className="h-10 px-3.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-800 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white min-w-[150px]"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {dateFilter === 'custom' && (
          <>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-800 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-800 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white"
              />
            </div>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Fetching token telemetry...
          </span>
        </div>
      ) : (
        <>
          {/* Stats KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tokens */}
            <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Database size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  Total Tokens
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  {totalTokens.toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  <span className="text-blue-500 font-bold">
                    {(stats?.totals?.totalInput || 0).toLocaleString()}
                  </span>{' '}
                  in /{' '}
                  <span className="text-purple-500 font-bold">
                    {(stats?.totals?.totalOutput || 0).toLocaleString()}
                  </span>{' '}
                  out
                </p>
              </div>
            </div>

            {/* Estimated Cost */}
            <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  Estimated Cost
                </p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ${(stats?.totals?.totalCost || 0).toFixed(4)}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Calculated USD compute cost</p>
              </div>
            </div>

            {/* Total Inferences / Requests */}
            <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  Total Operations
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  {totalRequests.toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Inferences & API executions</p>
              </div>
            </div>

            {/* Avg Tokens per Request */}
            <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  Avg. Tokens / Op
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  {avgTokensPerReq.toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Mean consumption density</p>
              </div>
            </div>
          </div>

          {/* Categorized Visual Breakdown Grid */}
          <div
            className={`grid gap-6 ${
              pluginKey === 'all' && stats?.byProvider && stats.byProvider.length > 0
                ? 'grid-cols-1 lg:grid-cols-3'
                : 'grid-cols-1 lg:grid-cols-2'
            }`}
          >
            {/* By Provider (Shown when viewing All AI Providers) */}
            {pluginKey === 'all' && stats?.byProvider && stats.byProvider.length > 0 && (
              <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-500" />
                    Consumption by Provider
                  </h3>
                  <span className="text-[11px] font-semibold text-gray-400">
                    {stats.byProvider.length} active engines
                  </span>
                </div>

                <div className="space-y-3">
                  {stats.byProvider.map((p) => {
                    const percentage =
                      totalTokens > 0 ? Math.round((p.total / totalTokens) * 100) : 0;
                    return (
                      <div key={p._id} className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-gray-800 dark:text-gray-200 capitalize">
                            {p._id}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 font-mono">
                            {p.total.toLocaleString()} tokens ({percentage}%) • $
                            {(p.cost || 0).toFixed(4)}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-navy-800 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* By Feature / Category */}
            <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers size={16} className="text-brand-500" />
                  Consumption by Category & Feature
                </h3>
                <span className="text-[11px] font-semibold text-gray-400">
                  {stats?.byFeature?.length || 0} active categories
                </span>
              </div>

              {!stats?.byFeature || stats.byFeature.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">
                  No categorical data recorded for this selection.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.byFeature.map((f) => {
                    const percentage =
                      totalTokens > 0 ? Math.round((f.total / totalTokens) * 100) : 0;
                    return (
                      <div key={f._id} className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-gray-800 dark:text-gray-200">
                            {FEATURE_NAMES[f._id] || f._id}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 font-mono">
                            {f.total.toLocaleString()} tokens ({percentage}%) • $
                            {(f.cost || 0).toFixed(4)}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-navy-800 overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* By AI Model */}
            <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Cpu size={16} className="text-purple-500" />
                  Consumption by AI Engine & Model
                </h3>
                <span className="text-[11px] font-semibold text-gray-400">
                  {stats?.byModel?.length || 0} active models
                </span>
              </div>

              {!stats?.byModel || stats.byModel.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">
                  No model metrics recorded for this selection.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.byModel.map((m) => {
                    const percentage =
                      totalTokens > 0 ? Math.round((m.total / totalTokens) * 100) : 0;
                    return (
                      <div key={m._id} className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="font-mono text-gray-800 dark:text-gray-200">
                            {m._id}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 font-mono">
                            {m.total.toLocaleString()} tokens ({percentage}%) • $
                            {(m.cost || 0).toFixed(4)}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-navy-800 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-navy-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Individual Telemetry Logs
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Detailed execution timestamps, token consumption, and cost estimates.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {logs.length} entries shown
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-navy-800/50">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User / Organization
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Feature Category
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Provider & Model
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tokens (In / Out / Total)
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cost (USD)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-xs text-gray-500 dark:text-gray-400"
                      >
                        No token usage logs found for {activeEngine.name} with current filters.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const featureBadgeClass =
                        FEATURE_COLORS[log.feature] ||
                        'bg-gray-100 text-gray-800 dark:bg-navy-700 dark:text-gray-200 border-gray-200';
                      const modelName = log.aiModel || log.model || 'standard';
                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-gray-50 dark:hover:bg-navy-800/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center text-xs text-gray-900 dark:text-white font-mono">
                              <Clock size={13} className="mr-2 text-gray-400 shrink-0" />
                              {formatDate(log.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-300">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {log.userId?.email || 'Automated Service'}
                            </div>
                            {log.orgId?.name && (
                              <div className="text-[10px] text-gray-400">{log.orgId.name}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${featureBadgeClass}`}
                            >
                              {FEATURE_NAMES[log.feature] || log.feature}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200">
                              {modelName}
                            </div>
                            <span className="text-[10px] text-gray-400 capitalize">
                              {log.provider}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                              {log.inputTokens}
                            </span>
                            <span className="mx-1 text-gray-400">/</span>
                            <span className="text-purple-600 dark:text-purple-400 font-bold">
                              {log.outputTokens}
                            </span>
                            <span className="mx-1 text-gray-400">=</span>
                            <span className="text-gray-900 dark:text-white font-black">
                              {log.totalTokens}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ${(log.estimatedCostUsd || 0).toFixed(5)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-navy-800 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="rounded-xl text-xs font-bold"
                >
                  Previous
                </Button>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl text-xs font-bold"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
