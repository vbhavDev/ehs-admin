'use client';

import React from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { FileText, Plus } from 'lucide-react';
import Button from '@/components/ui/button/Button';

export default function PagesManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="Pages Management" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pages</h1>
          <p className="text-sm text-gray-500 dark:text-navy-300">
            Create, manage and publish site pages across websites
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={20} />
          Create New Page
        </Button>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-8 text-center shadow-xs">
        <div className="w-16 h-16 bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Page Content Management
        </h3>
        <p className="text-sm text-gray-500 dark:text-navy-300 max-w-md mx-auto mb-6">
          Manage dynamic site pages, custom templates, and website content hierarchies from this central hub.
        </p>
      </div>
    </div>
  );
}
