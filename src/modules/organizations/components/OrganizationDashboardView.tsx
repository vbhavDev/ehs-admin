'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Mail,
  Phone,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  ShieldCheck,
  Edit,
  ArrowLeft,
  Copy,
  CheckCircle2,
  Activity,
  FileText,
  Factory,
  Sparkles,
  UserPlus,
  HardDrive,
} from 'lucide-react';
import { Organization, ORGANIZATION_STATUS_LABELS } from '@/types/organization.types';
import { getImageUrl } from '@/lib/utils';
import Button from '@/components/ui/button/Button';
import toast from 'react-hot-toast';
import { InviteUserModal } from './InviteUserModal';
import { OrganizationSubscriptionSection } from './OrganizationSubscriptionSection';
import { OrganizationPlantsSection } from './OrganizationPlantsSection';

interface OrganizationDashboardViewProps {
  organization: Organization;
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  suspended: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  pending_setup: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  expired: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  canceled: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
};

export const OrganizationDashboardView: React.FC<OrganizationDashboardViewProps> = ({
  organization,
}) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'subscription' | 'plants' | 'metrics' | 'contact'
  >('overview');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const logoObj =
    typeof organization.logoFileId === 'object' && organization.logoFileId !== null
      ? (organization.logoFileId as { url?: string; id?: string })
      : null;
  const logoUrl = logoObj?.url
    ? logoObj.url
    : getImageUrl(
        typeof organization.logoFileId === 'string' ? organization.logoFileId : logoObj?.id,
      );
  const planName =
    typeof organization.subscriptionPlanId === 'object' && organization.subscriptionPlanId?.name
      ? organization.subscriptionPlanId.name
      : 'Standard Plan';

  // Seat metrics
  const seatLimit = organization.seatLimit || 1;
  const usedSeats = organization.usedSeats || 0;
  const seatPercent = Math.min(100, Math.round((usedSeats / seatLimit) * 100));

  // Media Storage metrics
  const storageLimitGB = organization.storageLimitGB || 10;
  const rawBytes = organization.storageUsedBytes || 0;
  const storageUsedGB =
    rawBytes > 0
      ? Number((rawBytes / (1024 * 1024 * 1024)).toFixed(2))
      : (organization as { storageUsedGB?: number }).storageUsedGB || 0.25;
  const storagePercent =
    storageLimitGB === -1 ? 0 : Math.min(100, Math.round((storageUsedGB / storageLimitGB) * 100));

  // Subscription dates & progress
  const startDate = organization.subscriptionStartDate
    ? new Date(organization.subscriptionStartDate)
    : null;
  const endDate = organization.subscriptionEndDate
    ? new Date(organization.subscriptionEndDate)
    : null;

  let subscriptionDaysTotal = 0;
  let subscriptionDaysRemaining = 0;
  let subscriptionPercent = 0;

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
    subscriptionPercent = Math.min(
      100,
      Math.max(0, Math.round((elapsed / subscriptionDaysTotal) * 100)),
    );
  }

  const handleCopySlug = () => {
    navigator.clipboard.writeText(organization.slug);
    setCopied(true);
    toast.success('Organization slug copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock report metrics for visual presentation
  const metrics = {
    totalAudits: 142,
    openIncidents: 3,
    resolvedIncidents: 97,
    complianceScore: 98.4,
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 sm:p-8 shadow-sm">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            {/* Logo */}
            <div className="relative flex-shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={organization.companyName}
                  className="w-20 h-20 rounded-2xl object-cover border border-gray-100 dark:border-navy-700 shadow-md bg-white dark:bg-navy-900 p-1"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-brand-500/20">
                  {organization.companyName.charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-navy-800 ${
                  organization.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </div>

            {/* Org Info */}
            <div className="space-y-1.5">
              <div className="flex items-center flex-wrap gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {organization.companyName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${
                    STATUS_BADGE_STYLES[organization.status] || STATUS_BADGE_STYLES.canceled
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {ORGANIZATION_STATUS_LABELS[organization.status] || organization.status}
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <button
                  type="button"
                  onClick={handleCopySlug}
                  className="inline-flex items-center gap-1 font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-navy-700/60 hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors text-gray-700 dark:text-gray-300"
                  title="Click to copy slug"
                >
                  <span>/{organization.slug}</span>
                  {copied ? (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>

                {organization.domain && (
                  <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium">
                    <Globe size={14} />
                    {organization.domain}
                  </span>
                )}

                {organization.gstin && (
                  <span className="text-gray-400 dark:text-gray-500">
                    GSTIN:{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {organization.gstin}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-start lg:self-center">
            <Button
              variant="outline"
              onClick={() => router.push('/organizations')}
              className="flex items-center gap-2 text-xs"
            >
              <ArrowLeft size={16} />
              All Orgs
            </Button>

            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 text-xs bg-brand-500 hover:bg-brand-600 text-white border-none shadow-sm shadow-brand-500/20"
            >
              <UserPlus size={16} />
              Invite User
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/organizations/update/${organization.id}`)}
              className="flex items-center gap-2 text-xs"
            >
              <Edit size={16} />
              Edit Organization
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* User Seats Metric */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              User Seat Quota
            </span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {usedSeats} <span className="text-sm font-normal text-gray-400">/ {seatLimit}</span>
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  seatPercent >= 90
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                    : seatPercent >= 75
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                }`}
              >
                {seatPercent}% Used
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-navy-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  seatPercent >= 90
                    ? 'bg-rose-500'
                    : seatPercent >= 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${seatPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {seatLimit - usedSeats} seats remaining for org members
            </p>
          </div>
        </div>

        {/* Subscription Days Metric */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Subscription Status
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <CreditCard size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {subscriptionDaysRemaining > 0 ? `${subscriptionDaysRemaining} Days` : 'No Expiry'}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 truncate max-w-[100px]">
                {planName}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-navy-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${subscriptionPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
              {endDate ? `Renews on ${endDate.toLocaleDateString()}` : 'Lifetime / Trial Plan'}
            </p>
          </div>
        </div>

        {/* Managed Sites Metric */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Sites & Workforce
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <Factory size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {organization.siteCount || 0}{' '}
                <span className="text-sm font-normal text-gray-400">Plants</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                {organization.employeeCount || 0} Staff
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-navy-700 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 w-3/4 transition-all duration-500" />
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Active facilities under safety governance
            </p>
          </div>
        </div>

        {/* EHS Safety Health Metric */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              EHS Health Score
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <Activity size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {metrics.complianceScore}%
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                Optimal
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-navy-700 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 w-[98.4%] transition-all duration-500" />
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {metrics.totalAudits} audits completed | {metrics.openIncidents} pending issues
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-navy-700">
        <nav className="flex gap-6 text-sm font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <ShieldCheck size={18} />
            Overview & Resource Quotas
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'subscription'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <CreditCard size={18} />
            Subscription & Plans Catalog
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plants')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'plants'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Factory size={18} />
            Plant Facilities
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'contact'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <User size={18} />
            Contact & Address Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <FileText size={18} />
            EHS Reports & Activity
          </button>
        </nav>
      </div>

      {/* Tab 1: Subscription & Quotas */}
      {activeTab === 'overview' && (
        <div className="w-full rounded-2xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-brand-500" />
              Resource Quotas & System Limits
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Real-time capacity usage and plan allowances for {organization.companyName}
            </p>
          </div>

          <div className="space-y-5">
            {/* Member Seats Progress */}
            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-navy-900/40 border border-gray-100 dark:border-navy-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Users size={14} className="text-brand-500" />
                  Member Seats ({usedSeats} / {seatLimit})
                </span>
                <span className="text-brand-600 dark:text-brand-400">{seatPercent}% Capacity</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-navy-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    seatPercent >= 90
                      ? 'bg-rose-500'
                      : seatPercent >= 75
                        ? 'bg-amber-500'
                        : 'bg-brand-500'
                  }`}
                  style={{ width: `${seatPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>0 Seats</span>
                <span>{seatLimit} Max Authorized Seats</span>
              </div>
            </div>

            {/* Plant / Site Quota Progress */}
            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-navy-900/40 border border-gray-100 dark:border-navy-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Factory size={14} className="text-blue-500" />
                  Registered Facilities & Sites ({organization.maxSitesLimit || 1} Max Plants)
                </span>
                <span className="text-blue-600 dark:text-blue-400">Active</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-navy-700 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 w-1/2 transition-all duration-500" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>1 Site</span>
                <span>Unlimited Site Governance</span>
              </div>
            </div>

            {/* Media Storage Quota Progress */}
            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-navy-900/40 border border-gray-100 dark:border-navy-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <HardDrive size={14} className="text-emerald-500" />
                  Media Storage Allowance ({storageUsedGB} GB /{' '}
                  {storageLimitGB === -1 ? '∞' : `${storageLimitGB} GB`})
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {storagePercent}% Capacity
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-navy-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    storagePercent >= 90
                      ? 'bg-rose-500'
                      : storagePercent >= 75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>{storageUsedGB} GB Used</span>
                <span>
                  {storageLimitGB === -1
                    ? 'Unlimited GB'
                    : `${(storageLimitGB - storageUsedGB).toFixed(1)} GB Free`}
                </span>
              </div>
            </div>

            {/* Subscription Timeline Progress */}
            {startDate && endDate && (
              <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-navy-900/40 border border-gray-100 dark:border-navy-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Calendar size={14} className="text-purple-500" />
                    Subscription Period ({startDate.toLocaleDateString()} —{' '}
                    {endDate.toLocaleDateString()})
                  </span>
                  <span className="text-purple-600 dark:text-purple-400">
                    {subscriptionDaysRemaining} Days Left
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-navy-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${subscriptionPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Started {startDate.toLocaleDateString()}</span>
                  <span>Expires {endDate.toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Contact & Address Details */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Contact Person */}
          <div className="rounded-2xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User size={18} className="text-brand-500" />
              Primary Contact Administrator
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-900/50">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 flex items-center justify-center font-bold">
                  {organization.contactPersonName ? organization.contactPersonName.charAt(0) : 'A'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {organization.contactPersonName || 'Not Designated'}
                  </p>
                  <p className="text-xs text-gray-400">Organization Owner / Primary Contact</p>
                </div>
              </div>

              {organization.contactPersonEmail && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Mail size={16} className="text-gray-400 flex-shrink-0" />
                  <a
                    href={`mailto:${organization.contactPersonEmail}`}
                    className="hover:text-brand-500 transition-colors truncate"
                  >
                    {organization.contactPersonEmail}
                  </a>
                </div>
              )}

              {organization.contactPersonPhone && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Phone size={16} className="text-gray-400 flex-shrink-0" />
                  <a
                    href={`tel:${organization.contactPersonPhone}`}
                    className="hover:text-brand-500 transition-colors"
                  >
                    {organization.contactPersonPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Registered Office Address */}
          <div className="rounded-2xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin size={18} className="text-rose-500" />
              Registered Office Address
            </h3>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-navy-900/50 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {organization.address?.street && (
                <p className="font-medium">{organization.address.street}</p>
              )}
              <p>
                {[
                  organization.address?.city,
                  organization.address?.state,
                  organization.address?.postalCode,
                ]
                  .filter(Boolean)
                  .join(', ') || 'No street address provided'}
              </p>
              {organization.address?.country && (
                <p className="font-semibold text-gray-900 dark:text-white">
                  {organization.address.country}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: EHS Reports & Activity */}
      {activeTab === 'metrics' && (
        <div className="rounded-2xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-blue-500" />
                EHS Activity & Safety Reporting Metrics
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Overview of submitted incident reports, safety audits, and corrective action items
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
              Compliant & Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-navy-900/40 border border-gray-100 dark:border-navy-700/60 text-center space-y-1">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">142</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Safety Audits</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 text-center space-y-1">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">3</span>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                Open Incidents
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 text-center space-y-1">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                97%
              </span>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                Resolution Rate
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Subscription & Upgrade */}
      {activeTab === 'subscription' && (
        <OrganizationSubscriptionSection
          organization={organization}
          onRefresh={() => router.refresh()}
        />
      )}

      {/* Tab: Plant Facilities */}
      {activeTab === 'plants' && <OrganizationPlantsSection organization={organization} />}

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        orgId={organization.id}
        orgName={organization.companyName}
        usedSeats={usedSeats}
        seatLimit={seatLimit}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
};
