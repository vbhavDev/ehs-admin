'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEndUser } from '@/modules/end-users/hooks/useEndUsers';
import { EndUserDetail } from '@/modules/end-users/components/EndUserDetail';

export default function ViewEndUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: user, isLoading, isError } = useEndUser(id);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-navy-700 rounded-xl" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 dark:bg-navy-700 rounded-md" />
              <div className="h-3 w-32 bg-gray-200 dark:bg-navy-700 rounded-md" />
            </div>
          </div>
          <div className="h-9 w-24 bg-gray-200 dark:bg-navy-700 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-navy-700 mx-auto" />
            <div className="h-5 w-36 bg-gray-200 dark:bg-navy-700 rounded-md mx-auto" />
            <div className="h-3 w-48 bg-gray-200 dark:bg-navy-700 rounded-md mx-auto" />
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 space-y-4">
            <div className="h-5 w-32 bg-gray-200 dark:bg-navy-700 rounded-md" />
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="h-10 bg-gray-100 dark:bg-navy-800 rounded-xl" />
              <div className="h-10 bg-gray-100 dark:bg-navy-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
        <p className="font-medium text-error-500">Failed to load user. They may not exist.</p>
        <button
          onClick={() => router.push('/end-users')}
          className="text-sm font-medium text-brand-500 hover:underline"
        >
          Back to End Users
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EndUserDetail
        user={user}
        onBack={() => router.push('/end-users')}
        onEdit={(u) => router.push(`/end-users/update/${u.id}`)}
      />
    </div>
  );
}
