'use client';
import { EndUserForm } from '@/modules/end-users/components/EndUserForm';
import { useParams } from 'next/navigation';
import { useEndUser } from '@/modules/end-users/hooks/useEndUsers';

export default function UpdateEndUserPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: user, isLoading, isError } = useEndUser(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex justify-center items-center h-64 text-error-500 font-medium">
        Failed to load end user data. User might not exist.
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <EndUserForm initialData={user} />
    </div>
  );
}
