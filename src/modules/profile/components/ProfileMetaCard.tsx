'use client';

import React, { useState } from 'react';
import { CalendarDays, Camera, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { FileUploadModal } from '@/modules/media/components/FileUploadModal';
import { useProfile, useAvatarUrl } from '../hooks/useProfile';

/**
 * Identity card — gradient banner, glassmorphic surface, gradient-ringed
 * avatar. Photo changes go through the shared admin FileUploadModal
 * (Local / External URL sources — no media-library browsing).
 */
export function ProfileMetaCard() {
  const { user } = useAuthStore();
  const { updateAvatar, isUpdatingAvatar } = useProfile();
  const avatarUrl = useAvatarUrl(user);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const roleName = user?.role?.name ?? 'Member';
  const roleKey = user?.role?.roleKey ?? '';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-xl">
      {/* Gradient banner with soft glow blobs */}
      <div className="relative h-28 bg-gradient-to-r from-brand-700 via-brand-500 to-orange-500">
        <div className="absolute -left-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-orange-300/30 blur-xl" />
      </div>

      <div className="px-6 pb-6">
        {/* Avatar with gradient ring + upload overlay */}
        <div className="-mt-12 mb-4 flex items-end justify-between">
          <div className="group relative">
            <div className="rounded-full bg-gradient-to-tr from-brand-500 via-brand-400 to-orange-400 p-[3px] shadow-lg transition-transform duration-300 group-hover:scale-[1.03]">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-navy-100 dark:border-gray-950 dark:bg-navy-800">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${user?.fullName ?? 'User'} profile photo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-brand-500">
                    {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                  </span>
                )}
                {isUpdatingAvatar && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="animate-spin text-white" size={24} />
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              disabled={isUpdatingAvatar}
              aria-label="Change profile photo"
              className="absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md transition-all duration-200 hover:scale-110 hover:bg-brand-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300"
            >
              <Camera size={18} />
            </button>
          </div>
        </div>

        {/* Identity */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.fullName ?? '—'}</h2>
        <p className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Mail size={14} className="shrink-0" />
          <span className="truncate">{user?.email ?? '—'}</span>
        </p>

        {/* Role badge + meta chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-gradient-to-r from-brand-500/10 to-orange-500/10 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
            <ShieldCheck size={14} />
            {roleName}
          </span>
          {roleKey && (
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 font-mono text-[11px] text-gray-500 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-400">
              {roleKey}
            </span>
          )}
          {memberSince && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <CalendarDays size={14} />
              Joined {memberSince}
            </span>
          )}
        </div>
      </div>

      {/* Shared admin upload dialog (no library browsing for avatars) */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={(uploaded) => {
          void updateAvatar(uploaded.id).catch(() => {
            // Error toast handled by the mutation
          });
        }}
        defaultModule="users"
        entityType="system-user"
        entityId={user?.id ?? 'none'}
        accept="image/*"
      />
    </div>
  );
}
