'use client';
import { SubscriptionPlanForm } from '@/modules/subscription-plans/components/SubscriptionPlanForm';
import { useParams } from 'next/navigation';
import { useSubscriptionPlan } from '@/modules/subscription-plans/hooks/useSubscriptionPlans';

export default function UpdateSubscriptionPlanPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: plan, isLoading, isError } = useSubscriptionPlan(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="flex justify-center items-center h-64 text-error-500 font-medium">
        Failed to load plan data. Plan might not exist.
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <SubscriptionPlanForm initialData={plan} />
    </div>
  );
}
