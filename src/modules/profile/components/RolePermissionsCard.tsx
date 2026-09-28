'use client';

import React from 'react';
import { Check, Crown, ShieldCheck } from 'lucide-react';
import { ProfileSectionCard } from './ProfileSectionCard';
import { useAuthStore } from '@/store/auth.store';

/**
 * Read-only view of the user's assigned role and its permissions —
 * roles are granted by platform admins, never editable from the profile page.
 */
export function RolePermissionsCard() {
  const { user, roleKey, permissions } = useAuthStore();

  const roleName = user?.role?.name ?? 'Member';
  const isSuperAdmin = permissions.includes('*');

  return (
    <ProfileSectionCard
      icon={ShieldCheck}
      title="Assigned role"
      subtitle="Your access level in this panel — managed by platform admins"
    >
      {isSuperAdmin ? (
        <div className="rounded-xl border border-brand-500/25 bg-gradient-to-r from-brand-500/10 via-orange-500/10 to-brand-500/10 p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-md">
              <Crown size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{roleName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Full, unrestricted platform access
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{roleName}</span>
            {roleKey && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-[11px] text-gray-500 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-400">
                {roleKey}
              </span>
            )}
          </div>

          {permissions.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {permissions.length} permission{permissions.length === 1 ? '' : 's'}
              </p>
              <ul className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto pr-1">
                {permissions.map((permission) => (
                  <li
                    key={permission}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 transition-colors duration-200 hover:border-success-500/30 hover:bg-success-500/5 hover:text-success-600 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-400 dark:hover:text-success-400"
                  >
                    <Check size={12} className="text-success-500" />
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No granular permissions assigned to this role.
            </p>
          )}
        </div>
      )}
    </ProfileSectionCard>
  );
}
