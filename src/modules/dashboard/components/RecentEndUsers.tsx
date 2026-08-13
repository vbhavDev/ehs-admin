'use client';
import React from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/badge/Badge';
import { ChartCard } from './ChartCard';
import type { EndUser } from '@/types/end-user.types';
import { END_USER_ROLE_LABELS } from '@/types/end-user.types';

interface RecentEndUsersProps {
  endUsers: EndUser[];
  className?: string;
}

const initials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Five most recently registered end users with role + verification state. */
export const RecentEndUsers: React.FC<RecentEndUsersProps> = ({
  endUsers,
  className = 'col-span-12 md:col-span-6 xl:col-span-4',
}) => {
  return (
    <ChartCard
      title="Recent End Users"
      subtitle="Latest customer sign-ups across the platform"
      className={className}
      action={
        <Link
          href="/end-users"
          className="shrink-0 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          View all
        </Link>
      }
    >
      {endUsers.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-sm font-medium text-gray-400 dark:text-navy-300">
            No end users registered yet
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-navy-700">
          {endUsers.map((user) => {
            const activeMembership = user.orgMemberships?.find((m) => m.status === 'active');
            const roleLabel = activeMembership?.role
              ? END_USER_ROLE_LABELS[activeMembership.role] || activeMembership.role
              : user.isIndividualSubscriber
                ? 'Individual'
                : 'No Active Role';
            return (
              <li key={user.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-sm font-bold text-blue-light-500 dark:bg-blue-light-500/10">
                  {initials(user.fullName || user.email)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {user.fullName}
                  </p>
                  <p className="truncate text-xs text-gray-400 dark:text-navy-300">{user.email}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge
                    size="sm"
                    color={activeMembership || user.isIndividualSubscriber ? 'info' : 'light'}
                  >
                    {roleLabel}
                  </Badge>
                  {user.isEmailVerified ? (
                    <span className="text-[11px] font-medium text-success-600 dark:text-success-500">
                      Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-warning-600 dark:text-warning-500">
                      Pending verification
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ChartCard>
  );
};
