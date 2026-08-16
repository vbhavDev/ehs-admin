'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionPlanGrid } from '@/modules/subscription-plans/components/SubscriptionPlanGrid';
import { SubscriptionPlanReorder } from '@/modules/subscription-plans/components/SubscriptionPlanReorder';
import { ActiveSubscriptionsList } from '@/modules/subscription-plans/components/ActiveSubscriptionsList';
import { SubscriptionPlan } from '@/types/subscription-plan.types';
import { useSubscriptionPlans } from '@/modules/subscription-plans/hooks/useSubscriptionPlans';
import Button from '@/components/ui/button/Button';
import { Plus, ArrowUpDown, Layers, CreditCard } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useGlobalModal } from '@/hooks/useGlobalModal';

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const { deletePlan } = useSubscriptionPlans();
  const { confirm } = useGlobalModal();
  const [activeTab, setActiveTab] = useState<'plans' | 'active-subscriptions'>('plans');
  const [isReordering, setIsReordering] = useState(false);

  const handleCreate = () => {
    router.push('/subscription-plans/create');
  };

  const handleView = (plan: SubscriptionPlan) => {
    router.push(`/subscription-plans/view/${plan.id}`);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    router.push(`/subscription-plans/update/${plan.id}`);
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    confirm({
      title: 'Delete Subscription Plan',
      message: `Are you sure you want to delete the plan "${plan.name}"? Organizations using this plan may be affected. This action cannot be undone.`,
      confirmText: 'Delete Plan',
      type: 'danger',
      onConfirm: async () => {
        await deletePlan(plan.id);
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="Subscription Plans" />

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Subscription Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Define plan tiers, pricing, feature gates, and monitor active subscriptions.
          </p>
        </div>
        {activeTab === 'plans' && (
          <div className="flex items-center gap-2">
            {!isReordering && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReordering(true)}
                className="flex items-center gap-2"
              >
                <ArrowUpDown size={18} />
                Arrange order
              </Button>
            )}
            <Button onClick={handleCreate} className="flex items-center gap-2 shadow-theme-xs">
              <Plus size={20} />
              New Plan
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-gray-200 dark:border-navy-700">
        <button
          type="button"
          onClick={() => {
            setActiveTab('plans');
            setIsReordering(false);
          }}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'plans'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Layers size={18} />
          Subscription Plans
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('active-subscriptions');
            setIsReordering(false);
          }}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'active-subscriptions'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <CreditCard size={18} />
          Active Subscriptions
        </button>
      </div>

      {activeTab === 'plans' ? (
        isReordering ? (
          <div className="mx-auto max-w-3xl">
            <SubscriptionPlanReorder onDone={() => setIsReordering(false)} />
          </div>
        ) : (
          <SubscriptionPlanGrid
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
          />
        )
      ) : (
        <ActiveSubscriptionsList />
      )}
    </div>
  );
}
