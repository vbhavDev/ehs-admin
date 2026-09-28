'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrganization } from '@/modules/organizations/hooks/useOrganizations';
import { OrganizationDashboardView } from '@/modules/organizations/components/OrganizationDashboardView';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function OrganizationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : null;

  const { data: organization, isLoading, isError } = useOrganization(id);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <PageBreadcrumb pageTitle="Loading Organization..." />
        <div className="h-44 rounded-2xl bg-gray-100 dark:bg-navy-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-100 dark:bg-navy-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !organization) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <PageBreadcrumb pageTitle="Organization Not Found" />
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 dark:bg-rose-500/10 flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Organization Not Found
          </h2>
          <p className="text-sm text-gray-500 max-w-md mb-6">
            The organization you are looking for does not exist or may have been deleted.
          </p>
          <Button onClick={() => router.push('/organizations')} className="flex items-center gap-2">
            <ArrowLeft size={18} />
            Back to Organizations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageBreadcrumb pageTitle={`${organization.companyName} Dashboard`} />
      <OrganizationDashboardView organization={organization} />
    </div>
  );
}
