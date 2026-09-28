'use client';
import React, { useState } from 'react';
import { useRoles } from '@/modules/roles/hooks/useRoles';
import RoleTable from '@/modules/roles/components/RoleTable';
import { Role } from '@/types/user.types';
import { Plus, Shield, ShieldCheck, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RolesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'CLIENT'>('SYSTEM');
  const { roles, isLoading, updateRole, deleteRole } = useRoles(activeTab);

  const handleCreateNew = () => {
    router.push(`/roles-permission/create?scope=${activeTab}`);
  };

  const handleEdit = (role: Role) => {
    router.push(`/roles-permission/update?id=${role.id}`);
  };

  const handleToggleActive = async (role: Role) => {
    await updateRole({ id: role.id, data: { isActive: !role.isActive } });
  };

  return (
    <div className="space-y-8">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-8 sm:p-10 text-white shadow-xl shadow-brand-500/20">
        <div className="absolute inset-0 bg-[url('/img/grid.svg')] opacity-20 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white rounded-full blur-[100px] opacity-20 mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-brand-300 rounded-full blur-[120px] opacity-30 mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span className="text-xs font-semibold tracking-wide text-white uppercase">
                Access Management
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 drop-shadow-sm">
              Roles & Permissions
            </h1>
            <p className="text-brand-50 text-lg font-medium max-w-xl leading-relaxed opacity-95">
              Configure granular access controls, manage system privileges, and define tailored
              organizational hierarchies.
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="group relative flex items-center gap-2 bg-white text-brand-600 hover:bg-brand-50 hover:text-brand-700 hover:-translate-y-0.5 transition-all duration-300 shadow-xl shadow-brand-900/10 whitespace-nowrap px-6 py-3 rounded-xl overflow-hidden font-bold"
          >
            <Plus
              size={20}
              className="relative z-10 transition-transform duration-300 group-hover:rotate-90"
            />
            <span className="relative z-10">
              Create {activeTab === 'SYSTEM' ? 'System' : 'Client'} Role
            </span>
          </button>
        </div>
      </div>

      {/* Modern Segmented Tabs */}
      <div className="flex justify-center sm:justify-start">
        <div className="inline-flex bg-gray-100/80 dark:bg-navy-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/50 dark:border-navy-800/50 shadow-sm">
          <button
            onClick={() => setActiveTab('SYSTEM')}
            className={`relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ease-out ${
              activeTab === 'SYSTEM'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-navy-800/50'
            }`}
          >
            <Shield
              className={`w-4 h-4 transition-colors ${activeTab === 'SYSTEM' ? 'text-brand-500' : 'text-gray-400'}`}
            />
            <span className="relative z-10">System Roles</span>
          </button>

          <button
            onClick={() => setActiveTab('CLIENT')}
            className={`relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ease-out ${
              activeTab === 'CLIENT'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-navy-800/50'
            }`}
          >
            <Users
              className={`w-4 h-4 transition-colors ${activeTab === 'CLIENT' ? 'text-brand-500' : 'text-gray-400'}`}
            />
            <span className="relative z-10">Client Roles</span>
          </button>
        </div>
      </div>

      {/* Table Container with Glassmorphism */}
      <div className="bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-gray-200/60 dark:border-navy-800/60 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
        <RoleTable
          roles={roles}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={deleteRole}
          onToggleActive={handleToggleActive}
        />
      </div>
    </div>
  );
}
