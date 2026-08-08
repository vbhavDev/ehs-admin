'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  LucideIcon,
  Palette,
  Smartphone,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandingTab } from './BrandingTab';
import { UiColorsTab } from './UiColorsTab';
import { PlatformTab } from './PlatformTab';
import { ClientThemeTab } from './ClientThemeTab';

interface TabDef {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

/** Grouped platform settings — Branding / UI Colors / Platform. */
export function SettingsTabs() {
  const tabs: TabDef[] = [
    {
      key: 'branding',
      label: 'Branding',
      description: 'Platform logo & favicon',
      icon: ImageIcon,
      content: <BrandingTab />,
    },
    {
      key: 'ui-colors',
      label: 'UI Colors',
      description: 'Theme & brand colors',
      icon: Palette,
      content: <UiColorsTab />,
    },
    {
      key: 'platform',
      label: 'Platform',
      description: 'Identity & operations',
      icon: SlidersHorizontal,
      content: <PlatformTab />,
    },
    {
      key: 'client-theme',
      label: 'Client Theme',
      description: 'Client app design config',
      icon: Smartphone,
      content: <ClientThemeTab />,
    },
  ];

  const [activeTab, setActiveTab] = useState('branding');
  const current = tabs.find((t) => t.key === activeTab) ?? tabs[0];
  if (!current) return null; // unreachable — tabs is a static non-empty list

  return (
    <div>
      {/* Tab bar — pill group with animated active state */}
      <div
        role="tablist"
        aria-label="Platform settings groups"
        className="inline-flex flex-wrap gap-1 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 dark:border-navy-700 dark:bg-navy-900/60"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-left transition-all duration-200',
                isActive
                  ? 'bg-white text-gray-900 shadow-theme-sm dark:bg-navy-800 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200',
                  isActive
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'bg-gray-100 text-gray-400 dark:bg-navy-800 dark:text-gray-500',
                )}
              >
                <tab.icon size={16} />
              </span>
              <span>
                <span className="block text-sm font-semibold leading-tight">{tab.label}</span>
                <span className="block text-[11px] leading-tight text-gray-400 dark:text-gray-500">
                  {tab.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div role="tabpanel" aria-label={current.label} className="mt-6">
        {current.content}
      </div>
    </div>
  );
}
