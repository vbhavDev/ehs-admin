'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Save, UserCircle2 } from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { ProfileSectionCard } from './ProfileSectionCard';
import { useProfile } from '../hooks/useProfile';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/** Edit profile — full name (email is identity, managed by platform admins). */
export function ProfileInfoForm() {
  const { user, updateProfile, isUpdatingProfile } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? '' },
  });

  // Sync when the profile query refreshes the store (e.g. after login)
  useEffect(() => {
    if (user?.fullName) reset({ fullName: user.fullName });
  }, [user?.fullName, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({ fullName: data.fullName.trim() });
      reset({ fullName: data.fullName.trim() });
    } catch {
      // Error toast handled by the mutation
    }
  };

  return (
    <ProfileSectionCard
      icon={UserCircle2}
      title="Profile information"
      subtitle="How your name appears across the admin panel"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Full name"
          placeholder="Your full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Email address"
          value={user?.email ?? ''}
          readOnly
          startIcon={<Mail size={16} />}
          hint="Your sign-in email — managed by a platform administrator"
        />
        <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-white/5">
          <Button
            type="submit"
            size="sm"
            isLoading={isUpdatingProfile}
            disabled={!isDirty || isUpdatingProfile}
            startIcon={<Save size={16} />}
            className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Save changes
          </Button>
        </div>
      </form>
    </ProfileSectionCard>
  );
}
