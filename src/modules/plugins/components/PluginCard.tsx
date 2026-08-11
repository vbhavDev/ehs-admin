'use client';

import React from 'react';
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
          ? 'border-brand-500/30 bg-gradient-to-b from-white to-gray-50/50 dark:border-brand-500/20 dark:from-navy-800 dark:to-navy-900/60'
          : 'border-gray-200 bg-white/70 opacity-80 hover:opacity-100 dark:border-navy-700 dark:bg-navy-800/40'
      }`}
    >
      <div>
        {/* Top bar: Category badge, Test Mode tag, Status Toggle */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              {plugin.category.toUpperCase()}
            </span>

            {plugin.isTestMode ? (
              <span className="rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                SANDBOX
              </span>
            ) : (
              <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                PRODUCTION
              </span>
            )}
          </div>

          {/* Toggle switch */}
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={plugin.isEnabled}
              onChange={() => onToggleStatus(plugin.pluginKey, plugin.isEnabled)}
              className="peer sr-only"
            />
            <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-navy-600 dark:bg-navy-700" />
          </label>
        </div>

        {/* Plugin Info Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 shadow-inner group-hover:scale-105 transition-transform dark:bg-navy-700 dark:text-gray-200">
            <IconComponent size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
              {plugin.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              key: {plugin.pluginKey}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
          {plugin.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer & Actions */}
      <div className="mt-4 border-t border-gray-100 pt-3 dark:border-navy-700/60">
        {/* Health status banner */}
        <div className="flex items-center justify-between text-[11px] mb-3">
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

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onTestConnection(plugin.pluginKey)}
            disabled={isTesting}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700 disabled:opacity-50"
          >
            {isTesting ? (
              <Loader2 size={13} className="animate-spin text-brand-500" />
            ) : (
              <Activity size={13} className="text-brand-500" />
            )}
            <span>Test API</span>
          </button>

          <button
            type="button"
            onClick={() => onConfigure(plugin)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 py-2 text-xs font-semibold text-white transition-colors hover:bg-black dark:bg-navy-700 dark:hover:bg-navy-600"
          >
            <Settings2 size={13} />
            <span>Configure</span>
          </button>
        </div>
      </div>
    </div>
  );
}
