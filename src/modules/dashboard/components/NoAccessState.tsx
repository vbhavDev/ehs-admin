'use client';
import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

/**
 * Fallback for signed-in users whose role carries no view permissions for any
 * dashboard-backed module (e.g. a freshly created staff account).
 */
export const NoAccessState: React.FC = () => {
  const roleName = useAuthStore((s) => s.user?.role?.name);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center dark:border-navy-700 dark:bg-navy-800">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
        <LayoutDashboard size={32} strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Your dashboard is being set up
      </h2>
      <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-navy-300">
        {roleName ? `The ${roleName} role` : 'Your account'} doesn&apos;t have access to any
        dashboard modules yet. Once an administrator grants view permissions, live platform metrics
        and charts will appear here.
      </p>
    </div>
  );
};
