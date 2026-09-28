'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EndUserTable } from '@/modules/end-users/components/EndUserTable';
import { InviteEndUserModal } from '@/modules/end-users/components/InviteEndUserModal';
import { EndUser } from '@/types/end-user.types';
import { useEndUsers } from '@/modules/end-users/hooks/useEndUsers';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useGlobalModal } from '@/hooks/useGlobalModal';

export default function EndUsersPage() {
  const router = useRouter();
  const { deleteEndUser } = useEndUsers();
  const { confirm } = useGlobalModal();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleView = (user: EndUser) => {
    router.push(`/end-users/view/${user.id}`);
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

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            End Users
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cross-org view of all client-facing users — individuals and organization members.
          </p>
        </div>
        {/*        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2"
          >
            <MailPlus size={18} />
            Invite User
          </Button>
          <Button onClick={handleCreate} className="flex items-center gap-2 shadow-theme-xs">
            <Plus size={20} />
            Add End User
          </Button>
        </div>*/}
      </div>

      <EndUserTable onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />

      <InviteEndUserModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  );
}
