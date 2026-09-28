'use client';

import React from 'react';
import { ShieldX, TerminalSquare } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { SettingsTabs } from '@/modules/platform-settings/components/SettingsTabs';
import { useAuthStore } from '@/store/auth.store';

/** Platform settings are DevOps-exclusive (mirrors the sidebar group rule). */
const ALLOWED_ROLES = ['devops'];

export default function PlatformSettingsPage() {
  const { user } = useAuthStore();
  const isAllowed =
    user?.roles?.some((r: { roleKey: string }) => ALLOWED_ROLES.includes(r.roleKey)) ||
    (user?.role?.roleKey && ALLOWED_ROLES.includes(user.role.roleKey));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="Platform Settings" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-gray-900 dark:text-white">
            Platform Settings
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-500/25 bg-brand-500/5 px-2.5 py-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
              <TerminalSquare size={12} />
              DevOps
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Platform branding, UI colors, and operational configuration
          </p>
        </div>
      </div>

      {isAllowed ? (
        <SettingsTabs />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center dark:border-navy-700 dark:bg-navy-900/40">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error-500/10 text-error-500">
            <ShieldX size={26} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            DevOps access required
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Platform settings control branding and infrastructure behavior. Only users with the{' '}
            <span className="font-mono text-xs font-semibold">devops</span> role can make changes
            here.
          </p>
        </div>
      )}
    </div>
  );
}
