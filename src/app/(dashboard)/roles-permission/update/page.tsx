'use client';
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRoles, useRole } from '@/modules/roles/hooks/useRoles';
import RoleForm from '@/modules/roles/components/RoleForm';
import { Role } from '@/types/user.types';
import { Shield, Loader2 } from 'lucide-react';

function UpdateRoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { updateRole, isUpdating } = useRoles();
  const { data: role, isLoading: isLoadingRole } = useRole(id);

  const handleCancel = () => {
    router.push('/roles-permission');
  };

  const handleSubmit = async (data: Omit<Role, 'id'>) => {
    if (id) {
      await updateRole({ id, data });
      router.push('/roles-permission');
    }
  };

  if (isLoadingRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading role details...</p>
      </div>
    );
  }

  if (!role && !isLoadingRole) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
        <h2 className="text-lg font-bold text-red-800 dark:text-red-400">Role Not Found</h2>
        <p className="text-red-600 dark:text-red-400/80 mt-2">
          The role you are trying to edit does not exist or has been deleted.
        </p>
        <button
          onClick={handleCancel}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-8 sm:p-10 text-white shadow-xl shadow-brand-500/20">
        <div className="absolute inset-0 bg-[url('/img/grid.svg')] opacity-20 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white rounded-full blur-[100px] opacity-20 mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-brand-300 rounded-full blur-[120px] opacity-30 mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/30 transition-colors"
              onClick={handleCancel}
            >
              <span className="text-xs font-bold tracking-wide text-white uppercase">
                &larr; Back to Roles
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 drop-shadow-sm flex items-center gap-3">
              <Shield className="w-8 h-8 text-white" />
              Edit Role: {role?.name}
            </h1>
            <p className="text-brand-50 text-lg font-medium max-w-xl leading-relaxed opacity-95">
              Update permissions and role settings for {role?.name} to match evolving organizational
              requirements.
            </p>
          </div>
        </div>
      </div>

      <RoleForm
        initialData={role}
        onSubmit={handleSubmit}
        isLoading={isUpdating}
        onCancel={handleCancel}
        scope={role?.scope || 'SYSTEM'}
      />
    </div>
  );
}

export default function UpdateRolePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        </div>
      }
    >
      <UpdateRoleContent />
    </Suspense>
  );
}
