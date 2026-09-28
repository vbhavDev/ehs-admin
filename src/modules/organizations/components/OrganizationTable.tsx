'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { Organization, ORGANIZATION_STATUS_LABELS } from '@/types/organization.types';
import { useOrganizations } from '../hooks/useOrganizations';
import { Edit, Trash2, Building2, Eye } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface OrganizationTableProps {
  onEdit: (org: Organization) => void;
  onDelete: (org: Organization) => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
  suspended: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
  pending_setup: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  expired: 'bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-300',
  canceled: 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400',
};

const getOrgLogoUrl = (org: Organization): string => {
  if (!org.logoFileId) return '';
  const logoObj =
    typeof org.logoFileId === 'object' && org.logoFileId !== null
      ? (org.logoFileId as { url?: string; id?: string })
      : null;
  if (logoObj?.url) {
    return logoObj.url;
  }
  const fileId = typeof org.logoFileId === 'string' ? org.logoFileId : logoObj?.id;
  return getImageUrl(fileId);
};

export const OrganizationTable: React.FC<OrganizationTableProps> = ({ onEdit, onDelete }) => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { organizations, meta, isLoading } = useOrganizations(params);

  const getPlanName = (org: Organization) => {
    if (org.subscriptionPlanId && typeof org.subscriptionPlanId === 'object') {
      return org.subscriptionPlanId.name || '—';
    }
    return '—';
  };

  const columns: Column<Organization>[] = [
    {
      header: 'Organization',
      accessor: (org) => {
        const logoUrl = getOrgLogoUrl(org);
        return (
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/80 dark:border-navy-700 bg-white dark:bg-navy-800 overflow-hidden shrink-0 shadow-sm">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={org.companyName}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-50 dark:bg-brand-500/15 text-brand-500 dark:text-brand-400">
                  <Building2 size={20} />
                </div>
              )}
            </div>
            <div>
              <Link
                href={`/organizations/${org.id}`}
                className="text-sm font-bold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              >
                {org.companyName}
              </Link>
              <p className="text-xs text-gray-500">/{org.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Plan',
      accessor: (org) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getPlanName(org)}
        </span>
      ),
    },
    {
      header: 'Seats',
      accessor: (org) => {
        const percent =
          org.seatLimit > 0 ? Math.min(100, (org.usedSeats / org.seatLimit) * 100) : 0;
        return (
          <div className="w-32">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {org.usedSeats} / {org.seatLimit}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-navy-700">
              <div
                className={`h-1.5 rounded-full ${percent >= 90 ? 'bg-error-500' : percent >= 70 ? 'bg-amber-500' : 'bg-success-500'}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Contact',
      accessor: (org) => (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {org.contactPersonName || '—'}
          </p>
          <p className="text-xs text-gray-500">{org.contactPersonEmail || ''}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (org) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            STATUS_COLORS[org.status] || STATUS_COLORS.canceled
          }`}
        >
          {ORGANIZATION_STATUS_LABELS[org.status] || org.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (org) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/organizations/${org.id}`}
            className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
            title="View Dashboard"
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={() => onEdit(org)}
            className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
            title="Edit Organization"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(org)}
            className="p-1.5 text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-lg transition-colors"
            title="Delete Organization"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={organizations}
      columns={columns}
      isLoading={isLoading}
      serverSide
      totalItems={meta?.total}
      page={params.page}
      limit={params.limit}
      search={params.search}
      onPageChange={(page) => setParams((p) => ({ ...p, page }))}
      onPageSizeChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
      onSearchChange={(search) => setParams((p) => ({ ...p, search, page: 1 }))}
    />
  );
};
