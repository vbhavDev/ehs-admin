'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSubscriptionPlan } from '@/modules/subscription-plans/hooks/useSubscriptionPlans';
import { SubscriptionPlanDetail } from '@/modules/subscription-plans/components/SubscriptionPlanDetail';
import { SubscriptionPlan } from '@/types/subscription-plan.types';

export default function ViewSubscriptionPlanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: plan, isLoading, isError } = useSubscriptionPlan(id);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
        <p className="font-medium text-error-500">Failed to load plan. It may not exist.</p>
        <button
          onClick={() => router.push('/subscription-plans')}
          className="text-sm font-medium text-brand-500 hover:underline"
        >
          Back to Subscription Plans
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <SubscriptionPlanDetail
        plan={plan}
        onBack={() => router.push('/subscription-plans')}
        onEdit={(p: SubscriptionPlan) => router.push(`/subscription-plans/update/${p.id}`)}
      />
    </div>
  );
}
