'use client';
import React from 'react';
import { CreditCard, CalendarClock, RefreshCw, Wallet, AlertTriangle } from 'lucide-react';
import {
  PopulatedSubscription,
  SubscriptionPlanSummary,
  SUBSCRIPTION_STATUS_LABELS,
  OrgMembership,
} from '@/types/end-user.types';
import { SUBSCRIPTION_PLAN_TIER_LABELS, getTierVisual } from '@/types/subscription-plan.types';

interface SubscriptionSectionProps {
  subscription: PopulatedSubscription | null;
  memberships?: OrgMembership[];
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

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  subscription,
  memberships = [],
}) => {
  const activeSubs = [];

  // Individual Sub
  if (subscription) {
    activeSubs.push({
      title: 'Individual Plan',
      sub: subscription,
    });
  }

  // Org Subs
  memberships.forEach((m) => {
    const org = m.orgId as
      | {
          _id?: string;
          name?: string;
          companyName?: string;
          subscriptionPlanId?: string | object;
          status?: string;
          subscriptionStartDate?: string;
          subscriptionEndDate?: string;
          currencyCode?: string;
          subscriptionPrice?: number;
        }
      | undefined;
    if (org && typeof org === 'object' && org.subscriptionPlanId) {
      activeSubs.push({
        title: `Org Plan: ${org.name || org.companyName}`,
        sub: {
          id: org._id,
          status: org.status === 'active' ? 'active' : org.status,
          planId: org.subscriptionPlanId,
          currentPeriodStart: org.subscriptionStartDate,
          currentPeriodEnd: org.subscriptionEndDate,
          currencyCode: org.currencyCode,
          amountPaid: org.subscriptionPrice,
        } as unknown as PopulatedSubscription,
      });
    }
  });

  if (activeSubs.length === 0) {
    return null;
  }

  return (
    <section className="group rounded-[24px] border border-gray-200/70 bg-white p-7 shadow-theme-sm transition-all hover:border-gray-300 hover:shadow-theme-md dark:border-navy-700 dark:bg-navy-800">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-purple-50 text-purple-600 transition-transform group-hover:scale-110 group-hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:group-hover:bg-purple-500/20">
          <CreditCard size={20} />
        </span>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Plans</h2>
      </header>

      <div className="space-y-6">
        {activeSubs.map((item, idx) => {
          const sub = item.sub;
          const plan: SubscriptionPlanSummary | null =
            sub.planId && typeof sub.planId === 'object' ? sub.planId : null;
          const tierVisual = plan ? getTierVisual(plan.tier) : null;

          const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
          const daysLeft = periodEnd
            ? Math.ceil((periodEnd.getTime() - Date.now()) / 86_400_000)
            : null;

          const renewalLabel = sub.cancelAtPeriodEnd
            ? 'Ends in'
            : sub.status === 'active'
              ? 'Renews in'
              : 'Days left';
          const renewalValue =
            daysLeft === null
              ? '—'
              : daysLeft < 0
                ? 'Expired'
                : `${daysLeft} day${daysLeft === 1 ? '' : 's'}`;

          return (
            <div
              key={idx}
              className={idx > 0 ? 'pt-6 border-t border-gray-100 dark:border-navy-700/60' : ''}
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.title}{' '}
                    <span className="mx-1.5 font-normal text-gray-300 dark:text-navy-600">|</span>{' '}
                    <span className="text-gray-700 dark:text-gray-200">
                      {plan?.name || 'Subscription Plan'}
                    </span>
                  </p>
                  {plan && tierVisual && (
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ${tierVisual.chip}`}
                    >
                      {SUBSCRIPTION_PLAN_TIER_LABELS[plan.tier] || plan.tier}
                    </span>
                  )}
                  {sub.paymentProvider && (
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-gray-600 shadow-sm dark:bg-navy-700 dark:text-gray-300">
                      VIA {sub.paymentProvider}
                    </span>
                  )}
                </div>
                <span
                  className={`inline-flex shrink-0 items-center justify-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${
                    sub.status === 'active'
                      ? 'bg-success-50 text-success-600 ring-success-500/20 dark:bg-success-500/10 dark:text-success-400'
                      : 'bg-gray-100 text-gray-500 ring-gray-500/20 dark:bg-navy-700 dark:text-gray-400'
                  }`}
                >
                  {SUBSCRIPTION_STATUS_LABELS[sub.status] || sub.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatTile
                  icon={<CalendarClock size={14} />}
                  label="Period start"
                  value={formatDate(sub.currentPeriodStart)}
                />
                <StatTile
                  icon={<CalendarClock size={14} />}
                  label="Period end"
                  value={formatDate(sub.currentPeriodEnd)}
                />
                <StatTile
                  icon={<RefreshCw size={14} />}
                  label={renewalLabel}
                  value={renewalValue}
                />
                <StatTile
                  icon={<Wallet size={14} />}
                  label="Amount paid"
                  value={formatAmount(sub.amountPaid, sub.currencyCode)}
                />
              </div>

              {sub.cancelAtPeriodEnd && (
                <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-warning-200/50 bg-warning-50/50 p-4 dark:border-warning-500/20 dark:bg-warning-500/10">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning-100 text-warning-500 dark:bg-warning-500/20">
                    <AlertTriangle size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-warning-800 dark:text-warning-300">
                      Auto-renewal is turned off
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-warning-700 dark:text-warning-400/80">
                      This subscription will automatically cancel at the end of the current period
                      {sub.currentPeriodEnd ? ` (${formatDate(sub.currentPeriodEnd)})` : ''}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
