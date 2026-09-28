'use client';
import React from 'react';
import { useAuthStore } from '@/store/auth.store';
import Badge from '@/components/ui/badge/Badge';
import { ShieldCheck } from 'lucide-react';

/**
 * Dashboard greeting header — personalized with the signed-in admin's name and
 * role badge, plus the current date for operational context.
 */
export const DashboardHeader: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const today = new Date().toLocaleDateString('en', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-navy-300">
          Here&apos;s what&apos;s happening across the EHS Clubhouse platform · {today}
        </p>
      </div>
      {user?.role && (
        <Badge
          size="md"
          color="primary"
          startIcon={<ShieldCheck size={14} strokeWidth={2} />}
          className="self-start sm:self-center"
        >
          {user.role.name}
        </Badge>
      )}
    </div>
  );
};
