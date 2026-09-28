'use client';

import React from 'react';
import { Blocks, CheckCircle2, Sparkles, Activity } from 'lucide-react';
import { PluginStatusFilter } from '../hooks/usePlugins';

interface PluginStatsBarProps {
  totalCount: number;
  usedCount: number;
  availableCount: number;
  verifiedCount: number;
  statusFilter: PluginStatusFilter;
  onSelectStatus: (status: PluginStatusFilter) => void;
}

export function PluginStatsBar({
  totalCount,
  usedCount,
  availableCount,
  verifiedCount,
  statusFilter,
  onSelectStatus,
}: PluginStatsBarProps) {
  const cards = [
    {
      id: 'used' as const,
      title: 'Used in Current System',
      value: usedCount,
      subtitle: 'Active & enabled plugins',
      icon: CheckCircle2,
      badge: 'In Use',
      gradient: 'from-emerald-500 to-teal-600',
      activeRing:
        'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20',
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    {
      id: 'available' as const,
      title: 'Available for Use',
      value: availableCount,
      subtitle: 'Ready to configure & enable',
      icon: Sparkles,
      badge: 'Available',
      gradient: 'from-blue-500 to-indigo-600',
      activeRing: 'border-blue-500/50 bg-blue-500/5 dark:bg-blue-500/10 ring-2 ring-blue-500/20',
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    },
    {
      id: 'all' as const,
      title: 'Total Integrations',
      value: totalCount,
      subtitle: 'All registered 3rd party plugins',
      icon: Blocks,
      badge: 'Catalog',
      gradient: 'from-purple-500 to-indigo-600',
      activeRing:
        'border-brand-500/50 bg-brand-500/5 dark:bg-brand-500/10 ring-2 ring-brand-500/20',
      iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    },
    {
      id: null,
      title: 'Verified Connections',
      value: verifiedCount,
      subtitle: 'Passed health test',
      icon: Activity,
      badge: 'Health',
      gradient: 'from-amber-500 to-orange-600',
      activeRing: '',
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isClickable = card.id !== null;
        const isActive = isClickable && statusFilter === card.id;

        return (
          <div
            key={card.title}
            onClick={() => isClickable && card.id && onSelectStatus(card.id)}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
              isClickable ? 'cursor-pointer hover:shadow-md active:scale-[0.99]' : ''
            } ${
              isActive
                ? card.activeRing
                : 'border-gray-100 bg-white dark:border-navy-800 dark:bg-navy-900/80 hover:border-gray-200 dark:hover:border-navy-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${card.iconBg}`}
              >
                <Icon size={20} />
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 text-gray-500 dark:bg-navy-800 dark:text-gray-400'
                }`}
              >
                {card.badge}
              </span>
            </div>

            <div>
              <h4 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                {card.value}
              </h4>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-0.5 truncate">
                {card.title}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
