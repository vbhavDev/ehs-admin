'use client';

import React from 'react';
import { PluginStatusFilter } from '../hooks/usePlugins';
import { CheckCircle2, Sparkles, Layers } from 'lucide-react';

interface PluginStatusTabsProps {
  statusFilter: PluginStatusFilter;
  onSelectStatus: (status: PluginStatusFilter) => void;
  usedCount: number;
  availableCount: number;
  totalCount: number;
}

export function PluginStatusTabs({
  statusFilter,
  onSelectStatus,
  usedCount,
  availableCount,
  totalCount,
}: PluginStatusTabsProps) {
  const TABS: {
    id: PluginStatusFilter;
    label: string;
    description: string;
    icon: React.ElementType;
    count: number;
    badgeStyle: string;
    activeStyle: string;
  }[] = [
    {
      id: 'used',
      label: 'Used in Current System',
      description: 'Active & enabled integrations',
      icon: CheckCircle2,
      count: usedCount,
      badgeStyle: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
      activeStyle: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border-emerald-500',
    },
    {
      id: 'available',
      label: 'Available for Use',
      description: 'Ready to configure & enable',
      icon: Sparkles,
      count: availableCount,
      badgeStyle: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
      activeStyle: 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border-blue-600',
    },
    {
      id: 'all',
      label: 'All Integrations',
      description: 'Complete plugins catalog',
      icon: Layers,
      count: totalCount,
      badgeStyle: 'bg-gray-100 text-gray-700 dark:bg-navy-700 dark:text-gray-300',
      activeStyle: 'bg-brand-500 text-white shadow-md shadow-brand-500/20 border-brand-500',
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl bg-gray-100/80 p-1.5 dark:bg-navy-900/60 border border-gray-200/50 dark:border-navy-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = statusFilter === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectStatus(tab.id)}
              className={`flex-1 flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? tab.activeStyle
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 dark:text-gray-300 dark:hover:text-white dark:hover:bg-navy-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  size={16}
                  className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-400'}
                />
                <div className="text-left truncate">
                  <span className="block font-bold">{tab.label}</span>
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors ${
                  isActive ? 'bg-white/25 text-white' : tab.badgeStyle
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
