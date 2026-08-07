'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { OrganizationTable } from '@/modules/organizations/components/OrganizationTable';
import { Organization } from '@/types/organization.types';
import { useOrganizations } from '@/modules/organizations/hooks/useOrganizations';
import Button from '@/components/ui/button/Button';
import { Plus } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useGlobalModal } from '@/hooks/useGlobalModal';

export default function OrganizationsPage() {
  const router = useRouter();
  const { deleteOrganization } = useOrganizations();
  const { confirm } = useGlobalModal();

  const handleCreate = () => {
    router.push('/organizations/create');
  };

  const handleEdit = (org: Organization) => {
    router.push(`/organizations/update/${org.id}`);
  };

  const handleDelete = async (org: Organization) => {
    confirm({
      title: 'Delete Organization',
      message: `Are you sure you want to delete "${org.companyName}"? All associated org members will lose access. This action cannot be undone.`,
      confirmText: 'Delete Organization',
      type: 'danger',
      onConfirm: async () => {
        await deleteOrganization(org.id);
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="Organizations" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Organizations</h1>
          <p className="text-sm text-gray-500">
            Create and manage tenant organizations, their plans and seat usage
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          Add New Organization
        </Button>
      </div>

      <OrganizationTable onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
