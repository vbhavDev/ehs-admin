'use client';

import React from 'react';
import Link from 'next/link';
import { PluginItem } from '@/types/plugin.types';
import {
  Plug,
  Mail,
  Send,
  CreditCard,
  Wallet,
  DollarSign,
  Globe,
  MessageSquare,
  Smartphone,
  Database,
  Cpu,
  Settings2,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react';

interface PluginCardProps {
  plugin: PluginItem;
  onToggleStatus: (key: string, current: boolean) => void;
  onTestConnection: (key: string) => void;
  onConfigure: (plugin: PluginItem) => void;
  isTesting?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  plug: Plug,
  mail: Mail,
  send: Send,
  'credit-card': CreditCard,
  wallet: Wallet,
  'dollar-sign': DollarSign,
  globe: Globe,
  'message-square': MessageSquare,
  smartphone: Smartphone,
  database: Database,
  cpu: Cpu,
};

export function PluginCard({
  plugin,
  onToggleStatus,
  onTestConnection,
  onConfigure,
  isTesting = false,
}: PluginCardProps) {
  const IconComponent = ICON_MAP[plugin.icon || 'plug'] || Plug;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg ${
        plugin.isEnabled
          ? 'border-emerald-500/30 bg-gradient-to-b from-white to-emerald-50/20 dark:border-emerald-500/20 dark:from-navy-800 dark:to-navy-900/80 shadow-sm'
          : 'border-gray-200 bg-white/80 dark:border-navy-700 dark:bg-navy-800/40'
      }`}
    >
      <div>
        {/* Top bar: Usage Status Badge, Category, Toggle */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status indicator: Used in Current vs Available */}
            {plugin.isEnabled ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                USED IN CURRENT
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2.5 py-1 text-[10px] font-extrabold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20">
                AVAILABLE FOR USE
              </span>
            )}

            <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600 dark:bg-navy-700 dark:text-gray-300">
              {plugin.category.toUpperCase()}
            </span>

            {plugin.isTestMode && (
              <span className="rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                SANDBOX
              </span>
            )}
          </div>

          {/* Toggle switch */}
          <label
            className="relative inline-flex cursor-pointer items-center"
            title={plugin.isEnabled ? 'Click to disable' : 'Click to enable'}
          >
            <input
              type="checkbox"
              checked={plugin.isEnabled}
              onChange={() => onToggleStatus(plugin.pluginKey, plugin.isEnabled)}
              className="peer sr-only"
            />
            <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-navy-600 dark:bg-navy-700" />
          </label>
        </div>

        {/* Plugin Info Header - Clickable link to detail page */}
        <Link
          href={`/plugins/${plugin.pluginKey}`}
          className="flex items-start gap-3 mb-3 group/link"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 shadow-inner group-hover/link:scale-105 group-hover/link:bg-brand-50 group-hover/link:text-brand-600 transition-all dark:bg-navy-700 dark:text-gray-200 dark:group-hover/link:bg-brand-500/20 dark:group-hover/link:text-brand-400">
            <IconComponent size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 group-hover/link:text-brand-600 dark:text-white dark:group-hover/link:text-brand-400 transition-colors truncate">
              {plugin.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              key: {plugin.pluginKey}
            </p>
          </div>
        </Link>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
          {plugin.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer & Actions */}
      <div className="mt-4 border-t border-gray-100 pt-3 dark:border-navy-700/60 space-y-3">
        {/* Health status banner */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-500 dark:text-gray-400">API Connection:</span>
          {plugin.lastTestStatus === 'success' && (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={13} /> Verified
            </span>
          )}
          {plugin.lastTestStatus === 'failed' && (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
              <XCircle size={13} /> Failed
            </span>
          )}
          {plugin.lastTestStatus === 'untested' && (
            <span className="inline-flex items-center gap-1 font-medium text-gray-400">
              <AlertCircle size={13} /> Not Tested
            </span>
          )}
        </div>

        {/* 3-Button Action Grid */}
        <div className="grid grid-cols-3 gap-1.5">
          <Link
            href={`/plugins/${plugin.pluginKey}`}
            className="flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white py-2 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
            title="View Settings & Logs"
          >
            <Eye size={12} className="text-brand-500" />
            <span>View</span>
          </Link>

          <button
            type="button"
            onClick={() => onTestConnection(plugin.pluginKey)}
            disabled={isTesting}
            className="flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white py-2 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700 disabled:opacity-50"
            title="Test API Connection"
          >
            {isTesting ? (
              <Loader2 size={12} className="animate-spin text-brand-500" />
            ) : (
              <Activity size={12} className="text-brand-500" />
            )}
            <span>Test API</span>
          </button>

          <button
            type="button"
            onClick={() => onConfigure(plugin)}
            className="flex items-center justify-center gap-1 rounded-xl bg-gray-900 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-black dark:bg-navy-700 dark:hover:bg-navy-600"
            title="Edit Configuration"
          >
            <Settings2 size={12} />
            <span>Configure</span>
          </button>
        </div>
      </div>
    </div>
  );
}
