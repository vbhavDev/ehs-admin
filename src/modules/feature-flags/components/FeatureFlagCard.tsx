'use client';
import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import type { FeatureFlag } from '@/types/feature-flag.types';

interface FeatureFlagCardProps {
  flag: FeatureFlag;
  onToggle: (flag: FeatureFlag) => void;
  disabled?: boolean;
}

const DEFAULT_SCOPE_BADGE = {
  label: 'Both',
  classes: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
};

const SCOPE_BADGE: Record<string, { label: string; classes: string }> = {
  admin: {
    label: 'Admin',
    classes: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
  },
  client: {
    label: 'Client',
    classes: 'bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15',
  },
  both: DEFAULT_SCOPE_BADGE,
};

const getScopeBadge = (scope: string): { label: string; classes: string } => {
  const found = SCOPE_BADGE[scope];
  return found ?? DEFAULT_SCOPE_BADGE;
};

/** A single feature flag with an instant on/off kill-switch toggle. */
export const FeatureFlagCard: React.FC<FeatureFlagCardProps> = ({ flag, onToggle, disabled }) => {
  const scope = getScopeBadge(flag.scope);
  const locked = !!flag.isLocked;

  return (
    <div
      className={`relative flex items-start justify-between gap-4 rounded-2xl border p-5 transition-colors ${
        flag.enabled
          ? 'border-success-200 bg-success-50/40 dark:border-success-500/20 dark:bg-success-500/5'
          : 'border-gray-200 bg-gray-50/60 dark:border-navy-700 dark:bg-navy-800'
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{flag.label}</h3>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${scope.classes}`}
          >
            {scope.label}
          </span>
          {locked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-navy-700 dark:text-gray-400">
              <Lock size={10} /> Locked
            </span>
          )}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-navy-300">
          {flag.description}
        </p>
        <p className="mt-2 font-mono text-[10px] text-gray-400 dark:text-navy-400">{flag.key}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={flag.enabled}
        aria-label={`Toggle ${flag.label}`}
        disabled={locked || disabled}
        onClick={() => onToggle(flag)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
          flag.enabled ? 'bg-success-500' : 'bg-gray-300 dark:bg-navy-600'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
            flag.enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>

      {!flag.enabled && (
        <div className="absolute -top-2 right-12 inline-flex items-center gap-1 rounded-full bg-error-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
          <ShieldAlert size={10} /> KILLED
        </div>
      )}
    </div>
  );
};
