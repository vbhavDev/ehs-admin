'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, KeyRound, ShieldAlert } from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { ProfileSectionCard } from './ProfileSectionCard';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { useProfile } from '../hooks/useProfile';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'New password must differ from the current one',
    path: ['newPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/** Change password — current password is verified server-side. */
export function ChangePasswordForm() {
  const { changePassword, isChangingPassword } = useProfile();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watch('newPassword') ?? '';

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
    } catch {
      // Error toast handled by the mutation
    }
  };

  const renderToggle = (visible: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      tabIndex={-1}
      aria-label={visible ? 'Hide password' : 'Show password'}
      className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
    >
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <ProfileSectionCard
      icon={KeyRound}
      title="Change password"
      subtitle="Keep your account secure with a strong password"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Current password"
          type={showCurrent ? 'text' : 'password'}
          placeholder="Enter current password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          endIcon={renderToggle(showCurrent, () => setShowCurrent((v) => !v))}
          {...register('currentPassword')}
        />
        <div className="space-y-2">
          <Input
            label="New password"
            type={showNew ? 'text' : 'password'}
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            endIcon={renderToggle(showNew, () => setShowNew((v) => !v))}
            {...register('newPassword')}
          />
          <PasswordStrengthMeter password={newPassword} />
        </div>
        <Input
          label="Confirm new password"
          type={showNew ? 'text' : 'password'}
          placeholder="Repeat new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <p className="flex items-start gap-2 rounded-lg bg-warning-500/5 px-3 py-2.5 text-xs text-warning-600 dark:text-warning-400">
          <ShieldAlert size={14} className="mt-0.5 shrink-0" />
          Changing your password signs out your other sessions when their tokens expire.
        </p>
        <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-white/5">
          <Button
            type="submit"
            size="sm"
            isLoading={isChangingPassword}
            startIcon={<KeyRound size={16} />}
            className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Update password
          </Button>
        </div>
      </form>
    </ProfileSectionCard>
  );
}
