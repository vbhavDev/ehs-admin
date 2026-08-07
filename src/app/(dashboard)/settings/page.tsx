'use client';

import React from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Settings, Shield, Server, Bell, Key } from 'lucide-react';

export default function SystemSettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="Settings" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="text-sm text-gray-500 dark:text-navy-300">
          Configure global platform settings, security policies, and integrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-6 shadow-xs hover:border-brand-500/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Settings size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">General Preferences</h3>
          <p className="text-xs text-gray-500 dark:text-navy-300">
            Platform identity, default localization, and application defaults
          </p>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-6 shadow-xs hover:border-brand-500/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Shield size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Security & Auth</h3>
          <p className="text-xs text-gray-500 dark:text-navy-300">
            Session expiration, password rules, and 2FA authentication options
          </p>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-6 shadow-xs hover:border-brand-500/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-violet-500/10 text-violet-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Server size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Storage & Infrastructure
          </h3>
          <p className="text-xs text-gray-500 dark:text-navy-300">
            Configure S3/R2 cloud storage buckets and local file fallbacks
          </p>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-6 shadow-xs hover:border-brand-500/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Bell size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Notification Controls
          </h3>
          <p className="text-xs text-gray-500 dark:text-navy-300">
            Manage system alert dispatches and error reporting thresholds
          </p>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-6 shadow-xs hover:border-brand-500/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Key size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            API Credentials & Keys
          </h3>
          <p className="text-xs text-gray-500 dark:text-navy-300">
            Generate and manage external API access tokens and webhooks
          </p>
        </div>
      </div>
    </div>
  );
}
