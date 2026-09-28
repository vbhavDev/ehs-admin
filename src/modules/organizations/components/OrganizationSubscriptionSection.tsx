'use client';

import React, { useState } from 'react';
import {
  Crown,
  Users,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  Factory,
  HardDrive,
} from 'lucide-react';
import { Organization } from '@/types/organization.types';
import { useSubscriptionPlans } from '@/modules/subscription-plans/hooks/useSubscriptionPlans';
import { SubscriptionPlan, SUBSCRIPTION_PLAN_TIER_LABELS } from '@/types/subscription-plan.types';
import Button from '@/components/ui/button/Button';
import { UpgradeSubscriptionModal } from './UpgradeSubscriptionModal';
import { RenewSubscriptionModal } from './RenewSubscriptionModal';

interface OrganizationSubscriptionSectionProps {
  organization: Organization;
  onRefresh?: () => void;
}

export const OrganizationSubscriptionSection: React.FC<OrganizationSubscriptionSectionProps> = ({
  organization,
  onRefresh,
}) => {
  const { plans: rawPlans } = useSubscriptionPlans({ isActive: true });

  // Filter & sort organization / enterprise plans in logical order flow
  const TIER_ORDER_MAP: Record<string, number> = {
    enterprise_starter: 1,
    enterprise_pro: 2,
    enterprise_custom: 3,
    custom: 4,
  };

  const plans = (rawPlans || [])
    .filter(
      (p) => p.tier !== 'free' && p.tier !== 'individual_pro' && p.tier !== 'individual_business',
    )
    .sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : (TIER_ORDER_MAP[a.tier] ?? 99);
      const orderB = typeof b.order === 'number' ? b.order : (TIER_ORDER_MAP[b.tier] ?? 99);
      if (orderA !== orderB) return orderA - orderB;
      return 0;
    });

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [targetPlanId, setTargetPlanId] = useState<string | undefined>(undefined);

  // Determine if Organization has an active subscription
  const currentPlanId =
    typeof organization.subscriptionPlanId === 'object' && organization.subscriptionPlanId !== null
      ? (organization.subscriptionPlanId as { id?: string; _id?: string }).id ||
        (organization.subscriptionPlanId as { id?: string; _id?: string })._id
      : organization.subscriptionPlanId || '';

  const hasActiveSubscription =
    Boolean(currentPlanId) &&
    organization.status !== 'pending_setup' &&
    Boolean(organization.subscriptionEndDate);

  // Active Plan Object & Tier
  const activePlanObj =
    typeof organization.subscriptionPlanId === 'object'
      ? (organization.subscriptionPlanId as SubscriptionPlan)
      : plans.find((p) => p.id === currentPlanId);

  const planName =
    activePlanObj?.name || (hasActiveSubscription ? 'Standard Plan' : 'No Active Subscription');
  const planTier = activePlanObj?.tier || 'enterprise_starter';

  // Metrics calculation
  const seatLimit = organization.seatLimit || 10;
  const usedSeats = organization.usedSeats || 0;
  const seatPercent = Math.min(100, Math.round((usedSeats / seatLimit) * 100));

  // Plants / Sites limit & usage
  const siteCount = 1;
  const plantLimit = organization.maxSitesLimit || activePlanObj?.maxPlants || 3;
  const plantPercent =
    plantLimit === -1 ? 0 : Math.min(100, Math.round((siteCount / plantLimit) * 100));

  // Storage Allocation in GBs
  const storageLimitGB = organization.storageLimitGB || activePlanObj?.maxStorageGB || 10;
  const rawBytes = organization.storageUsedBytes || 0;
  const storageUsedGB =
    rawBytes > 0
      ? Number((rawBytes / (1024 * 1024 * 1024)).toFixed(2))
      : (organization as { storageUsedGB?: number }).storageUsedGB || 0.25;
  const storagePercent =
    storageLimitGB === -1 ? 0 : Math.min(100, Math.round((storageUsedGB / storageLimitGB) * 100));

  const startDate = organization.subscriptionStartDate
    ? new Date(organization.subscriptionStartDate)
    : null;
  const endDate = organization.subscriptionEndDate
    ? new Date(organization.subscriptionEndDate)
    : null;

  let subscriptionDaysTotal = 365;
  let subscriptionDaysRemaining = 0;
  let _subscriptionPercent = 0;
  let isExpiringSoon = false;
  let isExpired = false;

  if (startDate && endDate) {
    const now = new Date();
    subscriptionDaysTotal = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const elapsed = Math.max(
      0,
      Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    );
    subscriptionDaysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
    _subscriptionPercent = Math.min(
      100,
      Math.max(0, Math.round((elapsed / subscriptionDaysTotal) * 100)),
    );

    if (subscriptionDaysRemaining <= 0) {
      isExpired = true;
    } else if (subscriptionDaysRemaining <= 30) {
      isExpiringSoon = true;
    }
  }

  const handleOpenUpgrade = (planId?: string) => {
    setTargetPlanId(planId);
    setIsUpgradeModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* HERO BANNER: Active vs Empty Subscription State */}
      {!hasActiveSubscription ? (
        /* Empty Active Subscription Card */
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 bg-gradient-to-br from-amber-500/5 via-brand-500/5 to-transparent p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 flex-shrink-0">
                <AlertCircle size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    NO ACTIVE SUBSCRIPTION
                  </span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  No Active Subscription Assigned
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-xl">
                  This organization is operating without an active plan. Assign a subscription tier
                  from the catalog below to provision{' '}
                  <strong className="text-gray-800 dark:text-gray-200">User Seats</strong>,{' '}
                  <strong className="text-gray-800 dark:text-gray-200">Plant/Site Quotas</strong>,
                  and{' '}
                  <strong className="text-gray-800 dark:text-gray-200">
                    Storage GB Allowances
                  </strong>
                  .
                </p>
              </div>
            </div>

            <Button
              onClick={() => handleOpenUpgrade()}
              className="flex items-center gap-2 text-xs bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-lg shadow-amber-500/20 border-none whitespace-nowrap self-start md:self-center py-3 px-5"
            >
              <PlusCircle size={18} />
              Add / Assign Subscription Plan
            </Button>
          </div>
        </div>
      ) : (
        /* Active Subscription Hero Banner */
        <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 sm:p-8 shadow-sm">
          {/* Glow decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-navy-700">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/20">
                <Crown size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    {SUBSCRIPTION_PLAN_TIER_LABELS[planTier] || planTier}
                  </span>
                  {isExpired ? (
                    <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      Expired
                    </span>
                  ) : isExpiringSoon ? (
                    <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Expiring Soon ({subscriptionDaysRemaining} Days Left)
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Active Subscription
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {planName}
                </h2>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsRenewModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <RefreshCw size={16} />
                Renew Subscription
              </Button>
              <Button
                onClick={() => handleOpenUpgrade()}
                className="flex items-center gap-2 text-xs bg-gradient-to-r from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-500/20 border-none"
              >
                <TrendingUp size={16} />
                Upgrade Plan Tier
              </Button>
            </div>
          </div>

          {/* 3 Core Limit Gauges (User Seats, Plants, Storage GB) */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
            {/* 1. User Seat Quota Gauge */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-900/60 border border-gray-100 dark:border-navy-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-brand-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    User Seats
                  </span>
                </div>
                <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                  {usedSeats} / {seatLimit} Seats
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-navy-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    seatPercent >= 90
                      ? 'bg-rose-500'
                      : seatPercent >= 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${seatPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                <span>{seatPercent}% Used</span>
                <span>{Math.max(0, seatLimit - usedSeats)} Available</span>
              </div>
            </div>

            {/* 2. Plant / Factory Site Limit Gauge */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-900/60 border border-gray-100 dark:border-navy-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Factory size={16} className="text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Plants / Sites
                  </span>
                </div>
                <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                  {siteCount} / {plantLimit === -1 ? '∞' : plantLimit} Sites
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-navy-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                  style={{ width: `${plantPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                <span>{plantPercent}% Used</span>
                <span>
                  {plantLimit === -1
                    ? 'Unlimited'
                    : `${Math.max(0, plantLimit - siteCount)} Sites Left`}
                </span>
              </div>
            </div>

            {/* 3. Storage Allocation in GBs Gauge */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-900/60 border border-gray-100 dark:border-navy-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Media Storage
                  </span>
                </div>
                <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                  {storageUsedGB} / {storageLimitGB === -1 ? '∞' : `${storageLimitGB} GB`}
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-navy-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${storagePercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                <span>{storagePercent}% Capacity</span>
                <span>
                  {storageLimitGB === -1
                    ? 'Unlimited GB'
                    : `${(storageLimitGB - storageUsedGB).toFixed(1)} GB Free`}
                </span>
              </div>
            </div>

            {/* Additional Quota Details & Coverage Standards Row */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-navy-700/80 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-bold text-gray-900 dark:text-white">Inspection Limits:</span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-navy-700 font-semibold">
                  Reports:{' '}
                  <strong className="text-brand-500">
                    {organization.maxInspectionsPerMonth === -1
                      ? 'Unlimited'
                      : (organization.maxInspectionsPerMonth ?? 'Unlimited')}
                  </strong>{' '}
                  / mo
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-navy-700 font-semibold">
                  Photos:{' '}
                  <strong className="text-brand-500">
                    {organization.maxImagesPerInspection ?? 10}
                  </strong>{' '}
                  per report
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-navy-700 font-semibold">
                  Videos:{' '}
                  <strong className="text-brand-500">{organization.maxVideoUploads ?? 5}</strong>{' '}
                  per report
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-navy-700 font-semibold">
                  Max Img:{' '}
                  <strong className="text-brand-500">
                    {organization.maxImageSizeMB === -1
                      ? 'Unlimited'
                      : `${organization.maxImageSizeMB ?? 10} MB`}
                  </strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-navy-700 font-semibold">
                  Max Vid:{' '}
                  <strong className="text-brand-500">
                    {organization.maxVideoSizeMB === -1
                      ? 'Unlimited'
                      : `${organization.maxVideoSizeMB ?? 50} MB`}
                  </strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-navy-700 font-semibold">
                  Max Doc:{' '}
                  <strong className="text-brand-500">
                    {organization.maxDocumentSizeMB === -1
                      ? 'Unlimited'
                      : `${organization.maxDocumentSizeMB ?? 20} MB`}
                  </strong>
                </span>
              </div>

              {/* Coverage Badges */}
              {organization.subscriptionFeatures &&
                organization.subscriptionFeatures.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-gray-500 text-[11px]">Coverage:</span>
                    {organization.subscriptionFeatures.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade / Assign Subscription Modal */}
      <UpgradeSubscriptionModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        organization={organization}
        plans={plans}
        selectedPlanId={targetPlanId}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />

      {/* Renew Subscription Modal */}
      <RenewSubscriptionModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        organization={organization}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};
