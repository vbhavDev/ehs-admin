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
    <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
      <button
        type="button"
        onClick={onBack}
        className="group mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 hover:shadow-theme-sm dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        Back to Directory
      </button>

      {/* Premium Hero */}
      <div className="relative overflow-hidden rounded-[24px] border border-gray-200/50 bg-white/80 p-8 shadow-theme-lg backdrop-blur-xl transition-all hover:shadow-theme-xl dark:border-navy-700/50 dark:bg-navy-800/80">
        {/* Abstract background decorative blobs */}
        <div
          className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${getGradient(user.fullName)} opacity-10 blur-3xl`}
        />
        <div
          className={`absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr ${getGradient(user.fullName)} opacity-10 blur-3xl`}
        />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div
                className={`absolute -inset-1 rounded-3xl bg-gradient-to-br opacity-40 blur transition duration-500 group-hover:opacity-75 ${getGradient(user.fullName)}`}
              />
              <div
                className={`relative flex h-24 w-24 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br text-3xl font-bold text-white shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-105 dark:ring-navy-900 ${getGradient(user.fullName)}`}
              >
                {getInitials(user.fullName)}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {user.fullName}
                </h1>
                {user.isEmailVerified && (
                  <div className="flex items-center justify-center rounded-full bg-success-50 p-1 text-success-500 dark:bg-success-500/10">
                    <BadgeCheck size={22} className="shrink-0" aria-label="Email verified" />
                  </div>
                )}
              </div>
              <p className="mt-1.5 flex items-center gap-2 text-base font-medium text-gray-500 dark:text-gray-400">
                <Mail size={16} className="text-gray-400" />
                {user.email}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                {user.isIndividualSubscriber ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 ring-1 ring-inset ring-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400">
                    <UserRound size={14} />
                    Individual
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 ring-1 ring-inset ring-brand-500/20 dark:bg-brand-500/10 dark:text-brand-400">
                    <Building2 size={14} />
                    Org Member
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ring-1 ring-inset ${
                    user.isActive
                      ? 'bg-success-50 text-success-600 ring-success-500/20 dark:bg-success-500/10 dark:text-success-400'
                      : 'bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-navy-700 dark:text-gray-300 dark:ring-gray-400/20'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-400'}`}
                  />
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onEdit(user)}
            className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:bg-gray-800 hover:shadow-xl dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 lg:self-center"
          >
            <Pencil size={16} className="transition-transform group-hover:rotate-12" />
            <span className="relative z-10">Manage User</span>
          </button>
        </div>
      </div>

      <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 delay-100 duration-700 fill-mode-both">
        <SubscriptionSection subscription={subscription} memberships={memberships} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-4">
          {/* Account & access */}
          <section className="group rounded-[24px] border border-gray-200/70 bg-white p-7 shadow-theme-sm transition-all hover:border-gray-300 hover:shadow-theme-md dark:border-navy-700 dark:bg-navy-800 animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700 fill-mode-both">
            <header className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-brand-50 text-brand-600 transition-transform group-hover:scale-110 group-hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:group-hover:bg-brand-500/20">
                <ShieldCheck size={20} />
              </span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Account & Access</h2>
            </header>
            <ul className="divide-y divide-gray-100 dark:divide-navy-700/60">
              <InfoRow icon={<BadgeCheck size={18} />} label="Email Status">
                <BoolPill
                  value={user.isEmailVerified}
                  trueLabel="Verified"
                  falseLabel="Unverified"
                />
              </InfoRow>
              <InfoRow icon={<ScrollText size={18} />} label="Terms of Service">
                <BoolPill value={user.isTermsAccepted} />
              </InfoRow>
              <InfoRow icon={<FileCheck2 size={18} />} label="Privacy Policy">
                <BoolPill value={user.isPrivacyPolicyAccepted} />
              </InfoRow>
            </ul>
          </section>

          {/* Activity */}
          <section className="group rounded-[24px] border border-gray-200/70 bg-white p-7 shadow-theme-sm transition-all hover:border-gray-300 hover:shadow-theme-md dark:border-navy-700 dark:bg-navy-800 animate-in fade-in slide-in-from-bottom-4 delay-300 duration-700 fill-mode-both">
            <header className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-warning-50 text-warning-600 transition-transform group-hover:scale-110 group-hover:bg-warning-100 dark:bg-warning-500/10 dark:text-warning-400 dark:group-hover:bg-warning-500/20">
                <Clock size={20} />
              </span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Activity Log</h2>
            </header>
            <ul className="divide-y divide-gray-100 dark:divide-navy-700/60">
              <InfoRow icon={<CalendarClock size={18} />} label="Last Session">
                <span className="text-sm font-semibold">{formatDateTime(user.lastLogin)}</span>
              </InfoRow>
              <InfoRow icon={<CalendarClock size={18} />} label="Member Since">
                <span className="text-sm font-semibold">{formatDate(user.createdAt)}</span>
              </InfoRow>
              <InfoRow icon={<CalendarClock size={18} />} label="Last Modified">
                <span className="text-sm font-semibold">{formatDate(user.updatedAt)}</span>
              </InfoRow>
            </ul>
          </section>
        </div>

        {/* Org memberships */}
        <section className="group lg:col-span-8 self-start rounded-[24px] border border-gray-200/70 bg-white p-7 shadow-theme-sm transition-all hover:border-gray-300 hover:shadow-theme-md dark:border-navy-700 dark:bg-navy-800 animate-in fade-in slide-in-from-bottom-4 delay-400 duration-700 fill-mode-both">
          <header className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-success-50 text-success-600 transition-transform group-hover:scale-110 group-hover:bg-success-100 dark:bg-success-500/10 dark:text-success-400 dark:group-hover:bg-success-500/20">
              <Building2 size={20} />
            </span>
            <div className="flex flex-1 items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Organizations & Facilities
              </h2>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100 text-xs font-bold text-success-700 dark:bg-success-500/20 dark:text-success-400">
                {memberships.length}
              </span>
            </div>
          </header>

          {memberships.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 dark:border-navy-600 dark:bg-navy-900/50">
              <Building2 size={40} className="mb-3 text-gray-300 dark:text-navy-400" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Not assigned to any organizations
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1">
              {memberships.map((m, idx) => (
                <div
                  key={idx}
                  className="group/card relative overflow-hidden rounded-[20px] border border-gray-100 bg-gray-50/50 p-5 sm:p-6 transition-all hover:border-gray-200 hover:bg-white hover:shadow-theme-sm dark:border-navy-700 dark:bg-navy-900/30 dark:hover:border-navy-600 dark:hover:bg-navy-800"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    {/* Left: Org Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                        {(() => {
                          const orgData = m.orgId as Record<string, unknown>;
                          if (typeof orgData === 'object' && orgData !== null) {
                            return (
                              m.orgName ||
                              (orgData.name as string) ||
                              (orgData.companyName as string) ||
                              `Org …${String(orgData._id || '').slice(-6)}`
                            );
                          }
                          return m.orgName || `Org …${String(m.orgId).slice(-6)}`;
                        })()}
                      </h3>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-6 items-center rounded-md bg-gray-200/70 px-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-700 dark:bg-navy-700 dark:text-gray-300">
                          {(() => {
                            const roleKey =
                              typeof m.role === 'object' && m.role !== null
                                ? (((m.role as Record<string, unknown>).roleKey ||
                                    (m.role as Record<string, unknown>)._id ||
                                    m.role) as string)
                                : (m.role as string);
                            return END_USER_ROLE_LABELS[roleKey] || roleKey;
                          })()}
                        </span>
                        {m.joinedAt && (
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            • Joined {formatDate(m.joinedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Plants */}
                    {Array.isArray(m.plantIds) && m.plantIds.length > 0 && (
                      <div className="flex-1 border-t border-gray-100 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0 dark:border-navy-700/60">
                        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-navy-400">
                          Assigned Plants
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {m.plantIds.map(
                            (plantItem: Record<string, unknown> | string, idx: number) => {
                              const isObj = typeof plantItem === 'object' && plantItem !== null;
                              const pName = isObj
                                ? ((plantItem as Record<string, unknown>).name as string) ||
                                  ((plantItem as Record<string, unknown>).code as string)
                                : null;
                              const pId = isObj
                                ? (plantItem as Record<string, unknown>)._id ||
                                  (plantItem as Record<string, unknown>).id
                                : plantItem;
                              const display = pName || `Plant …${String(pId).slice(-4)}`;

                              return (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded-md border border-brand-200 bg-brand-50/50 px-2.5 py-1 text-xs font-semibold text-brand-700 transition-colors group-hover/card:bg-brand-50 dark:border-brand-500/20 dark:bg-brand-500/5 dark:text-brand-300 dark:group-hover/card:bg-brand-500/10"
                                >
                                  {display}
                                </span>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}

                    {/* Right: Status */}
                    <div className="flex shrink-0 items-center justify-start md:justify-end md:pl-6">
                      <span
                        className={`inline-flex shrink-0 items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset ${
                          m.status === 'active'
                            ? 'bg-success-50 text-success-600 ring-success-500/20 dark:bg-success-500/10 dark:text-success-400'
                            : m.status === 'pending_invite'
                              ? 'bg-warning-50 text-warning-600 ring-warning-500/20 dark:bg-warning-500/10 dark:text-warning-400'
                              : 'bg-gray-100 text-gray-500 ring-gray-500/20 dark:bg-navy-700 dark:text-gray-400'
                        }`}
                      >
                        {ORG_MEMBERSHIP_STATUS_LABELS[m.status] || m.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
