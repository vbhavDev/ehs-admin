'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  X,
  Trash2,
  BadgeCheck,
  Gauge,
  ListChecks,
  CreditCard,
  Settings2,
  ClipboardCheck,
  Users,
  Images,
  Video,
  Building2,
  HardDrive,
  Check,
  Info,
} from 'lucide-react';
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
  COMPLIANCE_STANDARDS,
  getTierVisual,
} from '@/types/subscription-plan.types';
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans';
import { useCurrencies } from '@/modules/currencies/hooks/useCurrencies';

const planSchema = z.object({
  name: z.string().min(2, 'Plan name is required'),
  tier: z.string().min(1, 'Please pick a tier'),
  maxInspectionsPerMonth: z.coerce.number(),
  maxImagesPerInspection: z.coerce.number().min(0),
  maxVideoUploads: z.coerce.number().min(0),
  maxUsers: z.coerce.number().min(0),
  maxPlants: z.coerce.number(),
  maxStorageGB: z.coerce.number(),
  defaultCurrency: z.string().min(1, 'Default currency is required'),
  isActive: z.boolean(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface SubscriptionPlanFormProps {
  initialData?: SubscriptionPlan | null;
}

const DURATION_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'halfyearly', label: 'Half-Yearly' },
  { value: 'annual', label: 'Annual' },
  { value: 'custom', label: 'Custom' },
];

/** Section wrapper for consistent, scannable form groups. */
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

export const SubscriptionPlanForm: React.FC<SubscriptionPlanFormProps> = ({ initialData }) => {
  const router = useRouter();
  const isEdit = !!initialData;
  const { createPlan, updatePlan, isCreating, isUpdating } = useSubscriptionPlans();
  const { currencies, isLoading: isLoadingCurrencies } = useCurrencies({ limit: 100 });
  const isSaving = isCreating || isUpdating;

  const [features, setFeatures] = useState<string[]>(initialData?.features || []);
  const [pricing, setPricing] = useState<PlanPricing[]>(() => {
    const rawPricing = initialData?.pricing || [];
    return rawPricing.map((p) => ({
      currencyCode: p.currencyCode || 'INR',
      cycles: p.cycles || [],
    }));
  });

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
          maxPlants: initialData.maxPlants ?? 1,
          maxStorageGB: initialData.maxStorageGB ?? 10,
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
          maxPlants: 1,
          maxStorageGB: 10,
          defaultCurrency: 'INR',
          isActive: true,
        },
  });

  const selectedTier = watch('tier');
  const isActive = watch('isActive');
  const isFreeTier = selectedTier === 'free';

  /** Toggle a compliance standard in/out of the features list (stored as feature tags). */
  const toggleStandard = (standard: string) => {
    setFeatures((prev) =>
      prev.includes(standard) ? prev.filter((f) => f !== standard) : [...prev, standard],
    );
  };

  const addPricingRow = () => {
    if (isFreeTier) return; // Free plans have no pricing
    setPricing((p) => [
      ...p,
      {
        currencyCode: 'INR',
        cycles: [
          { duration: 'monthly', days: 30, status: true, price: 0 },
          { duration: 'quarterly', days: 90, status: true, price: 0 },
          { duration: 'halfyearly', days: 180, status: true, price: 0 },
          { duration: 'annual', days: 365, status: true, price: 0 },
        ],
      },
    ]);
  };

  const removePricingRow = (index: number) => {
    setPricing((p) => p.filter((_, i) => i !== index));
  };

  const updatePricingRow = (
    index: number,
    field: keyof PlanPricing,
    value: PlanPricing[keyof PlanPricing],
  ) => {
    setPricing((p) =>
      p.map((row, i) => (i === index ? ({ ...row, [field]: value } as PlanPricing) : row)),
    );
  };

  const addCycleToRow = (rowIndex: number) => {
    setPricing((p) =>
      p.map((row, i) => {
        if (i !== rowIndex) return row;
        const cycles = [...(row.cycles || [])];
        cycles.push({ duration: 'custom', days: 30, status: true, price: 0 });
        return { ...row, cycles };
      }),
    );
  };

  const removeCycleFromRow = (rowIndex: number, cycleIndex: number) => {
    setPricing((p) =>
      p.map((row, i) => {
        if (i !== rowIndex) return row;
        const cycles = (row.cycles || []).filter((_, cIdx) => cIdx !== cycleIndex);
        return { ...row, cycles };
      }),
    );
  };

  const updateCycleInRow = (
    rowIndex: number,
    cycleIndex: number,
    field: keyof import('@/types/subscription-plan.types').CyclePricing,
    value: import('@/types/subscription-plan.types').CyclePricing[keyof import('@/types/subscription-plan.types').CyclePricing],
  ) => {
    setPricing((p) =>
      p.map((row, i) => {
        if (i !== rowIndex) return row;
        const cycles = (row.cycles || []).map((cycle, cIdx) => {
          if (cIdx !== cycleIndex) return cycle;
          return { ...cycle, [field]: value };
        });
        return { ...row, cycles };
      }),
    );
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      const payload = {
        ...data,
        features,
        // Free plans have no MRP — pricing is always empty for the free tier.
        pricing: isFreeTier
          ? []
          : pricing
              .filter((p) => p.currencyCode)
              .map((p) => ({ ...p, currencyCode: p.currencyCode.toUpperCase() })),
      };
      if (isEdit && initialData) {
        await updatePlan({ id: initialData.id, data: payload });
      } else {
        await createPlan(payload);
      }
      router.push('/subscription-plans');
    } catch {
      // Error handled by mutation hooks (toast)
    }
  };

  const currencyOptions = currencies.map((c) => ({
    value: c.code,
    label: `${c.code} - ${c.name} (${c.symbol})`,
  }));

  const limitFields = [
    {
      name: 'maxInspectionsPerMonth' as const,
      label: 'Inspections / month',
      hint: 'Set -1 for unlimited',
      Icon: ClipboardCheck,
    },
    {
      name: 'maxUsers' as const,
      label: 'Users (seats)',
      hint: 'Set -1 for unlimited',
      Icon: Users,
    },
    {
      name: 'maxImagesPerInspection' as const,
      label: 'Images / inspection',
      hint: '',
      Icon: Images,
    },
    { name: 'maxVideoUploads' as const, label: 'Video uploads', hint: '', Icon: Video },
    {
      name: 'maxPlants' as const,
      label: 'Plants / branches',
      hint: 'Set -1 for unlimited',
      Icon: Building2,
    },
    {
      name: 'maxStorageGB' as const,
      label: 'Storage (GB)',
      hint: 'Stores reports, videos & images. Set -1 for unlimited',
      Icon: HardDrive,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl pb-28">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 -mx-4 mb-8 border-b border-gray-100 bg-gray-50/80 px-4 py-4 backdrop-blur-md dark:border-navy-700 dark:bg-navy-950/80 sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/subscription-plans')}
            className="group flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-brand-500"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              {isEdit ? `Edit · ${initialData?.name}` : 'Create Subscription Plan'}
            </h1>
            <p className="hidden text-xs text-gray-400 sm:block">
              {isEdit
                ? 'Update plan limits, features and pricing'
                : 'Define a new plan tier with limits, features and pricing'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/subscription-plans')}
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
              {isEdit ? 'Save changes' : 'Create plan'}
            </Button>
          </div>
        </div>
      </div>

      <form id="subscription-plan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Identity */}
        <Section
          icon={<BadgeCheck size={20} />}
          title="Plan Identity"
          description="Name, tier and availability. The tier drives the accent colour used across the admin."
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Plan Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Pro, Starter, Enterprise"
                  {...register('name')}
                  error={!!errors.name}
                  hint={errors.name?.message}
                />
              </div>
              <div className="flex items-end">
                <label
                  htmlFor="isActive"
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                    isActive
                      ? 'border-success-200 bg-success-50/60 dark:border-success-500/30 dark:bg-success-500/10'
                      : 'border-gray-200 bg-gray-50/60 dark:border-navy-700 dark:bg-navy-900/40'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`h-2 w-2 rounded-full ${isActive ? 'bg-success-500' : 'bg-gray-400'}`}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isActive ? 'Plan is active' : 'Plan is inactive'}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="h-5 w-5 cursor-pointer rounded border-gray-300 accent-success-500 focus:ring-success-500 dark:border-gray-700 dark:bg-gray-800"
                  />
                </label>
              </div>
            </div>

            {/* Visual tier picker */}
            <div className="space-y-2">
              <Label>
                Tier <span className="text-error-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SUBSCRIPTION_PLAN_TIERS.map((t) => {
                  const visual = getTierVisual(t);
                  const selected = selectedTier === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setValue('tier', t, { shouldValidate: true })}
                      className={`group flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left transition ${
                        selected
                          ? `border-transparent ring-2 ${visual.ring} bg-gray-50 dark:bg-navy-900/50`
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-navy-700 dark:bg-navy-800/50 dark:hover:border-navy-600'
                      }`}
                    >
                      <span className={`h-3 w-3 shrink-0 rounded-full ${visual.solid}`} />
                      <span className="flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                        {SUBSCRIPTION_PLAN_TIER_LABELS[t] || t}
                      </span>
                      {selected && <Check size={15} className="shrink-0 text-success-500" />}
                    </button>
                  );
                })}
              </div>
              {errors.tier && <p className="mt-1 text-xs text-error-500">{errors.tier.message}</p>}
            </div>
          </div>
        </Section>

        {/* Usage limits */}
        <Section
          icon={<Gauge size={20} />}
          title="Usage Limits"
          description="How much each subscriber can use. Use -1 to make a limit unlimited."
          tone="bg-success-50 text-success-500 dark:bg-success-500/10"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {limitFields.map(({ name, label, hint, Icon }) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={name} className="flex items-center gap-2">
                  <Icon size={15} className="text-gray-400" />
                  {label}
                </Label>
                <Input
                  id={name}
                  type="number"
                  {...register(name)}
                  error={!!errors[name]}
                  hint={errors[name]?.message || hint}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Features */}
        <Section
          icon={<ListChecks size={20} />}
          title="Features"
          description="Marketing bullets shown to customers on the pricing page."
          tone="bg-purple-50 text-purple-500 dark:bg-purple-500/10"
        >
          <div className="space-y-4">
            {/* Compliance standards — quick-toggle multi-select chips */}
            <div className="space-y-2">
              <Label className="mb-1">Compliance standards</Label>
              <div className="flex flex-wrap gap-2">
                {COMPLIANCE_STANDARDS.map((standard) => {
                  const selected = features.includes(standard);
                  return (
                    <button
                      key={standard}
                      type="button"
                      onClick={() => toggleStandard(standard)}
                      aria-pressed={selected}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                        selected
                          ? 'border-transparent bg-purple-500 text-white shadow-theme-xs hover:bg-purple-600'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-purple-400 hover:text-purple-600 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:border-purple-500 dark:hover:text-purple-400'
                      }`}
                    >
                      {selected && <Check size={14} />}
                      {standard}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400">
                Tap to add or remove a regulatory framework. Selected standards appear as feature
                tags below.
              </p>
            </div>

            {/* Free-form features */}
            <TagInput
              placeholder="Type a feature and press Enter (e.g. AI Hazard Detection)"
              value={features}
              onChange={setFeatures}
            />
          </div>
        </Section>

        {/* Pricing */}
        <Section
          icon={<CreditCard size={20} />}
          title="Pricing"
          description="Set prices per currency and billing cycle. Add a row per currency."
          tone="bg-warning-50 text-warning-500 dark:bg-warning-500/10"
        >
          {isFreeTier && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
              <Info size={18} className="mt-0.5 shrink-0 text-brand-500" />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Free plan — no pricing
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  The Free tier has no MRP, so pricing is disabled. Any existing prices will be
                  removed when you save.
                </p>
              </div>
            </div>
          )}
          <div
            className={`space-y-5 ${isFreeTier ? 'pointer-events-none select-none opacity-50' : ''}`}
            aria-disabled={isFreeTier}
          >
            {pricing.length === 0 ? (
              <button
                type="button"
                onClick={addPricingRow}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-6 py-10 text-center transition hover:border-brand-400 hover:bg-brand-50/40 dark:border-navy-700 dark:hover:border-brand-500 dark:hover:bg-brand-500/5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                  <Plus size={20} />
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Add your first price
                </span>
                <span className="text-xs text-gray-400">
                  Choose a currency, then set a price per billing cycle.
                </span>
              </button>
            ) : (
              <>
                {pricing.map((row, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-navy-700 dark:bg-navy-800"
                  >
                    {/* Currency row header */}
                    <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-3 dark:border-navy-700 dark:bg-navy-900/40">
                      <div className="w-56 max-w-full">
                        <Select
                          options={currencyOptions}
                          value={row.currencyCode}
                          onChange={(value) => updatePricingRow(index, 'currencyCode', value)}
                          placeholder="Currency"
                          disabled={isLoadingCurrencies}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePricingRow(index)}
                        title="Remove currency"
                        aria-label="Remove currency row"
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-error-50 hover:text-error-500 dark:hover:bg-error-500/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Cycles */}
                    <div className="space-y-3 p-4">
                      {(row.cycles || []).length === 0 ? (
                        <p className="py-1 text-xs italic text-gray-400">
                          No billing cycles yet — add one below.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {(row.cycles || []).map((cycle, cycleIdx) => (
                            <div
                              key={cycleIdx}
                              className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-navy-700 dark:bg-navy-900/40"
                            >
                              <div className="min-w-[130px] flex-1 space-y-1">
                                <Label className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">
                                  Duration
                                </Label>
                                <Select
                                  options={DURATION_OPTIONS}
                                  value={cycle.duration}
                                  onChange={(value) =>
                                    updateCycleInRow(index, cycleIdx, 'duration', value)
                                  }
                                  placeholder="Duration"
                                  className="h-9 text-xs"
                                />
                              </div>
                              <div className="w-20 space-y-1">
                                <Label className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">
                                  Days
                                </Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={cycle.days}
                                  onChange={(e) =>
                                    updateCycleInRow(
                                      index,
                                      cycleIdx,
                                      'days',
                                      Number(e.target.value),
                                    )
                                  }
                                  className="h-9 text-xs"
                                />
                              </div>
                              <div className="w-28 space-y-1">
                                <Label className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">
                                  Price ({row.currencyCode})
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={cycle.price}
                                  onChange={(e) =>
                                    updateCycleInRow(
                                      index,
                                      cycleIdx,
                                      'price',
                                      Number(e.target.value),
                                    )
                                  }
                                  className="h-9 text-xs"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <label
                                  htmlFor={`cycle-status-${index}-${cycleIdx}`}
                                  className="flex cursor-pointer items-center gap-2"
                                >
                                  <input
                                    type="checkbox"
                                    id={`cycle-status-${index}-${cycleIdx}`}
                                    checked={cycle.status}
                                    onChange={(e) =>
                                      updateCycleInRow(index, cycleIdx, 'status', e.target.checked)
                                    }
                                    className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                                  />
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                    Active
                                  </span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeCycleFromRow(index, cycleIdx)}
                                  aria-label="Remove cycle"
                                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-error-50 hover:text-error-500 dark:hover:bg-error-500/10"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCycleToRow(index)}
                        className="mt-1 flex items-center gap-1 text-xs"
                      >
                        <Plus size={13} /> Add cycle
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPricingRow}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} /> Add another currency
                </Button>
              </>
            )}
          </div>
        </Section>

        {/* Settings */}
        <Section
          icon={<Settings2 size={20} />}
          title="Settings"
          description="Default currency used when a subscriber has no regional pricing."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
          </div>
        </Section>

        {/* Bottom actions (for long forms) */}
        <div className="flex justify-end gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-theme-xs dark:border-navy-700 dark:bg-navy-800">
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
            isLoading={isSaving}
            disabled={isSaving}
            className="px-8 shadow-theme-sm"
          >
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create plan'}
          </Button>
        </div>
      </form>
    </div>
  );
};
