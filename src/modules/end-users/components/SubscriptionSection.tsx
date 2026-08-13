'use client';
import React from 'react';
import { CreditCard, CalendarClock, RefreshCw, Wallet, AlertTriangle } from 'lucide-react';
import {
  PopulatedSubscription,
  SubscriptionPlanSummary,
  SUBSCRIPTION_STATUS_LABELS,
} from '@/types/end-user.types';
import { SUBSCRIPTION_PLAN_TIER_LABELS, getTierVisual } from '@/types/subscription-plan.types';

interface SubscriptionSectionProps {
  subscription: PopulatedSubscription | null;
  isIndividualSubscriber: boolean;
}

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

const formatAmount = (amount?: number, currencyCode?: string) => {
  if (amount === undefined || amount === null) return '—';
  const code = currencyCode || 'INR';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString()}`;
  }
};

const STATUS_PILL_STYLES: Record<string, string> = {
  active: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
  trialing: 'bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15',
  past_due: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400',
};

const DEFAULT_PILL_STYLE = 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400';

/** Small labelled stat tile used inside the subscription card. */
const StatTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-navy-700 dark:bg-navy-900/40">
    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-navy-300">
      <span className="text-gray-400 dark:text-navy-300">{icon}</span>
      {label}
    </p>
    <p className="mt-1.5 truncate text-sm font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

/**
 * Active-subscription panel for the end-user view page — plan, status,
 * billing period, amount and payment provider, with empty states for users
 * without an individual subscription.
 */
export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  subscription,
  isIndividualSubscriber,
}) => {
  const plan: SubscriptionPlanSummary | null =
    subscription?.planId && typeof subscription.planId === 'object' ? subscription.planId : null;
  const tierVisual = plan ? getTierVisual(plan.tier) : null;

  const periodEnd = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
  const daysLeft = periodEnd ? Math.ceil((periodEnd.getTime() - Date.now()) / 86_400_000) : null;

  const renewalLabel = subscription?.cancelAtPeriodEnd
    ? 'Ends in'
    : subscription?.status === 'active'
      ? 'Renews in'
      : 'Days left';
  const renewalValue =
    daysLeft === null
      ? '—'
      : daysLeft < 0
        ? 'Expired'
        : `${daysLeft} day${daysLeft === 1 ? '' : 's'}`;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-navy-700 dark:bg-navy-800">
      <header className="mb-5 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-500 dark:bg-purple-500/10">
          <CreditCard size={18} />
        </span>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Subscription</h2>
        {subscription && (
          <span
            className={`ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              STATUS_PILL_STYLES[subscription.status] || DEFAULT_PILL_STYLE
            }`}
          >
            {SUBSCRIPTION_STATUS_LABELS[subscription.status] || subscription.status}
          </span>
        )}
      </header>

      {!subscription ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {isIndividualSubscriber
              ? 'No subscription yet — this user has not purchased an individual plan.'
              : 'No individual subscription — access is covered by an organization plan.'}
          </p>
          <p className="text-xs text-gray-400 dark:text-navy-300">
            Subscription details will appear here once a plan becomes active.
          </p>
        </div>
      ) : (
        <>
          {/* Plan identity row */}
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {plan?.name || 'Subscription Plan'}
            </p>
            {plan && tierVisual && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tierVisual.chip}`}
              >
                {SUBSCRIPTION_PLAN_TIER_LABELS[plan.tier] || plan.tier}
              </span>
            )}
            {subscription.paymentProvider && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-gray-600 dark:bg-navy-700 dark:text-gray-300">
                via {subscription.paymentProvider}
              </span>
            )}
          </div>

          {/* Billing stat tiles */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              icon={<CalendarClock size={13} />}
              label="Period start"
              value={formatDate(subscription.currentPeriodStart)}
            />
            <StatTile
              icon={<CalendarClock size={13} />}
              label="Period end"
              value={formatDate(subscription.currentPeriodEnd)}
            />
            <StatTile icon={<RefreshCw size={13} />} label={renewalLabel} value={renewalValue} />
            <StatTile
              icon={<Wallet size={13} />}
              label="Amount paid"
              value={formatAmount(subscription.amountPaid, subscription.currencyCode)}
            />
          </div>

          {subscription.cancelAtPeriodEnd && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-warning-200 bg-warning-50 p-3.5 dark:border-warning-500/20 dark:bg-warning-500/10">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning-500" />
              <p className="text-xs font-medium text-warning-700 dark:text-warning-400">
                Auto-renewal is off — this subscription cancels at the end of the current period
                {subscription.currentPeriodEnd
                  ? ` (${formatDate(subscription.currentPeriodEnd)})`
                  : ''}
                .
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
};
