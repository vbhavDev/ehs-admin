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
      <div className="py-8 px-4 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 dark:bg-navy-700 rounded-md" />
            <div className="h-3 w-72 bg-gray-200 dark:bg-navy-700 rounded-md" />
          </div>
          <div className="h-9 w-24 bg-gray-200 dark:bg-navy-700 rounded-xl" />
        </div>
        <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-3xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 dark:bg-navy-700 rounded-md" />
              <div className="h-10 w-full bg-gray-100 dark:bg-navy-800 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 dark:bg-navy-700 rounded-md" />
              <div className="h-10 w-full bg-gray-100 dark:bg-navy-800 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 bg-gray-200 dark:bg-navy-700 rounded-md" />
            <div className="h-10 w-full bg-gray-100 dark:bg-navy-800 rounded-xl" />
          </div>
          <div className="h-12 w-full bg-gray-200 dark:bg-navy-700 rounded-xl mt-4" />
        </div>
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
