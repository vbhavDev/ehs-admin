'use client';
import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { SubscriptionPlan, SUBSCRIPTION_PLAN_TIER_LABELS } from '@/types/subscription-plan.types';
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans';
import { Edit, Trash2 } from 'lucide-react';

interface SubscriptionPlanTableProps {
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
}

export const SubscriptionPlanTable: React.FC<SubscriptionPlanTableProps> = ({
  onEdit,
  onDelete,
}) => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { plans, meta, isLoading, updatePlan } = useSubscriptionPlans(params);

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    await updatePlan({ id: plan.id, data: { isActive: !plan.isActive } });
  };

  const formatLimit = (value: number) => (value === -1 ? 'Unlimited' : value.toString());

  const columns: Column<SubscriptionPlan>[] = [
    {
      header: 'Plan',
      accessor: (plan) => (
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{plan.name}</p>
          <p className="text-xs text-gray-500">{plan.tier}</p>
        </div>
      ),
    },
    {
      header: 'Tier',
      accessor: (plan) => (
        <span className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          {SUBSCRIPTION_PLAN_TIER_LABELS[plan.tier] || plan.tier}
        </span>
      ),
    },
    {
      header: 'Inspections / Mo',
      accessor: (plan) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {formatLimit(plan.maxInspectionsPerMonth)}
        </span>
      ),
    },
    {
      header: 'Max Users',
      accessor: (plan) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {formatLimit(plan.maxUsers)}
        </span>
      ),
    },
    {
      header: 'Features',
      accessor: (plan) => (
        <div className="flex flex-wrap gap-1">
          {plan.features && plan.features.length > 0 ? (
            plan.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-navy-700 dark:text-gray-300"
              >
                {f}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
          {plan.features && plan.features.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-navy-700 dark:text-gray-400">
              +{plan.features.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Pricing',
      accessor: (plan) => (
        <div className="flex flex-wrap gap-1.5">
          {plan.pricing && plan.pricing.length > 0 ? (
            plan.pricing.map((p) => (
              <span
                key={p.currencyCode}
                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-navy-700 dark:text-gray-300"
              >
                {p.currencyCode} {p.priceMonthly}/mo
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">No pricing set</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (plan) => (
        <button
          onClick={() => handleToggleActive(plan)}
          className={`group relative overflow-hidden flex items-center justify-center px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors duration-300 ${
            plan.isActive
              ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/15 dark:hover:text-error-500'
              : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500 hover:bg-success-50 hover:text-success-600 dark:hover:bg-success-500/15 dark:hover:text-success-500'
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
            {plan.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0 whitespace-nowrap">
            {plan.isActive ? 'Click to deactivate' : 'Click to activate'}
          </span>
          <span className="invisible whitespace-nowrap">
            {plan.isActive ? 'Click to deactivate' : 'Click to activate'}
          </span>
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: (plan) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(plan)}
            className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(plan)}
            className="p-1.5 text-gray-500 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={plans}
      columns={columns}
      isLoading={isLoading}
      serverSide
      totalItems={meta?.total}
      page={params.page}
      limit={params.limit}
      search={params.search}
      onPageChange={(page) => setParams((p) => ({ ...p, page }))}
      onPageSizeChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
      onSearchChange={(search) => setParams((p) => ({ ...p, search, page: 1 }))}
    />
  );
};
