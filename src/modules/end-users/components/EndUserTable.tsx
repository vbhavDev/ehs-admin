'use client';
import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { EndUser, END_USER_ROLE_LABELS } from '@/types/end-user.types';
import { useEndUsers } from '../hooks/useEndUsers';
import { Edit, Trash2, User as UserIcon, BadgeCheck, Building2 } from 'lucide-react';

interface EndUserTableProps {
  onEdit: (user: EndUser) => void;
  onDelete: (user: EndUser) => void;
}

export const EndUserTable: React.FC<EndUserTableProps> = ({ onEdit, onDelete }) => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { endUsers, meta, isLoading, updateEndUser } = useEndUsers(params);

  const handleToggleActive = async (user: EndUser) => {
    await updateEndUser({ id: user.id, data: { isActive: !user.isActive } });
  };

  const getActiveMemberships = (user: EndUser) =>
    (user.orgMemberships || []).filter((m) => m.status === 'active');

  const columns: Column<EndUser>[] = [
    {
      header: 'User',
      accessor: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
            <UserIcon size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (user) =>
        user.isIndividualSubscriber ? (
          <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
            Individual
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            <Building2 size={12} />
            Org Member
          </span>
        ),
    },
    {
      header: 'Org Roles',
      accessor: (user) => {
        const active = getActiveMemberships(user);
        if (active.length === 0) {
          return <span className="text-xs text-gray-400">—</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {active.map((m) => (
              <span
                key={m.orgId}
                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-navy-700 dark:text-gray-300"
              >
                {END_USER_ROLE_LABELS[m.role] || m.role}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      header: 'Verified',
      accessor: (user) =>
        user.isEmailVerified ? (
          <span className="inline-flex items-center gap-1 text-success-600 dark:text-success-500">
            <BadgeCheck size={16} />
            <span className="text-xs font-semibold">Verified</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400">Not verified</span>
        ),
    },
    {
      header: 'Status',
      accessor: (user) => (
        <button
          onClick={() => handleToggleActive(user)}
          className={`group relative overflow-hidden flex items-center justify-center px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors duration-300 ${
            user.isActive
              ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/15 dark:hover:text-error-500'
              : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500 hover:bg-success-50 hover:text-success-600 dark:hover:bg-success-500/15 dark:hover:text-success-500'
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0 whitespace-nowrap">
            {user.isActive ? 'Click to deactivate' : 'Click to activate'}
          </span>
          <span className="invisible whitespace-nowrap">
            {user.isActive ? 'Click to deactivate' : 'Click to activate'}
          </span>
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(user)}
            className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-1.5 text-gray-500 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={endUsers}
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
