'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import TagInput from '@/components/form/input/TagInput';
import Button from '@/components/ui/button/Button';
import {
  SubscriptionPlan,
  PlanPricing,
  SUBSCRIPTION_PLAN_TIERS,
  SUBSCRIPTION_PLAN_TIER_LABELS,
} from '@/types/subscription-plan.types';
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans';
import { useCurrencies } from '@/modules/currencies/hooks/useCurrencies';

const planSchema = z.object({
  name: z.string().min(2, 'Plan name is required'),
  tier: z.string().min(1, 'Tier is required'),
  maxInspectionsPerMonth: z.coerce.number(),
  maxImagesPerInspection: z.coerce.number().min(0),
  maxVideoUploads: z.coerce.number().min(0),
  maxUsers: z.coerce.number().min(0),
  defaultCurrency: z.string().min(1, 'Default currency is required'),
  isActive: z.boolean(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface SubscriptionPlanFormProps {
  initialData?: SubscriptionPlan | null;
}

export const SubscriptionPlanForm: React.FC<SubscriptionPlanFormProps> = ({ initialData }) => {
  const router = useRouter();
  const isEdit = !!initialData;
  const { createPlan, updatePlan, isCreating, isUpdating } = useSubscriptionPlans();
  const { currencies, isLoading: isLoadingCurrencies } = useCurrencies({ limit: 100 });

  const [features, setFeatures] = useState<string[]>(initialData?.features || []);
  const [pricing, setPricing] = useState<PlanPricing[]>(initialData?.pricing || []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanFormData>({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    resolver: zodResolver(planSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          tier: initialData.tier,
          maxInspectionsPerMonth: initialData.maxInspectionsPerMonth,
          maxImagesPerInspection: initialData.maxImagesPerInspection,
          maxVideoUploads: initialData.maxVideoUploads,
          maxUsers: initialData.maxUsers,
          defaultCurrency: initialData.defaultCurrency,
          isActive: initialData.isActive,
        }
      : {
          name: '',
          tier: '',
          maxInspectionsPerMonth: -1,
          maxImagesPerInspection: 10,
          maxVideoUploads: 10,
          maxUsers: 1,
          defaultCurrency: 'INR',
          isActive: true,
        },
  });

  const addPricingRow = () => {
    setPricing((p) => [...p, { currencyCode: 'INR', priceMonthly: 0, priceAnnual: 0 }]);
  };

  const removePricingRow = (index: number) => {
    setPricing((p) => p.filter((_, i) => i !== index));
  };

  const updatePricingRow = (index: number, field: keyof PlanPricing, value: string | number) => {
    setPricing((p) => p.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      const payload = {
        ...data,
        features,
        pricing: pricing
          .filter((p) => p.currencyCode)
          .map((p) => ({ ...p, currencyCode: p.currencyCode.toUpperCase() })),
      };
      if (isEdit && initialData) {
        await updatePlan({ id: initialData.id, data: payload });
      } else {
        await createPlan(payload);
      }
      router.push('/subscription-plans');
    } catch (error) {
      // Error handled by mutation hooks (toast)
    }
  };

  const tierOptions = SUBSCRIPTION_PLAN_TIERS.map((t) => ({
    value: t,
    label: SUBSCRIPTION_PLAN_TIER_LABELS[t] || t,
  }));

  const currencyOptions = currencies.map((c) => ({
    value: c.code,
    label: `${c.code} - ${c.name} (${c.symbol})`,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <button
        type="button"
        onClick={() => router.push('/subscription-plans')}
        className="flex items-center gap-2 text-gray-500 hover:text-brand-500 mb-6 transition-colors font-medium group text-sm"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Back to Subscription Plans
      </button>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden shadow-theme-sm"
      >
        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Plan Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Plan Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Enterprise Pro"
                  {...register('name')}
                  error={!!errors.name}
                  hint={errors.name?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier">
                  Tier <span className="text-error-500">*</span>
                </Label>
                <Select
                  options={tierOptions}
                  value={watch('tier')}
                  onChange={(value) => setValue('tier', value as string)}
                  placeholder="Select Tier"
                  disabled={isEdit}
                />
                {errors.tier && (
                  <p className="mt-1 text-xs text-error-500">{errors.tier.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Usage Limits
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Use -1 for unlimited (e.g. inspections per month)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxInspectionsPerMonth">Max Inspections / Month</Label>
                <Input
                  id="maxInspectionsPerMonth"
                  type="number"
                  {...register('maxInspectionsPerMonth')}
                  error={!!errors.maxInspectionsPerMonth}
                  hint={errors.maxInspectionsPerMonth?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxImagesPerInspection">Max Images / Inspection</Label>
                <Input
                  id="maxImagesPerInspection"
                  type="number"
                  min={0}
                  {...register('maxImagesPerInspection')}
                  error={!!errors.maxImagesPerInspection}
                  hint={errors.maxImagesPerInspection?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxVideoUploads">Max Video Uploads</Label>
                <Input
                  id="maxVideoUploads"
                  type="number"
                  min={0}
                  {...register('maxVideoUploads')}
                  error={!!errors.maxVideoUploads}
                  hint={errors.maxVideoUploads?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUsers">Max Users (Seats)</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min={0}
                  {...register('maxUsers')}
                  error={!!errors.maxUsers}
                  hint={errors.maxUsers?.message}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Features
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Press Enter or comma to add a feature gate (e.g. pdf_export, ai_copilot)
            </p>
            <TagInput
              id="features"
              placeholder="Add feature gates..."
              defaultValue={features}
              onChange={(tags) => setFeatures(tags)}
            />
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Multi-Currency Pricing
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Add price per currency (monthly / annual)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addPricingRow}
                className="flex items-center gap-2 text-sm px-4 py-2"
              >
                <Plus size={16} />
                Add Price
              </Button>
            </div>

            {pricing.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No pricing rows added yet.</p>
            ) : (
              <div className="space-y-4">
                {pricing.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end rounded-xl border border-gray-200 dark:border-navy-700 p-4"
                  >
                    <div className="sm:col-span-4 space-y-1.5">
                      <Label htmlFor={`pricing-currency-${index}`}>Currency</Label>
                      <Select
                        options={currencyOptions}
                        value={row.currencyCode}
                        onChange={(value) =>
                          updatePricingRow(index, 'currencyCode', value as string)
                        }
                        placeholder="Select Currency"
                        disabled={isLoadingCurrencies}
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1.5">
                      <Label htmlFor={`pricing-monthly-${index}`}>Monthly Price</Label>
                      <Input
                        id={`pricing-monthly-${index}`}
                        type="number"
                        min={0}
                        value={row.priceMonthly}
                        onChange={(e) =>
                          updatePricingRow(index, 'priceMonthly', Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1.5">
                      <Label htmlFor={`pricing-annual-${index}`}>Annual Price</Label>
                      <Input
                        id={`pricing-annual-${index}`}
                        type="number"
                        min={0}
                        value={row.priceAnnual}
                        onChange={(e) =>
                          updatePricingRow(index, 'priceAnnual', Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removePricingRow(index)}
                        className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">
                  Default Currency <span className="text-error-500">*</span>
                </Label>
                <Select
                  options={currencyOptions}
                  value={watch('defaultCurrency')}
                  onChange={(value) => setValue('defaultCurrency', value as string)}
                  placeholder="Select Currency"
                  disabled={isLoadingCurrencies}
                />
                {errors.defaultCurrency && (
                  <p className="mt-1 text-xs text-error-500">{errors.defaultCurrency.message}</p>
                )}
              </div>

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
                    Plan is Active
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
            onClick={() => router.push('/subscription-plans')}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-8 shadow-lg shadow-brand-500/20"
          >
            {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </div>
  );
};
