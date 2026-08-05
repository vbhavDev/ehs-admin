'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import {
  Organization,
  ORGANIZATION_STATUSES,
  ORGANIZATION_STATUS_LABELS,
} from '@/types/organization.types';
import { useOrganizations } from '../hooks/useOrganizations';
import { useSubscriptionPlans } from '@/modules/subscription-plans/hooks/useSubscriptionPlans';
import { useCurrencies } from '@/modules/currencies/hooks/useCurrencies';

const orgSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  slug: z.string().min(2, 'Slug is required'),
  domain: z.string().optional(),
  contactPersonName: z.string().optional(),
  contactPersonEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPersonPhone: z.string().optional(),
  gstin: z.string().optional(),
  employeeCount: z.coerce.number().min(0).optional(),
  siteCount: z.coerce.number().min(0).optional(),
  seatLimit: z.coerce.number().min(0).optional(),
  billingEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  subscriptionPlanId: z.string().optional(),
  currencyCode: z.string().optional(),
  subscriptionStartDate: z.string().optional(),
  subscriptionEndDate: z.string().optional(),
  status: z.string().optional(),
  isActive: z.boolean(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

type OrgFormData = z.infer<typeof orgSchema>;

interface OrganizationFormProps {
  initialData?: Organization | null;
}

const generateSlug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const OrganizationForm: React.FC<OrganizationFormProps> = ({ initialData }) => {
  const router = useRouter();
  const isEdit = !!initialData;
  const { createOrganization, updateOrganization, isCreating, isUpdating } = useOrganizations();
  const { plans, isLoading: isLoadingPlans } = useSubscriptionPlans({ limit: 100, isActive: true });
  const { currencies, isLoading: isLoadingCurrencies } = useCurrencies({
    limit: 100,
    isActive: true,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrgFormData>({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    resolver: zodResolver(orgSchema) as any,
    defaultValues: initialData
      ? {
          companyName: initialData.companyName,
          slug: initialData.slug,
          domain: initialData.domain || '',
          contactPersonName: initialData.contactPersonName || '',
          contactPersonEmail: initialData.contactPersonEmail || '',
          contactPersonPhone: initialData.contactPersonPhone || '',
          gstin: initialData.gstin || '',
          employeeCount: initialData.employeeCount || 0,
          siteCount: initialData.siteCount || 0,
          seatLimit: initialData.seatLimit || 1,
          billingEmail: initialData.billingEmail || '',
          subscriptionPlanId:
            typeof initialData.subscriptionPlanId === 'object'
              ? initialData.subscriptionPlanId?.id || ''
              : initialData.subscriptionPlanId || '',
          currencyCode: initialData.currencyCode || 'INR',
          subscriptionStartDate: initialData.subscriptionStartDate
            ? initialData.subscriptionStartDate.split('T')[0]
            : '',
          subscriptionEndDate: initialData.subscriptionEndDate
            ? initialData.subscriptionEndDate.split('T')[0]
            : '',
          status: initialData.status,
          isActive: initialData.isActive,
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          country: initialData.address?.country || '',
          postalCode: initialData.address?.postalCode || '',
        }
      : {
          companyName: '',
          slug: '',
          domain: '',
          contactPersonName: '',
          contactPersonEmail: '',
          contactPersonPhone: '',
          gstin: '',
          employeeCount: 0,
          siteCount: 0,
          seatLimit: 1,
          billingEmail: '',
          subscriptionPlanId: '',
          currencyCode: 'INR',
          subscriptionStartDate: '',
          subscriptionEndDate: '',
          status: 'pending_setup',
          isActive: true,
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
        },
  });

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('companyName', name);
    if (!isEdit) {
      setValue('slug', generateSlug(name));
    }
  };

  const onSubmit = async (data: OrgFormData) => {
    try {
      const { street, city, state, country, postalCode, ...rest } = data;
      const payload: Record<string, unknown> = {
        ...rest,
        address: { street, city, state, country, postalCode },
      };
      if (!payload.subscriptionPlanId) delete payload.subscriptionPlanId;
      if (!payload.subscriptionStartDate) delete payload.subscriptionStartDate;
      if (!payload.subscriptionEndDate) delete payload.subscriptionEndDate;
      if (!payload.billingEmail) delete payload.billingEmail;
      if (!payload.contactPersonEmail) delete payload.contactPersonEmail;

      if (isEdit && initialData) {
        await updateOrganization({ id: initialData.id, data: payload });
      } else {
        await createOrganization(payload as never);
      }
      router.push('/organizations');
    } catch (error) {
      // Error handled by mutation hooks (toast)
    }
  };

  const planOptions = [
    { value: '', label: 'No Plan (Pending Setup)' },
    ...plans.map((p) => ({ value: p.id, label: `${p.name} (${p.tier})` })),
  ];

  const currencyOptions = currencies.map((c) => ({
    value: c.code,
    label: `${c.code} (${c.symbol})`,
  }));

  const statusOptions = ORGANIZATION_STATUSES.map((s) => ({
    value: s,
    label: ORGANIZATION_STATUS_LABELS[s] || s,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <button
        type="button"
        onClick={() => router.push('/organizations')}
        className="flex items-center gap-2 text-gray-500 hover:text-brand-500 mb-6 transition-colors font-medium group text-sm"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Back to Organizations
      </button>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden shadow-theme-sm"
      >
        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Company Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Acme Corp"
                  value={watch('companyName')}
                  onChange={handleCompanyNameChange}
                  error={!!errors.companyName}
                  hint={errors.companyName?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="e.g. acme-corp"
                  {...register('slug')}
                  error={!!errors.slug}
                  hint={errors.slug?.message}
                  disabled={isEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="e.g. acme.com"
                  {...register('domain')}
                  error={!!errors.domain}
                  hint={errors.domain?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN / Tax ID</Label>
                <Input
                  id="gstin"
                  placeholder="e.g. 27AABCA1234L1Z5"
                  {...register('gstin')}
                  error={!!errors.gstin}
                  hint={errors.gstin?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Employee Count</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  min={0}
                  {...register('employeeCount')}
                  error={!!errors.employeeCount}
                  hint={errors.employeeCount?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteCount">Site / Plant Count</Label>
                <Input
                  id="siteCount"
                  type="number"
                  min={0}
                  {...register('siteCount')}
                  error={!!errors.siteCount}
                  hint={errors.siteCount?.message}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Primary Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactPersonName">Contact Name</Label>
                <Input
                  id="contactPersonName"
                  placeholder="e.g. Jane Doe"
                  {...register('contactPersonName')}
                  error={!!errors.contactPersonName}
                  hint={errors.contactPersonName?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPersonEmail">Contact Email</Label>
                <Input
                  id="contactPersonEmail"
                  type="email"
                  placeholder="e.g. jane@acme.com"
                  {...register('contactPersonEmail')}
                  error={!!errors.contactPersonEmail}
                  hint={errors.contactPersonEmail?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPersonPhone">Contact Phone</Label>
                <Input
                  id="contactPersonPhone"
                  placeholder="e.g. +919876543210"
                  {...register('contactPersonPhone')}
                  error={!!errors.contactPersonPhone}
                  hint={errors.contactPersonPhone?.message}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Registered Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  placeholder="e.g. 123 Industrial Estate"
                  {...register('street')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="e.g. Mumbai" {...register('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="e.g. Maharashtra" {...register('state')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" placeholder="e.g. India" {...register('country')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" placeholder="e.g. 400001" {...register('postalCode')} />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Subscription & Billing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subscriptionPlanId">Subscription Plan</Label>
                <Select
                  options={planOptions}
                  value={watch('subscriptionPlanId')}
                  onChange={(value) => setValue('subscriptionPlanId', value as string)}
                  placeholder="Select Plan"
                  disabled={isLoadingPlans}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currencyCode">Billing Currency</Label>
                <Select
                  options={currencyOptions}
                  value={watch('currencyCode')}
                  onChange={(value) => setValue('currencyCode', value as string)}
                  placeholder="Select Currency"
                  disabled={isLoadingCurrencies}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscriptionStartDate">Subscription Start</Label>
                <Input
                  id="subscriptionStartDate"
                  type="date"
                  {...register('subscriptionStartDate')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscriptionEndDate">Subscription End</Label>
                <Input id="subscriptionEndDate" type="date" {...register('subscriptionEndDate')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seatLimit">Seat Limit</Label>
                <Input
                  id="seatLimit"
                  type="number"
                  min={0}
                  {...register('seatLimit')}
                  error={!!errors.seatLimit}
                  hint={errors.seatLimit?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingEmail">Billing Email</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  placeholder="e.g. billing@acme.com"
                  {...register('billingEmail')}
                  error={!!errors.billingEmail}
                  hint={errors.billingEmail?.message}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Status & Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    options={statusOptions}
                    value={watch('status')}
                    onChange={(value) => setValue('status', value as string)}
                    placeholder="Select Status"
                  />
                </div>
              )}

              <div className="flex items-end pb-2">
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
                    Organization is Active
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50/50 dark:bg-navy-900/50 border-t border-gray-100 dark:border-navy-700 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/organizations')}
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
                ? 'Update Organization'
                : 'Create Organization'}
          </Button>
        </div>
      </form>
    </div>
  );
};
