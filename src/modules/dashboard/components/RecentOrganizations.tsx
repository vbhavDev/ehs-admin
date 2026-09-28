'use client';
import React from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import { ChartCard } from './ChartCard';
import type { Organization } from '@/types/organization.types';
import { ORGANIZATION_STATUS_LABELS } from '@/types/organization.types';

type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

const STATUS_BADGE_COLORS: Record<string, BadgeColor> = {
  active: 'success',
  pending_setup: 'warning',
  suspended: 'error',
  expired: 'light',
  canceled: 'dark',
};

interface RecentOrganizationsProps {
  organizations: Organization[];
  className?: string;
}

/** Five most recently onboarded organizations with status + seat usage. */
export const RecentOrganizations: React.FC<RecentOrganizationsProps> = ({
  organizations,
  className = 'col-span-12 md:col-span-6 xl:col-span-4',
}) => {
  return (
    <ChartCard
      title="Recent Organizations"
      subtitle="Latest tenants onboarded to the platform"
      className={className}
      action={
        <Link
          href="/organizations"
          className="shrink-0 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          View all
        </Link>
      }
    >
      {organizations.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-sm font-medium text-gray-400 dark:text-navy-300">
            No organizations onboarded yet
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-navy-700">
          {organizations.map((org) => {
            const seatPercent =
              org.seatLimit > 0
                ? Math.min(100, Math.round((org.usedSeats / org.seatLimit) * 100))
                : 0;
            return (
              <li key={org.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
                  <Building2 size={20} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {org.companyName}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-navy-700">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${seatPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 dark:text-navy-300">
                      {org.usedSeats}/{org.seatLimit} seats
                    </span>
                  </div>
                </div>
                <Badge size="sm" color={STATUS_BADGE_COLORS[org.status] || 'light'}>
                  {ORGANIZATION_STATUS_LABELS[org.status] || org.status}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </ChartCard>
  );
};
