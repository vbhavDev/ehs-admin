'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionPlanTable } from '@/modules/subscription-plans/components/SubscriptionPlanTable';
import { SubscriptionPlan } from '@/types/subscription-plan.types';
import { useSubscriptionPlans } from '@/modules/subscription-plans/hooks/useSubscriptionPlans';
import Button from '@/components/ui/button/Button';
import { Plus } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useGlobalModal } from '@/hooks/useGlobalModal';

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const { deletePlan } = useSubscriptionPlans();
  const { confirm } = useGlobalModal();

  const handleCreate = () => {
    router.push('/subscription-plans/create');
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manage Subscription Plans
          </h1>
          <p className="text-sm text-gray-500">
            Define plan tiers, feature gates, usage limits, and multi-currency pricing
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          Add New Plan
        </Button>
      </div>

      <SubscriptionPlanTable onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
