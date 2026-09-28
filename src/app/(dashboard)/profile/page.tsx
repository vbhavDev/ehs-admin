'use client';

import React from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { ProfileMetaCard } from '@/modules/profile/components/ProfileMetaCard';
import { RolePermissionsCard } from '@/modules/profile/components/RolePermissionsCard';
import { ProfileInfoForm } from '@/modules/profile/components/ProfileInfoForm';
import { ChangePasswordForm } from '@/modules/profile/components/ChangePasswordForm';

export default function ProfilePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="Profile" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your personal details, profile photo, password, and review your assigned role
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Identity + role (read-only) */}
        <div className="space-y-6 xl:col-span-4">
          <ProfileMetaCard />
          <RolePermissionsCard />
        </div>

        {/* Editable forms */}
        <div className="space-y-6 xl:col-span-8">
          <ProfileInfoForm />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
