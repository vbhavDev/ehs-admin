'use client';
import React from 'react';
import {
  ArrowLeft,
  Pencil,
  Users,
  ClipboardCheck,
  Images,
  Video,
  Building2,
  HardDrive,
  Check,
  CreditCard,
  ListChecks,
  Gauge,
  CalendarClock,
  FileText,
} from 'lucide-react';
import {
  SubscriptionPlan,
  SUBSCRIPTION_PLAN_TIER_LABELS,
  getTierVisual,
  formatPlanLimit,
  CYCLE_DURATION_LABELS,
  getHeadlineCycle,
  CYCLE_DURATION_SUFFIX,
} from '@/types/subscription-plan.types';

interface SubscriptionPlanDetailProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onBack: () => void;
}

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

export const SubscriptionPlanDetail: React.FC<SubscriptionPlanDetailProps> = ({
  plan,
  onEdit,
  onBack,
}) => {
  const visual = getTierVisual(plan.tier);
  const headline = getHeadlineCycle(plan);
  const features = plan.features || [];
  const pricing = plan.pricing || [];

  const limits = [
    {
      label: 'Inspections / month',
      value: formatPlanLimit(plan.maxInspectionsPerMonth),
      Icon: ClipboardCheck,
    },
    { label: 'Users (seats)', value: formatPlanLimit(plan.maxUsers), Icon: Users },
    {
      label: 'Images / inspection',
      value: formatPlanLimit(plan.maxImagesPerInspection),
      Icon: Images,
    },
    { label: 'Video / inspection', value: formatPlanLimit(plan.maxVideoUploads), Icon: Video },
    { label: 'Plants / branches', value: formatPlanLimit(plan.maxPlants), Icon: Building2 },
    { label: 'Storage (GB)', value: formatPlanLimit(plan.maxStorageGB), Icon: HardDrive },
    {
      label: 'Max Image Size',
      value: plan.maxImageSizeMB === -1 ? 'Unlimited' : `${plan.maxImageSizeMB ?? 10} MB`,
      Icon: Images,
    },
    {
      label: 'Max Video Size',
      value: plan.maxVideoSizeMB === -1 ? 'Unlimited' : `${plan.maxVideoSizeMB ?? 50} MB`,
      Icon: Video,
    },
    {
      label: 'Max Doc Size',
      value: plan.maxDocumentSizeMB === -1 ? 'Unlimited' : `${plan.maxDocumentSizeMB ?? 20} MB`,
      Icon: FileText,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <button
        type="button"
        onClick={onBack}
        className="group mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-brand-500"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Back to Subscription Plans
      </button>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-navy-700 dark:bg-navy-800">
        <div className={`relative h-2 w-full bg-gradient-to-r ${visual.gradient}`}>
          <div className={`h-full w-24 ${visual.solid}`} />
        </div>
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {plan.name}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${visual.chip}`}
              >
                {SUBSCRIPTION_PLAN_TIER_LABELS[plan.tier] || plan.tier}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  plan.isActive
                    ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
                    : 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${plan.isActive ? 'bg-success-500' : 'bg-gray-400'}`}
                />
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Default currency{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {plan.defaultCurrency}
              </span>
              {' · '}Created {formatDate(plan.createdAt)}
              {' · '}Updated {formatDate(plan.updatedAt)}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            {headline && (
              <div className="text-left lg:text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">From</p>
                <p className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {headline.cycle.price === 0
                    ? 'Free'
                    : `${headline.currencyCode} ${headline.cycle.price.toLocaleString()}`}
                  {headline.cycle.price > 0 && (
                    <span className="ml-1 text-base font-medium text-gray-400">
                      {CYCLE_DURATION_SUFFIX[headline.cycle.duration] ||
                        `/${headline.cycle.duration}`}
                    </span>
                  )}
                </p>
              </div>
            )}
            <button
              onClick={() => onEdit(plan)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              <Pencil size={16} /> Edit Plan
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Usage limits */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-navy-700 dark:bg-navy-800">
          <header className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
              <Gauge size={18} />
            </span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Usage Limits</h2>
          </header>
          <ul className="divide-y divide-gray-100 dark:divide-navy-700">
            {limits.map(({ label, value, Icon }) => (
              <li key={label} className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                  <Icon size={16} className="text-gray-400" />
                  {label}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Features */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-navy-700 dark:bg-navy-800">
          <header className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-50 text-success-500 dark:bg-success-500/10">
              <ListChecks size={18} />
            </span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Features</h2>
            <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-navy-700 dark:text-gray-300">
              {features.length}
            </span>
          </header>
          {features.length === 0 ? (
            <p className="text-sm italic text-gray-400">No features listed for this plan.</p>
          ) : (
            <ul className="space-y-2.5">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-500 dark:bg-success-500/10">
                    <Check size={12} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pricing */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-navy-700 dark:bg-navy-800 lg:col-span-1">
          <header className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-50 text-warning-500 dark:bg-warning-500/10">
              <CreditCard size={18} />
            </span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Pricing</h2>
            <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-navy-700 dark:text-gray-300">
              {pricing.length} {pricing.length === 1 ? 'currency' : 'currencies'}
            </span>
          </header>
          {pricing.length === 0 ? (
            <p className="text-sm italic text-gray-400">No pricing configured.</p>
          ) : (
            <div className="space-y-4">
              {pricing.map((p) => {
                const activeCycles = (p.cycles || []).filter((c) => c.status);
                return (
                  <div
                    key={p.currencyCode}
                    className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-navy-700 dark:bg-navy-900/40"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-bold text-gray-700 ring-1 ring-gray-200 dark:bg-navy-800 dark:text-gray-200 dark:ring-navy-600">
                        {p.currencyCode}
                      </span>
                      <span className="text-xs text-gray-400">
                        {activeCycles.length} active cycle{activeCycles.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    {activeCycles.length === 0 ? (
                      <p className="text-xs italic text-gray-400">All cycles disabled.</p>
                    ) : (
                      <ul className="space-y-2">
                        {activeCycles.map((c, i) => (
                          <li
                            key={`${c.duration}-${i}`}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <CalendarClock size={14} className="text-gray-400" />
                              {CYCLE_DURATION_LABELS[c.duration] || c.duration}
                              <span className="text-xs text-gray-400">({c.days}d)</span>
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {c.price === 0
                                ? 'Free'
                                : `${p.currencyCode} ${c.price.toLocaleString()}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
