'use client';
import React, { useMemo } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { ToggleRight, ShieldAlert, Loader2, Lock } from 'lucide-react';
import { useFeatureFlags } from '@/modules/feature-flags/hooks/useFeatureFlags';
import { FeatureFlagCard } from '@/modules/feature-flags/components/FeatureFlagCard';
import { useHasPermission } from '@/lib/permissions';
import type { FeatureFlag } from '@/types/feature-flag.types';

export default function FeatureTogglePage() {
  const { flags, isLoading, toggleFlag, isToggling } = useFeatureFlags();
  const canUpdate = useHasPermission('feature-toggle.update');

  // Group flags by their `category` for organized sections.
  const grouped = useMemo(() => {
    const map = new Map<string, FeatureFlag[]>();
    flags.forEach((f) => {
      const list = map.get(f.category) || [];
      list.push(f);
      map.set(f.category, list);
    });
    return Array.from(map.entries());
  }, [flags]);

  const activeCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="Feature Toggles" />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Toggles</h1>
          <p className="text-sm text-gray-500 dark:text-navy-300">
            Live kill-switches for the admin panel & client app — changes take effect instantly.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 shadow-theme-xs dark:bg-navy-800 dark:text-gray-300">
          <span className="h-2 w-2 rounded-full bg-success-500" />
          {activeCount} active · {flags.length - activeCount} killed
        </div>
      </div>

      <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-500" />
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
          Toggling a flag <strong>instantly</strong> enables or disables that capability across the
          platform. Disabling <code>admin_login</code> blocks all admin sign-in immediately; the
          backend enforces these switches server-side so they cannot be bypassed from the UI.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : flags.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 text-center dark:border-navy-700">
          <ToggleRight size={32} className="mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-500 dark:text-navy-300">
            No feature flags configured. Run the feature-flags seeder to provision kill-switches.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, list]) => (
            <section key={category}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-navy-300">
                  {category}
                </h2>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-navy-700 dark:text-gray-400">
                  {list.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {list.map((flag) => (
                  <FeatureFlagCard
                    key={flag.id}
                    flag={flag}
                    onToggle={toggleFlag}
                    disabled={!canUpdate || isToggling}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {!canUpdate && flags.length > 0 && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-500 dark:bg-navy-700 dark:text-gray-400">
          <Lock size={14} /> Read-only — you need the <code>feature-toggle.update</code> permission
          to toggle switches.
        </div>
      )}
    </div>
  );
}
