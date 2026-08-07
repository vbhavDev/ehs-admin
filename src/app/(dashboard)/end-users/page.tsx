'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { EndUserTable } from '@/modules/end-users/components/EndUserTable';
import { EndUser } from '@/types/end-user.types';
import { useEndUsers } from '@/modules/end-users/hooks/useEndUsers';
import Button from '@/components/ui/button/Button';
import { Plus } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useGlobalModal } from '@/hooks/useGlobalModal';

export default function EndUsersPage() {
  const router = useRouter();
  const { deleteEndUser } = useEndUsers();
  const { confirm } = useGlobalModal();

  const handleCreate = () => {
    router.push('/end-users/create');
  };

  const handleEdit = (user: EndUser) => {
    router.push(`/end-users/update/${user.id}`);
  };

  const handleDelete = async (user: EndUser) => {
    confirm({
      title: 'Delete End User',
      message: `Are you sure you want to delete "${user.fullName}" (${user.email})? This action cannot be undone.`,
      confirmText: 'Delete End User',
      type: 'danger',
      onConfirm: async () => {
        await deleteEndUser(user.id);
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="End Users" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage End Users</h1>
          <p className="text-sm text-gray-500">
            Cross-org view of all client-facing end users (individuals and org members)
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          Add New End User
        </Button>
      </div>

      <EndUserTable onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
