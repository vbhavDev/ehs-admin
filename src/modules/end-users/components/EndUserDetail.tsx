'use client';
import React from 'react';
import {
  ArrowLeft,
  Pencil,
  BadgeCheck,
  Building2,
  UserRound,
  Mail,
  CalendarClock,
  ShieldCheck,
  FileCheck2,
  ScrollText,
  CircleCheck,
  CircleX,
  Clock,
} from 'lucide-react';
import {
  EndUser,
  END_USER_ROLE_LABELS,
  ORG_MEMBERSHIP_STATUS_LABELS,
} from '@/types/end-user.types';
import { SubscriptionSection } from './SubscriptionSection';

interface EndUserDetailProps {
  user: EndUser;
  onEdit: (user: EndUser) => void;
  onBack: () => void;
}

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

const formatDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never';

const AVATAR_GRADIENTS = [
  'from-brand-500 to-purple-500',
  'from-success-500 to-brand-500',
  'from-warning-500 to-error-500',
  'from-purple-500 to-error-500',
  'from-brand-500 to-success-500',
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'U';

const getGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
};

/** Icon + label + value row used across the detail sections. */
const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}> = ({ icon, label, children }) => (
  <li className="flex items-center justify-between gap-3 py-3">
    <span className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
      <span className="text-gray-400">{icon}</span>
      {label}
    </span>
    <span className="text-sm font-semibold text-gray-900 dark:text-white">{children}</span>
  </li>
);

const BoolPill: React.FC<{ value: boolean; trueLabel?: string; falseLabel?: string }> = ({
  value,
  trueLabel = 'Yes',
  falseLabel = 'No',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      value
        ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
        : 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400'
    }`}
  >
    {value ? <CircleCheck size={12} /> : <CircleX size={12} />}
    {value ? trueLabel : falseLabel}
  </span>
);

export const EndUserDetail: React.FC<EndUserDetailProps> = ({ user, onEdit, onBack }) => {
  const memberships = user.orgMemberships || [];
  const subscription =
    user.individualSubscriptionId && typeof user.individualSubscriptionId === 'object'
      ? user.individualSubscriptionId
      : null;

  return (
    <div className="mx-auto max-w-5xl">
      <button
        type="button"
        onClick={onBack}
        className="group mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-brand-500"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Back to End Users
      </button>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-navy-700 dark:bg-navy-800">
        <div className={`h-2 w-full bg-gradient-to-r ${getGradient(user.fullName)}`} />
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-bold text-white ${getGradient(user.fullName)}`}
            >
              {getInitials(user.fullName)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
                  {user.fullName}
                </h1>
                {user.isEmailVerified && (
                  <BadgeCheck
                    size={20}
                    className="shrink-0 text-success-500"
                    aria-label="Email verified"
                  />
                )}
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Mail size={13} />
                {user.email}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {user.isIndividualSubscriber ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
                    <UserRound size={12} />
                    Individual
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    <Building2 size={12} />
                    Org Member
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    user.isActive
                      ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
                      : 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-success-500' : 'bg-gray-400'}`}
                  />
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onEdit(user)}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 lg:self-center"
          >
            <Pencil size={16} /> Edit User
          </button>
        </div>
      </div>

      {/* Active subscription */}
      <div className="mt-6">
        <SubscriptionSection
          subscription={subscription}
          isIndividualSubscriber={user.isIndividualSubscriber}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Account & access */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-navy-700 dark:bg-navy-800">
          <header className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
              <ShieldCheck size={18} />
            </span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Account & Access
            </h2>
          </header>
          <ul className="divide-y divide-gray-100 dark:divide-navy-700">
            <InfoRow icon={<BadgeCheck size={16} />} label="Email verified">
              <BoolPill
                value={user.isEmailVerified}
                trueLabel="Verified"
                falseLabel="Not verified"
              />
            </InfoRow>
            <InfoRow icon={<ScrollText size={16} />} label="Terms accepted">
              <BoolPill value={user.isTermsAccepted} />
            </InfoRow>
            <InfoRow icon={<FileCheck2 size={16} />} label="Privacy accepted">
              <BoolPill value={user.isPrivacyPolicyAccepted} />
            </InfoRow>
          </ul>
        </section>

        {/* Activity */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-navy-700 dark:bg-navy-800">
          <header className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-50 text-warning-500 dark:bg-warning-500/10">
              <Clock size={18} />
            </span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Activity</h2>
          </header>
          <ul className="divide-y divide-gray-100 dark:divide-navy-700">
            <InfoRow icon={<CalendarClock size={16} />} label="Last login">
              <span className="text-sm">{formatDateTime(user.lastLogin)}</span>
            </InfoRow>
            <InfoRow icon={<CalendarClock size={16} />} label="Joined">
              <span className="text-sm">{formatDate(user.createdAt)}</span>
            </InfoRow>
            <InfoRow icon={<CalendarClock size={16} />} label="Updated">
              <span className="text-sm">{formatDate(user.updatedAt)}</span>
            </InfoRow>
          </ul>
        </section>

        {/* Org memberships */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-navy-700 dark:bg-navy-800">
          <header className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-50 text-success-500 dark:bg-success-500/10">
              <Building2 size={18} />
            </span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Organizations</h2>
            <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-navy-700 dark:text-gray-300">
              {memberships.length}
            </span>
          </header>
          {memberships.length === 0 ? (
            <p className="text-sm italic text-gray-400">Not a member of any organization.</p>
          ) : (
            <ul className="space-y-3">
              {memberships.map((m) => (
                <li
                  key={m.orgId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-navy-700 dark:bg-navy-900/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {m.orgName || `Org …${m.orgId.slice(-6)}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {END_USER_ROLE_LABELS[m.role] || m.role}
                      {m.joinedAt ? ` · Joined ${formatDate(m.joinedAt)}` : ''}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      m.status === 'active'
                        ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
                        : m.status === 'pending_invite'
                          ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500'
                          : 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400'
                    }`}
                  >
                    {ORG_MEMBERSHIP_STATUS_LABELS[m.status] || m.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
