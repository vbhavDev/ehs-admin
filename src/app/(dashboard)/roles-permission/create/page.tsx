'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useRoles } from '@/modules/roles/hooks/useRoles';
import RoleForm from '@/modules/roles/components/RoleForm';
import { Role } from '@/types/user.types';
import { Shield } from 'lucide-react';

export default function CreateRolePage({ searchParams }: { searchParams: { scope?: string } }) {
  const router = useRouter();
  const { createRole, isCreating } = useRoles();
  const scope = searchParams.scope === 'CLIENT' ? 'CLIENT' : 'SYSTEM';

  const handleCancel = () => {
    router.push('/roles-permission');
  };

  const handleSubmit = async (data: Omit<Role, 'id'>) => {
    await createRole({ ...data, scope });
    router.push('/roles-permission');
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
              Create {scope === 'CLIENT' ? 'Client' : 'System'} Role
            </h1>
            <p className="text-brand-50 text-lg font-medium max-w-xl leading-relaxed opacity-95">
              Define a new {scope === 'CLIENT' ? 'client' : 'system'} role and carefully assign the
              exact permissions needed for this position.
            </p>
          </div>
        </div>
      </div>

      <RoleForm
        onSubmit={handleSubmit}
        isLoading={isCreating}
        onCancel={handleCancel}
        scope={scope}
      />
    </div>
  );
}
