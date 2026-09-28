'use client';

import React, { useState } from 'react';
import { RefreshCw, Calendar, Clock } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { DatePicker } from '@/components/ui/date-picker';
import { Organization } from '@/types/organization.types';
import { organizationsService } from '@/services/organizations.service';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface RenewSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
  onSuccess?: () => void;
}

const RENEWAL_OPTIONS = [
  { months: 1, label: '+1 Month', badge: 'Standard' },
  { months: 3, label: '+3 Months', badge: 'Quarterly' },
  { months: 6, label: '+6 Months', badge: 'Bi-Annual' },
  { months: 12, label: '+1 Year', badge: 'Annual (Best Value)' },
  { months: 24, label: '+2 Years', badge: '2-Year Saver' },
];

export const RenewSubscriptionModal: React.FC<RenewSubscriptionModalProps> = ({
  isOpen,
  onClose,
  organization,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [selectedMonths, setSelectedMonths] = useState<number>(12);
  const [seatLimit, setSeatLimit] = useState<number>(organization.seatLimit || 10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [startDateStr, setStartDateStr] = useState<string>(() => {
    if (organization.subscriptionStartDate) {
      try {
        return new Date(organization.subscriptionStartDate).toISOString().split('T')[0] || '';
      } catch (e) {
        // fallback
      }
    }
    return new Date().toISOString().split('T')[0] || '';
  });

  // Calculate new end date based on current expiration or today
  const currentEndDate = organization.subscriptionEndDate
    ? new Date(organization.subscriptionEndDate)
    : new Date();

  // If current end date is in the past, start extension from today
  const baseDate = currentEndDate > new Date() ? currentEndDate : new Date();

  const newEndDate = new Date(baseDate);
  newEndDate.setMonth(newEndDate.getMonth() + selectedMonths);

  const handleRenew = async () => {
    setIsSubmitting(true);

    try {
      const startIso = startDateStr
        ? new Date(startDateStr).toISOString()
        : new Date().toISOString();

      await organizationsService.updateOrganization(organization.id, {
        subscriptionStartDate: startIso,
        subscriptionEndDate: newEndDate.toISOString(),
        seatLimit: Math.max(seatLimit, organization.usedSeats || 1),
        status: 'active',
      });

      toast.success(
        `Subscription for ${organization.companyName} renewed until ${newEndDate.toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          },
        )}!`,
      );

      queryClient.invalidateQueries({ queryKey: ['organizations', organization.id] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to renew organization subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={true}>
      <div className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-navy-700">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
            <RefreshCw size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Renew Organization Subscription
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ACTIVE EXTENSION
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Extend access for{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {organization.companyName}
              </span>
              . Choose an extension duration and update seat limits.
            </p>
          </div>
        </div>

        {/* Subscription Start Date & Expiry Information */}
        <div className="space-y-4">
          <DatePicker
            label="Subscription Start Date"
            value={startDateStr}
            onChange={(newDate) => setStartDateStr(newDate)}
            placeholder="Select start date..."
            accentColor="brand"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-900/60 border border-gray-100 dark:border-navy-700 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Current Expiry Date
              </span>
              <div className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar size={16} className="text-brand-500" />
                {organization.subscriptionEndDate
                  ? new Date(organization.subscriptionEndDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Not Set'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                New Expiry Date (After Renewal)
              </span>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Clock size={16} />
                {newEndDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Renewal Tenure Options */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
            Select Extension Period <span className="text-rose-500">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {RENEWAL_OPTIONS.map((opt) => {
              const isSelected = selectedMonths === opt.months;
              return (
                <div
                  key={opt.months}
                  onClick={() => setSelectedMonths(opt.months)}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 text-center relative ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10'
                      : 'border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 hover:border-gray-300 dark:hover:border-navy-600'
                  }`}
                >
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-400 block mb-1">
                    {opt.badge}
                  </span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seat Quota Configuration */}
        <div className="bg-gray-50 dark:bg-navy-900/60 p-4 rounded-2xl border border-gray-100 dark:border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
              User Seat Quota (Max Seats)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Current used seats:{' '}
              <span className="font-bold text-brand-500">{organization.usedSeats || 0}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={organization.usedSeats || 1}
              value={seatLimit}
              onChange={(e) => setSeatLimit(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-28 px-3 py-2 text-sm font-bold text-center rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-xs font-semibold text-gray-500">Seats</span>
          </div>
        </div>

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
            onClick={handleRenew}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 border-none"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Renewal...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Confirm Subscription Renewal
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
