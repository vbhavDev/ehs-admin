'use client';
import React from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { Role } from '@/types/user.types';
import { Edit, Trash2, Shield } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';

interface RoleTableProps {
  roles: Role[];
  isLoading: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
  onToggleActive: (role: Role) => void;
}

const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const columns: Column<Role>[] = [
    {
      header: 'Role Name',
      accessor: (role) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-500/20 dark:to-brand-500/5 border border-brand-200/50 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 shadow-inner">
            <Shield size={20} className="drop-shadow-sm" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 dark:text-white text-sm">{role.name}</span>
            <span className="text-[11px] font-medium text-gray-400 dark:text-navy-400 bg-gray-100 dark:bg-navy-800 px-2 py-0.5 rounded-md w-fit mt-1">
              {role.roleKey}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Permissions',
      accessor: (role) => (
        <div className="flex flex-wrap gap-1.5 max-w-[400px]">
          {role.permissions.slice(0, 5).map((perm) => (
            <Badge
              key={perm}
              variant="light"
              size="sm"
              className="bg-white dark:bg-navy-800 text-gray-600 dark:text-navy-300 border border-gray-200/60 dark:border-navy-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] font-medium"
            >
              {perm}
            </Badge>
          ))}
          {role.permissions.length > 5 && (
            <Badge
              variant="light"
              size="sm"
              className="bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20 font-bold"
            >
              +{role.permissions.length - 5} more
            </Badge>
          )}
          {role.permissions.length === 0 && (
            <span className="text-xs font-medium text-gray-400 dark:text-navy-400 italic bg-gray-50 dark:bg-navy-900 px-2.5 py-1 rounded-lg border border-dashed border-gray-200 dark:border-navy-700">
              No permissions assigned
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (role) => (
        <button
          onClick={() => onToggleActive(role)}
          className={`group relative overflow-hidden flex items-center justify-center px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 shadow-sm ${
            role.isActive
              ? 'bg-gradient-to-r from-success-50 to-success-100/50 dark:from-success-500/20 dark:to-success-500/10 text-success-600 dark:text-success-400 border border-success-200/50 dark:border-success-500/20 hover:shadow-success-500/20 hover:-translate-y-0.5'
              : 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-navy-800 dark:to-navy-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-navy-700 hover:shadow-gray-500/20 hover:-translate-y-0.5'
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
            {role.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0 whitespace-nowrap">
            {role.isActive ? 'Deactivate' : 'Activate'}
          </span>
          <span className="invisible whitespace-nowrap">
            {role.isActive ? 'Deactivate' : 'Activate'}
          </span>
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: (role) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(role)}
            className="group flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all duration-300 hover:shadow-sm"
            title="Edit Role"
          >
            <Edit size={16} className="transition-transform duration-300 group-hover:scale-110" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
                onDelete(role.id);
              }
            }}
            className="group flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-all duration-300 hover:shadow-sm"
            title="Delete Role"
          >
            <Trash2 size={16} className="transition-transform duration-300 group-hover:scale-110" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={roles}
      columns={columns}
      searchPlaceholder="Search roles..."
      isLoading={isLoading}
    />
  );
};

export default RoleTable;
