'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Crown,
  Users,
  Calendar,
  TrendingUp,
  Factory,
  HardDrive,
  PlusCircle,
  FileText,
  Image as ImageIcon,
  Video,
  DollarSign,
  Layers,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { DatePicker } from '@/components/ui/date-picker';
import { Organization } from '@/types/organization.types';
import { SubscriptionPlan, SUBSCRIPTION_PLAN_TIER_LABELS } from '@/types/subscription-plan.types';
import { organizationsService } from '@/services/organizations.service';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface UpgradeSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
  plans: SubscriptionPlan[];
  selectedPlanId?: string;
  onSuccess?: () => void;
}

export const COVERAGE_FEATURE_OPTIONS = [
  {
    id: 'OSHA Compliance',
    label: 'OSHA Compliance',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  {
    id: 'ISO 45001',
    label: 'ISO 45001 (OH&S)',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'ISO 14001',
    label: 'ISO 14001 (EMS)',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  },
  {
    id: 'General EHS Safety',
    label: 'General EHS Safety',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  {
    id: 'AI Copilot Inspection',
    label: 'AI Copilot Inspection',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  {
    id: 'Custom Audit Workflows',
    label: 'Custom Audit Workflows',
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  {
    id: 'CCTV Automated Monitoring',
    label: 'CCTV Automated Monitoring',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
];

export const DURATION_OPTIONS = [
  { id: '1month', label: '1 Month', months: 1 },
  { id: '3months', label: '3 Months', months: 3 },
  { id: '6months', label: '6 Months', months: 6 },
  { id: '1year', label: '1 Year (Annual)', months: 12, badge: 'SAVE 20%' },
  { id: '2years', label: '2 Years', months: 24, badge: 'SAVE 30%' },
  { id: 'custom', label: 'Custom Dates', months: 0 },
];

export const UpgradeSubscriptionModal: React.FC<UpgradeSubscriptionModalProps> = ({
  isOpen,
  onClose,
  organization,
  plans,
  selectedPlanId,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const currentPlanId =
    typeof organization.subscriptionPlanId === 'object' && organization.subscriptionPlanId !== null
      ? (organization.subscriptionPlanId as { _id?: string; id?: string })._id ||
        (organization.subscriptionPlanId as { _id?: string; id?: string }).id ||
        ''
      : organization.subscriptionPlanId || '';

  const hasActiveSubscription =
    Boolean(currentPlanId) &&
    organization.status !== 'pending_setup' &&
    Boolean(organization.subscriptionEndDate);

  const [chosenPlanId, setChosenPlanId] = useState<string>(selectedPlanId || currentPlanId);
  const [durationOption, setDurationOption] = useState<string>('1year');

  // Dates
  const getInitialStartDate = (): string => {
    if (organization.subscriptionStartDate) {
      try {
        const formatted = new Date(organization.subscriptionStartDate).toISOString().split('T')[0];
        if (formatted) return formatted;
      } catch (e) {
        // fallback
      }
    }
    return new Date().toISOString().split('T')[0] || '';
  };

  const [startDate, setStartDate] = useState<string>(getInitialStartDate);
  const [endDate, setEndDate] = useState<string>('');

  // Resource & Quota Limits
  const [customSeats, setCustomSeats] = useState<number>(organization.seatLimit || 10);
  const [maxSitesLimit, setMaxSitesLimit] = useState<number>(organization.maxSitesLimit || 3);
  const [storageLimitGB, setStorageLimitGB] = useState<number>(organization.storageLimitGB || 10);
  const [maxInspectionsPerMonth, setMaxInspectionsPerMonth] = useState<number>(
    organization.maxInspectionsPerMonth ?? -1,
  );
  const [maxImagesPerInspection, setMaxImagesPerInspection] = useState<number>(
    organization.maxImagesPerInspection || 10,
  );
  const [maxVideoUploads, setMaxVideoUploads] = useState<number>(organization.maxVideoUploads || 5);

  // Pricing & Features
  const [pricingAmount, setPricingAmount] = useState<number>(organization.subscriptionPrice || 0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => {
    if (organization.subscriptionFeatures && organization.subscriptionFeatures.length > 0) {
      return organization.subscriptionFeatures;
    }
    return ['OSHA Compliance', 'ISO 45001', 'General EHS Safety'];
  });

  const [isFeatureDropdownOpen, setIsFeatureDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper date calculator
  const calculateEndDateStr = (startStr: string, dur: string): string => {
    if (!startStr) return '';
    const start = new Date(startStr);
    if (isNaN(start.getTime())) return '';

    const match = DURATION_OPTIONS.find((d) => d.id === dur);
    if (!match || match.months === 0) return endDate; // don't override custom

    const res = new Date(start);
    res.setMonth(res.getMonth() + match.months);
    return res.toISOString().split('T')[0] || endDate || '';
  };

  // Sync chosenPlanId from props
  useEffect(() => {
    if (selectedPlanId) {
      setChosenPlanId(selectedPlanId);
    } else if (currentPlanId) {
      setChosenPlanId(currentPlanId);
    } else if (plans && plans.length > 0 && plans[0]?.id) {
      setChosenPlanId(plans[0].id);
    }
  }, [selectedPlanId, currentPlanId, plans]);

  // Recalculate end date on start date or duration change
  useEffect(() => {
    if (durationOption !== 'custom') {
      const computed = calculateEndDateStr(startDate, durationOption);
      if (computed) setEndDate(computed);
    }
  }, [startDate, durationOption]);

  const targetPlan =
    plans.find((p) => p.id === chosenPlanId) || (plans && plans.length > 0 ? plans[0] : undefined);

  // Populate plan defaults whenever chosenPlanId changes
  useEffect(() => {
    if (targetPlan) {
      if (targetPlan.maxUsers && targetPlan.maxUsers > 0) {
        setCustomSeats(targetPlan.maxUsers);
      }
      if (targetPlan.maxPlants) {
        setMaxSitesLimit(targetPlan.maxPlants);
      }
      if (targetPlan.maxStorageGB) {
        setStorageLimitGB(targetPlan.maxStorageGB);
      }

      // Pre-fill pricing
      const inrPricing = targetPlan.pricing?.find((pr) => pr.currencyCode === 'INR');
      if (inrPricing && inrPricing.cycles) {
        let targetDuration = 'monthly';
        if (durationOption === '3months') targetDuration = 'quarterly';
        else if (durationOption === '6months') targetDuration = 'halfyearly';
        else if (durationOption === '1year' || durationOption === '2years')
          targetDuration = 'annual';

        const cycle = inrPricing.cycles.find(
          (c) =>
            c.duration.toLowerCase() === targetDuration ||
            c.duration.toLowerCase().includes(targetDuration),
        );
        if (cycle) {
          setPricingAmount(durationOption === '2years' ? cycle.price * 2 : cycle.price);
        } else {
          const activeCycle = inrPricing.cycles.find((c) => c.status);
          setPricingAmount(activeCycle ? activeCycle.price : 0);
        }
      }

      // Pre-fill features if plan has features
      if (targetPlan.features && targetPlan.features.length > 0) {
        // Match features or default
        const matched = COVERAGE_FEATURE_OPTIONS.filter((opt) =>
          targetPlan.features.some((f) => f.toLowerCase().includes(opt.id.toLowerCase())),
        ).map((opt) => opt.id);

        if (matched.length > 0) {
          setSelectedFeatures(Array.from(new Set([...selectedFeatures, ...matched])));
        }
      }
    }
  }, [chosenPlanId, durationOption]);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((f) => f !== featureId) : [...prev, featureId],
    );
  };

  const handleUpgrade = async () => {
    if (!targetPlan && !chosenPlanId) {
      toast.error('Please select a subscription plan');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please specify valid start and end dates');
      return;
    }

    setIsSubmitting(true);

    try {
      const startIso = new Date(startDate).toISOString();
      const endIso = new Date(endDate).toISOString();

      const targetPlanObj = targetPlan as { id?: string; _id?: string } | undefined;
      await organizationsService.updateOrganization(organization.id, {
        subscriptionPlanId: targetPlanObj?.id || targetPlanObj?._id || chosenPlanId,
        subscriptionStartDate: startIso,
        subscriptionEndDate: endIso,
        seatLimit: Math.max(customSeats, organization.usedSeats || 1),
        maxSitesLimit,
        storageLimitGB,
        maxInspectionsPerMonth,
        maxImagesPerInspection,
        maxVideoUploads,
        subscriptionPrice: pricingAmount,
        subscriptionFeatures: selectedFeatures,
        status: 'active',
      });

      toast.success(
        hasActiveSubscription
          ? `Successfully upgraded ${organization.companyName} to ${targetPlan?.name || 'New Plan'}!`
          : `Successfully assigned ${targetPlan?.name || 'Subscription Plan'} to ${organization.companyName}!`,
      );

      queryClient.invalidateQueries({ queryKey: ['organizations', organization.id] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update subscription details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" showCloseButton={true}>
      <div className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-navy-700">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/20 flex-shrink-0">
            {hasActiveSubscription ? <Sparkles size={26} /> : <PlusCircle size={26} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {hasActiveSubscription
                  ? 'Upgrade Organization Subscription'
                  : 'Assign Subscription Plan'}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                PRO MAX
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure complete subscription quotas, site counts, storage GBs, inspection limits,
              duration, and compliance feature coverage for{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {organization.companyName}
              </span>
              .
            </p>
          </div>
        </div>

        {/* 1. Base Plan Selector Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Crown size={15} className="text-amber-500" />
            1. Select Plan Tier Catalog:
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plans.map((p) => {
              const isSelected = chosenPlanId === p.id;
              const isCurrent = currentPlanId === p.id && hasActiveSubscription;
              const inrPricing = p.pricing?.find((pr) => pr.currencyCode === 'INR');
              let displayPrice = 0;
              if (inrPricing && inrPricing.cycles) {
                let targetDuration = 'monthly';
                if (durationOption === '3months') targetDuration = 'quarterly';
                else if (durationOption === '6months') targetDuration = 'halfyearly';
                else if (durationOption === '1year' || durationOption === '2years')
                  targetDuration = 'annual';

                const cycle = inrPricing.cycles.find(
                  (c) =>
                    c.duration.toLowerCase() === targetDuration ||
                    c.duration.toLowerCase().includes(targetDuration),
                );
                if (cycle) {
                  displayPrice = durationOption === '2years' ? cycle.price * 2 : cycle.price;
                } else {
                  const activeCycle = inrPricing.cycles.find((c) => c.status);
                  displayPrice = activeCycle ? activeCycle.price : 0;
                }
              }

              return (
                <div
                  key={p.id}
                  onClick={() => setChosenPlanId(p.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 ring-2 ring-brand-500/40 shadow-lg shadow-brand-500/10'
                      : 'border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 hover:border-gray-300 dark:hover:border-navy-600'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-2.5 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                      CURRENT
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                        {p.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-400">
                        {SUBSCRIPTION_PLAN_TIER_LABELS[p.tier] || p.tier}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="text-xl font-black text-gray-900 dark:text-white">
                        ₹{displayPrice.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                        /{durationOption === '1year' || durationOption === '2years' ? 'yr' : 'mo'}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-navy-800 pt-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Seats:</span>
                        <span className="font-bold">
                          {p.maxUsers === -1 ? 'Unlimited' : `${p.maxUsers} Users`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Plants:</span>
                        <span className="font-bold">
                          {p.maxPlants === -1 ? 'Unlimited' : `${p.maxPlants || 3} Sites`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Storage:</span>
                        <span className="font-bold">
                          {p.maxStorageGB === -1 ? 'Unlimited' : `${p.maxStorageGB || 10} GB`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-1">
                    <div
                      className={`w-full py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                        isSelected
                          ? 'bg-brand-500 text-white shadow'
                          : 'bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Subscription Duration & Automatic Date Calculation */}
        <div className="bg-gray-50 dark:bg-navy-900/60 p-4 rounded-2xl border border-gray-100 dark:border-navy-700 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Calendar size={16} className="text-brand-500" />
              2. Subscription Duration & Period:
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDurationOption(d.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  durationOption === d.id
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white dark:bg-navy-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-navy-600 hover:border-gray-300'
                }`}
              >
                {d.label}
                {d.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-400 text-navy-950 font-black">
                    {d.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Date Pickers (Interactive Premium UI Pro Max Calendar) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Start Date Calendar Input */}
            <div>
              <DatePicker
                label="Subscription Start Date"
                value={startDate}
                onChange={(newDate) => setStartDate(newDate)}
                placeholder="Select start date..."
                accentColor="brand"
              />
            </div>

            {/* End Date Calendar Input */}
            <div>
              <DatePicker
                label="Subscription End Date"
                value={endDate}
                onChange={(newDate) => {
                  setEndDate(newDate);
                  setDurationOption('custom');
                }}
                placeholder="Select end date..."
                accentColor="emerald"
              />
            </div>
          </div>
        </div>

        {/* 3. Detailed Capacity & Limits Form Controls */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Layers size={16} className="text-indigo-500" />
            3. Resource Quotas & Inspection Constraints:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* User Seats */}
            <div className="p-3.5 bg-gray-50 dark:bg-navy-900/60 rounded-xl border border-gray-100 dark:border-navy-700">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <Users size={14} className="text-brand-500" /> User Seat Quota
              </label>
              <input
                type="number"
                min={organization.usedSeats || 1}
                value={customSeats}
                onChange={(e) => setCustomSeats(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Used: {organization.usedSeats || 0} seats
              </span>
            </div>

            {/* Plant / Sites */}
            <div className="p-3.5 bg-gray-50 dark:bg-navy-900/60 rounded-xl border border-gray-100 dark:border-navy-700">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <Factory size={14} className="text-indigo-500" /> Plant / Factory Sites
              </label>
              <input
                type="number"
                min={1}
                value={maxSitesLimit}
                onChange={(e) => setMaxSitesLimit(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Max site branches</span>
            </div>

            {/* Storage GB */}
            <div className="p-3.5 bg-gray-50 dark:bg-navy-900/60 rounded-xl border border-gray-100 dark:border-navy-700">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <HardDrive size={14} className="text-emerald-500" /> Storage Capacity (GB)
              </label>
              <input
                type="number"
                min={1}
                value={storageLimitGB}
                onChange={(e) => setStorageLimitGB(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Cloud media limit</span>
            </div>

            {/* Monthly Inspections */}
            <div className="p-3.5 bg-gray-50 dark:bg-navy-900/60 rounded-xl border border-gray-100 dark:border-navy-700">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <FileText size={14} className="text-amber-500" /> Reports / Inspection Count
              </label>
              <input
                type="number"
                value={maxInspectionsPerMonth}
                onChange={(e) => setMaxInspectionsPerMonth(parseInt(e.target.value) || -1)}
                className="w-full px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">-1 for Unlimited</span>
            </div>

            {/* Images per Inspection */}
            <div className="p-3.5 bg-gray-50 dark:bg-navy-900/60 rounded-xl border border-gray-100 dark:border-navy-700">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-blue-500" /> Photos per Inspection
              </label>
              <input
                type="number"
                min={1}
                value={maxImagesPerInspection}
                onChange={(e) =>
                  setMaxImagesPerInspection(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Max photo upload limit</span>
            </div>

            {/* Videos per Inspection */}
            <div className="p-3.5 bg-gray-50 dark:bg-navy-900/60 rounded-xl border border-gray-100 dark:border-navy-700">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <Video size={14} className="text-rose-500" /> Inspection Videos
              </label>
              <input
                type="number"
                min={0}
                value={maxVideoUploads}
                onChange={(e) => setMaxVideoUploads(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Max video clips</span>
            </div>
          </div>
        </div>

        {/* 4. Feature Coverage Frameworks (Multi-Select) & Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Coverage Multi-select Dropdown */}
          <div className="space-y-2 relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              4. Feature (Coverage Standards):
            </label>

            <button
              type="button"
              onClick={() => setIsFeatureDropdownOpen(!isFeatureDropdownOpen)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-left flex items-center justify-between gap-2 shadow-sm"
            >
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                {selectedFeatures.length === 0
                  ? 'Select Compliance Coverage...'
                  : `${selectedFeatures.length} Standards Selected`}
              </span>
              <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
            </button>

            {/* Dropdown Options */}
            {isFeatureDropdownOpen && (
              <div className="absolute left-0 right-0 z-30 mt-1 p-2 bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 shadow-xl space-y-1 max-h-56 overflow-y-auto">
                {COVERAGE_FEATURE_OPTIONS.map((opt) => {
                  const isChecked = selectedFeatures.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggleFeature(opt.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs font-bold transition-all ${
                        isChecked
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                          : 'hover:bg-gray-100 dark:hover:bg-navy-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isChecked && <Check size={14} className="text-brand-500" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Badges Preview */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedFeatures.map((feat) => {
                const opt = COVERAGE_FEATURE_OPTIONS.find((o) => o.id === feat);
                return (
                  <span
                    key={feat}
                    onClick={() => toggleFeature(feat)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border cursor-pointer ${
                      opt?.color || 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {feat}
                    <span className="text-[10px] hover:text-red-500 font-extrabold ml-0.5">×</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Pricing Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-500" />
              5. Subscription Price / Amount:
            </label>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-400">₹</span>
              <input
                type="number"
                min={0}
                value={pricingAmount}
                onChange={(e) => setPricingAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-7 pr-3 py-2 text-base font-extrabold rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Total subscription price charged to {organization.companyName}.
            </p>
          </div>
        </div>

        {/* Plan Summary Footer */}
        {targetPlan && (
          <div className="p-4 rounded-2xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between text-gray-900 dark:text-white font-bold">
              <span>Plan Allocation Summary:</span>
              <span className="text-brand-600 dark:text-brand-400 font-extrabold">
                {targetPlan.name} ({durationOption.toUpperCase()}) — ₹
                {pricingAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
              <span>Subscription Period:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {startDate} → {endDate}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
              <span>Resource Allocation:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {customSeats} Seats | {maxSitesLimit} Sites | {storageLimitGB} GB Storage |{' '}
                {maxInspectionsPerMonth === -1 ? 'Unlimited' : maxInspectionsPerMonth} Reports
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-xs bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 px-5 py-2.5 font-bold"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {hasActiveSubscription ? 'Applying Subscription...' : 'Activating Subscription...'}
              </>
            ) : (
              <>
                {hasActiveSubscription ? <TrendingUp size={16} /> : <PlusCircle size={16} />}
                {hasActiveSubscription ? 'Confirm Subscription Update' : 'Activate Subscription'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
