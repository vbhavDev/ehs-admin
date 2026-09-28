'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProfileSectionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/**
 * Shared section shell for profile panels — gradient icon tile, title,
 * subtitle, and a glassmorphic dark surface consistent with the admin theme.
 */
export function ProfileSectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: ProfileSectionCardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm transition-shadow duration-300 hover:shadow-theme-md dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-xl">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-orange-500/15 text-brand-500 ring-1 ring-brand-500/20 dark:text-brand-400">
          <Icon size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
