'use client';

import React from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Ticket, LifeBuoy } from 'lucide-react';

export default function SupportTicketPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="Support Tickets" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
        <p className="text-sm text-gray-500 dark:text-navy-300">
          Review customer inquiries, technical issues, and system support tickets
        </p>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-8 text-center shadow-xs">
        <div className="w-16 h-16 bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ticket size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Help Desk & Support Center
        </h3>
        <p className="text-sm text-gray-500 dark:text-navy-300 max-w-md mx-auto mb-6">
          Track and resolve incoming system support requests, ticket assignments, and user
          communications.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium">
          <LifeBuoy size={16} />
          Support desk ticket routing enabled
        </div>
      </div>
    </div>
  );
}
