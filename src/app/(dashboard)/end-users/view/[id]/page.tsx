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
      <div className="flex h-96 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
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
