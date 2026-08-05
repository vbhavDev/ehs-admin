'use client';

import React from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { ToggleRight, ShieldAlert } from 'lucide-react';

export default function FeatureTogglePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="Feature Toggles" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Toggles</h1>
        <p className="text-sm text-gray-500 dark:text-navy-300">
          Dynamically enable or disable platform capabilities and experimental features
        </p>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-8 text-center shadow-xs">
        <div className="w-16 h-16 bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ToggleRight size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          System Feature Switches
        </h3>
        <p className="text-sm text-gray-500 dark:text-navy-300 max-w-md mx-auto mb-6">
          Super-admin feature switches allow live toggling of platform modules and system
          integrations without downtime.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-medium">
          <ShieldAlert size={16} />
          Changes made here affect global platform availability immediately.
        </div>
      </div>
    </div>
  );
}
