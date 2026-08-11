'use client';

import React from 'react';
import { PluginCategory } from '@/types/plugin.types';
import { Grid, Mail, CreditCard, MessageSquare, Database, Cpu, Sliders } from 'lucide-react';

interface CategoryTabsProps {
  selectedCategory: PluginCategory | 'all';
  onSelectCategory: (category: PluginCategory | 'all') => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: { id: PluginCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Plugins', icon: Grid },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'payment', label: 'Payments', icon: CreditCard },
  { id: 'whatsapp', label: 'WhatsApp API', icon: MessageSquare },
  { id: 'sms', label: 'SMS & Messaging', icon: Sliders },
  { id: 'storage', label: 'Cloud Storage', icon: Database },
  { id: 'ai', label: 'AI & Vision', icon: Cpu },
];

export function CategoryTabs({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = selectedCategory === cat.id;
        const count = categoryCounts[cat.id] || 0;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`group inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              isActive
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700 dark:hover:text-white border border-gray-100 dark:border-navy-700'
            }`}
          >
            <Icon
              size={14}
              className={
                isActive
                  ? 'text-white'
                  : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'
              }
            />
            <span>{cat.label}</span>
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
