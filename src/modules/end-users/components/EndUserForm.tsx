'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
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

export const EndUserForm: React.FC<EndUserFormProps> = ({ initialData }) => {
  const router = useRouter();
  const isEdit = !!initialData;
  const [showPassword, setShowPassword] = useState(false);
  const { createEndUser, updateEndUser, isCreating, isUpdating } = useEndUsers();

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
    } catch (error) {
      // Error handled by mutation hooks (toast)
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => router.push('/end-users')}
        className="flex items-center gap-2 text-gray-500 hover:text-brand-500 mb-6 transition-colors font-medium group text-sm"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Back to End Users
      </button>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden shadow-theme-sm"
      >
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              User Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  hint={errors.email?.message}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="password">
                  {isEdit ? 'New Password (Optional)' : 'Password'}{' '}
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
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-hidden"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Account & Compliance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isIndividualSubscriber"
                  {...register('isIndividualSubscriber')}
                  className="w-5 h-5 rounded border-gray-300 accent-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                />
                <Label
                  htmlFor="isIndividualSubscriber"
                  className="mb-0 cursor-pointer font-medium text-gray-700 dark:text-gray-300"
                >
                  Individual Subscriber
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isEmailVerified"
                  {...register('isEmailVerified')}
                  className="w-5 h-5 rounded border-gray-300 accent-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                />
                <Label
                  htmlFor="isEmailVerified"
                  className="mb-0 cursor-pointer font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Verified
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isTermsAccepted"
                  {...register('isTermsAccepted')}
                  className="w-5 h-5 rounded border-gray-300 accent-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                />
                <Label
                  htmlFor="isTermsAccepted"
                  className="mb-0 cursor-pointer font-medium text-gray-700 dark:text-gray-300"
                >
                  Terms Accepted
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPrivacyPolicyAccepted"
                  {...register('isPrivacyPolicyAccepted')}
                  className="w-5 h-5 rounded border-gray-300 accent-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                />
                <Label
                  htmlFor="isPrivacyPolicyAccepted"
                  className="mb-0 cursor-pointer font-medium text-gray-700 dark:text-gray-300"
                >
                  Privacy Policy Accepted
                </Label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Status</h3>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="w-5 h-5 rounded border-gray-300 accent-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
              />
              <Label
                htmlFor="isActive"
                className="mb-0 cursor-pointer font-medium text-gray-700 dark:text-gray-300"
              >
                User is Active
              </Label>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50/50 dark:bg-navy-900/50 border-t border-gray-100 dark:border-navy-700 flex justify-end gap-3">
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
            disabled={isCreating || isUpdating}
            className="px-8 shadow-lg shadow-brand-500/20"
          >
            {isCreating || isUpdating
              ? 'Saving...'
              : isEdit
                ? 'Update End User'
                : 'Create End User'}
          </Button>
        </div>
      </form>
    </div>
  );
};
