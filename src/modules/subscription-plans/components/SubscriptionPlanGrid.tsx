'use client';
import React, { useMemo, useState } from 'react';
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Users,
  ClipboardCheck,
  Images,
  Video,
  Building2,
  HardDrive,
  Sparkles,
  Check,
  Inbox,
  FileText,
} from 'lucide-react';
import {
  SubscriptionPlan,
  SUBSCRIPTION_PLAN_TIER_LABELS,
  getTierVisual,
  formatPlanLimit,
  getHeadlineCycle,
  CYCLE_DURATION_SUFFIX,
} from '@/types/subscription-plan.types';
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans';

interface SubscriptionPlanGridProps {
  onView: (plan: SubscriptionPlan) => void;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
  onCreate: () => void;
}

const LIMIT_ICONS = [
  { key: 'maxInspectionsPerMonth', label: 'Inspections / mo', Icon: ClipboardCheck, suffix: '' },
  { key: 'maxUsers', label: 'Users', Icon: Users, suffix: '' },
  { key: 'maxImagesPerInspection', label: 'Images / inspection', Icon: Images, suffix: '' },
  { key: 'maxVideoUploads', label: 'Video / inspection', Icon: Video, suffix: '' },
  { key: 'maxPlants', label: 'Plants / branches', Icon: Building2, suffix: '' },
  { key: 'maxStorageGB', label: 'Storage (GB)', Icon: HardDrive, suffix: '' },
  { key: 'maxImageSizeMB', label: 'Max Image Size', Icon: Images, suffix: ' MB' },
  { key: 'maxVideoSizeMB', label: 'Max Video Size', Icon: Video, suffix: ' MB' },
  { key: 'maxDocumentSizeMB', label: 'Max Doc Size', Icon: FileText, suffix: ' MB' },
] as const;

function PlanCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-navy-700 dark:bg-navy-800">
      <div className="h-1.5 w-16 rounded-full bg-gray-200 dark:bg-navy-700" />
      <div className="mt-4 h-6 w-2/3 rounded bg-gray-200 dark:bg-navy-700" />
      <div className="mt-2 h-4 w-1/3 rounded bg-gray-100 dark:bg-navy-700" />
      <div className="mt-6 h-9 w-1/2 rounded bg-gray-200 dark:bg-navy-700" />
      <div className="mt-6 space-y-2">
        <div className="h-3 w-full rounded bg-gray-100 dark:bg-navy-700" />
        <div className="h-3 w-5/6 rounded bg-gray-100 dark:bg-navy-700" />
        <div className="h-3 w-4/6 rounded bg-gray-100 dark:bg-navy-700" />
      </div>
    </div>
  );
}

export const SubscriptionPlanGrid: React.FC<SubscriptionPlanGridProps> = ({
  onView,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const [params, setParams] = useState({ page: 1, limit: 12, search: '' });
  const { plans, meta, isLoading, updatePlan } = useSubscriptionPlans(params);

  const totalPages = useMemo(() => {
    if (!meta?.total) return 1;
    return Math.max(1, Math.ceil(meta.total / params.limit));
  }, [meta?.total, params.limit]);

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    await updatePlan({ id: plan.id, data: { isActive: !plan.isActive } });
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={params.search}
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
            placeholder="Search plans…"
            className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-200"
          />
        </div>
        {meta?.total !== undefined && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-800 dark:text-gray-100">{meta.total}</span>{' '}
            plan{meta.total === 1 ? '' : 's'}
          </p>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-navy-700 dark:bg-navy-800">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
            <Inbox size={26} />
          </span>
          <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
            {params.search ? 'No plans match your search' : 'No subscription plans yet'}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            {params.search
              ? `Nothing found for “${params.search}”. Try a different name or tier.`
              : 'Create your first plan to start gating features, limits and pricing.'}
          </p>
          {!params.search && (
            <button
              onClick={onCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              <Sparkles size={16} /> Create your first plan
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const visual = getTierVisual(plan.tier);
            const headline = getHeadlineCycle(plan);
            const features = plan.features || [];
            return (
              <article
                key={plan.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-theme-lg dark:border-navy-700 dark:bg-navy-800"
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${visual.gradient}`}>
                  <div className={`h-full w-16 ${visual.solid}`} />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <span
                        className={`mt-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${visual.chip}`}
                      >
                        {SUBSCRIPTION_PLAN_TIER_LABELS[plan.tier] || plan.tier}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleActive(plan)}
                      title={plan.isActive ? 'Click to deactivate' : 'Click to activate'}
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        plan.isActive
                          ? 'bg-success-50 text-success-600 hover:bg-error-50 hover:text-error-600 dark:bg-success-500/15 dark:text-success-500 dark:hover:bg-error-500/15 dark:hover:text-error-500'
                          : 'bg-gray-100 text-gray-500 hover:bg-success-50 hover:text-success-600 dark:bg-navy-700 dark:text-gray-400 dark:hover:bg-success-500/15 dark:hover:text-success-500'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="mt-4 flex items-end gap-1.5">
                    {headline ? (
                      <>
                        <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                          {headline.cycle.price === 0
                            ? 'Free'
                            : `${headline.currencyCode} ${headline.cycle.price.toLocaleString()}`}
                        </span>
                        {headline.cycle.price > 0 && (
                          <span className="pb-1 text-sm font-medium text-gray-400">
                            {CYCLE_DURATION_SUFFIX[headline.cycle.duration] ||
                              `/${headline.cycle.duration}`}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-lg font-semibold text-gray-400">No pricing set</span>
                    )}
                  </div>

                  <ul className="mt-5 space-y-2.5 border-t border-gray-100 pt-4 dark:border-navy-700">
                    {LIMIT_ICONS.map(({ key, label, Icon, suffix }) => {
                      const val = plan[key as keyof SubscriptionPlan] as number;
                      const formatted = formatPlanLimit(val);
                      return (
                        <li
                          key={key}
                          className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon size={16} className="text-gray-400" />
                            {label}
                          </span>
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {formatted}
                            {val !== -1 && suffix ? suffix : ''}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {features.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {features.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-navy-700 dark:text-gray-300"
                        >
                          <Check size={12} className="text-success-500" />
                          {f}
                        </span>
                      ))}
                      {features.length > 3 && (
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 dark:bg-navy-700 dark:text-gray-400">
                          +{features.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-2 border-t border-gray-100 pt-4 dark:border-navy-700">
                    <button
                      onClick={() => onView(plan)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-200 dark:hover:bg-navy-600"
                    >
                      <Eye size={15} /> View
                    </button>
                    <button
                      onClick={() => onEdit(plan)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                    >
                      <Pencil size={15} /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(plan)}
                      title="Delete plan"
                      aria-label={`Delete ${plan.name}`}
                      className="flex items-center justify-center rounded-lg bg-error-50 px-3 py-2 text-error-600 transition hover:bg-error-100 dark:bg-error-500/10 dark:text-error-500 dark:hover:bg-error-500/20"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!isLoading && plans.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-100">{params.page}</span> of{' '}
            {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={params.page <= 1}
              onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-navy-700 dark:text-gray-300 dark:hover:bg-navy-800"
            >
              Previous
            </button>
            <button
              disabled={params.page >= totalPages}
              onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-navy-700 dark:text-gray-300 dark:hover:bg-navy-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
