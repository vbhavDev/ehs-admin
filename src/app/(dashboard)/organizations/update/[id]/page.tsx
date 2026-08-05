'use client';
import { OrganizationForm } from '@/modules/organizations/components/OrganizationForm';
import { useParams } from 'next/navigation';
import { useOrganization } from '@/modules/organizations/hooks/useOrganizations';

export default function UpdateOrganizationPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: org, isLoading, isError } = useOrganization(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !org) {
    return (
      <div className="flex justify-center items-center h-64 text-error-500 font-medium">
        Failed to load organization data. Organization might not exist.
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <OrganizationForm initialData={org} />
    </div>
  );
}
