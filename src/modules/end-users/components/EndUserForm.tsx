'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  UserRound,
  ShieldCheck,
  ScrollText,
  BadgeCheck,
  CreditCard,
  Power,
} from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { EndUser } from '@/types/end-user.types';
import { useEndUsers } from '../hooks/useEndUsers';

const baseSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  isIndividualSubscriber: z.boolean(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  isTermsAccepted: z.boolean(),
  isPrivacyPolicyAccepted: z.boolean(),
});

type EndUserFormData = z.infer<typeof baseSchema> & { password?: string };

interface EndUserFormProps {
  initialData?: EndUser | null;
}

/** Section wrapper — consistent with the redesigned module pages. */
const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  tone?: string;
  children: React.ReactNode;
}> = ({
  icon,
  title,
  description,
  tone = 'bg-brand-50 text-brand-500 dark:bg-brand-500/10',
  children,
}) => (
  <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-theme-xs dark:border-navy-700 dark:bg-navy-800/50 sm:p-8">
    <header className="mb-6 flex items-start gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        {icon}
      </span>
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </header>
    {children}
  </section>
);

/** Switch-style toggle row with icon, label and helper text. */
const ToggleRow: React.FC<{
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}> = ({ id, icon, label, description, checked, onChange, disabled }) => (
  <label
    htmlFor={id}
    className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5 transition ${
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
    } ${
      checked
        ? 'border-brand-200 bg-brand-50/50 dark:border-brand-500/30 dark:bg-brand-500/5'
        : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 dark:border-navy-700 dark:bg-navy-900/40 dark:hover:border-navy-600'
    }`}
  >
    <span className="flex items-center gap-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          checked
            ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
            : 'bg-gray-100 text-gray-400 dark:bg-navy-700 dark:text-gray-500'
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
        <span className="mt-0.5 block text-xs text-gray-400">{description}</span>
      </span>
    </span>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 accent-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
    />
  </label>
);

export const EndUserForm: React.FC<EndUserFormProps> = ({ initialData }) => {
  const router = useRouter();
  const isEdit = !!initialData;
  const [showPassword, setShowPassword] = useState(false);
  const { createEndUser, updateEndUser, isCreating, isUpdating } = useEndUsers();
  const isSaving = isCreating || isUpdating;

  const endUserSchema = React.useMemo(
    () =>
      baseSchema.extend({
        password: isEdit
          ? z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal(''))
          : z.string().min(6, 'Password must be at least 6 characters'),
      }),
    [isEdit],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EndUserFormData>({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    resolver: zodResolver(endUserSchema) as any,
    defaultValues: initialData
      ? {
          email: initialData.email,
          fullName: initialData.fullName,
          isIndividualSubscriber: initialData.isIndividualSubscriber,
          isActive: initialData.isActive,
          isEmailVerified: initialData.isEmailVerified,
          isTermsAccepted: initialData.isTermsAccepted,
          isPrivacyPolicyAccepted: initialData.isPrivacyPolicyAccepted,
        }
      : {
          email: '',
          fullName: '',
          password: '',
          isIndividualSubscriber: false,
          isActive: true,
          isEmailVerified: false,
          isTermsAccepted: false,
          isPrivacyPolicyAccepted: false,
        },
  });

  const flags = watch([
    'isActive',
    'isEmailVerified',
    'isIndividualSubscriber',
    'isTermsAccepted',
    'isPrivacyPolicyAccepted',
  ]);
  const [
    isActive,
    isEmailVerified,
    isIndividualSubscriber,
    isTermsAccepted,
    isPrivacyPolicyAccepted,
  ] = flags;

  const onSubmit = async (data: EndUserFormData) => {
    try {
      if (isEdit && initialData) {
        const updateData = { ...data };
        if (!updateData.password) delete updateData.password;
        // @ts-expect-error - email is immutable after creation
        delete updateData.email;
        await updateEndUser({ id: initialData.id, data: updateData });
      } else {
        await createEndUser(data as never);
      }
      router.push('/end-users');
    } catch {
      // Error handled by mutation hooks (toast)
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-10">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 -mx-4 mb-8 border-b border-gray-100 bg-gray-50/80 px-4 py-4 backdrop-blur-md dark:border-navy-700 dark:bg-navy-950/80 sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/end-users')}
            className="group flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-brand-500"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              {isEdit ? `Edit · ${initialData?.fullName}` : 'Add End User'}
            </h1>
            <p className="hidden text-xs text-gray-400 sm:block">
              {isEdit
                ? 'Update account details and access flags'
                : 'Create a client-facing user account'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/end-users')}
              className="hidden sm:inline-flex"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              isLoading={isSaving}
              disabled={isSaving}
              className="shadow-theme-xs"
            >
              {isEdit ? 'Save changes' : 'Create user'}
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User information */}
        <Section
          icon={<UserRound size={20} />}
          title="User Information"
          description="Identity and sign-in credentials for this account."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-error-500">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="e.g. John Doe"
                {...register('fullName')}
                error={!!errors.fullName}
                hint={errors.fullName?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. user@acme.com"
                disabled={isEdit}
                {...register('email')}
                error={!!errors.email}
                hint={isEdit ? 'Email cannot be changed after creation' : errors.email?.message}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password">
                {isEdit ? 'New Password (optional)' : 'Password'}{' '}
                {!isEdit && <span className="text-error-500">*</span>}
              </Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isEdit ? 'Leave empty to keep current' : 'e.g. SecurePass123!'}
                {...register('password')}
                error={!!errors.password}
                hint={errors.password?.message}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>
          </div>
        </Section>

        {/* Access & flags */}
        <Section
          icon={<ShieldCheck size={20} />}
          title="Access & Flags"
          description="Control the account state and how this user is billed."
          tone="bg-success-50 text-success-500 dark:bg-success-500/10"
        >
          <div className="space-y-3">
            <ToggleRow
              id="isActive"
              icon={<Power size={16} />}
              label="Account active"
              description="Inactive users cannot sign in to the client app."
              checked={!!isActive}
              onChange={(v) => setValue('isActive', v)}
            />
            <ToggleRow
              id="isEmailVerified"
              icon={<BadgeCheck size={16} />}
              label="Email verified"
              description="Mark the email as verified without sending a verification mail."
              checked={!!isEmailVerified}
              onChange={(v) => setValue('isEmailVerified', v)}
            />
            <ToggleRow
              id="isIndividualSubscriber"
              icon={<CreditCard size={16} />}
              label="Individual subscriber"
              description="User subscribes personally instead of through an organization."
              checked={!!isIndividualSubscriber}
              onChange={(v) => setValue('isIndividualSubscriber', v)}
            />
          </div>
        </Section>

        {/* Compliance */}
        <Section
          icon={<ScrollText size={20} />}
          title="Compliance"
          description="Legal acceptances captured during signup — set manually only when required."
          tone="bg-purple-50 text-purple-500 dark:bg-purple-500/10"
        >
          <div className="space-y-3">
            <ToggleRow
              id="isTermsAccepted"
              icon={<ScrollText size={16} />}
              label="Terms of Service accepted"
              description="User has accepted the platform Terms of Service."
              checked={!!isTermsAccepted}
              onChange={(v) => setValue('isTermsAccepted', v)}
            />
            <ToggleRow
              id="isPrivacyPolicyAccepted"
              icon={<ScrollText size={16} />}
              label="Privacy Policy accepted"
              description="User has accepted the platform Privacy Policy."
              checked={!!isPrivacyPolicyAccepted}
              onChange={(v) => setValue('isPrivacyPolicyAccepted', v)}
            />
          </div>
        </Section>

        {/* Bottom actions */}
        <div className="flex justify-end gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-theme-xs dark:border-navy-700 dark:bg-navy-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/end-users')}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            disabled={isSaving}
            className="px-8 shadow-theme-sm"
          >
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </div>
      </form>
    </div>
  );
};
