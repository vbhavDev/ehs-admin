'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  BadgeCheck,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  UserRound,
  CreditCard,
} from 'lucide-react';
import { EndUser, PopulatedSubscription, END_USER_ROLE_LABELS } from '@/types/end-user.types';
import { useEndUsers } from '../hooks/useEndUsers';

interface EndUserTableProps {
  onView: (user: EndUser) => void;
  onEdit: (user: EndUser) => void;
  onDelete: (user: EndUser) => void;
}

type TypeFilter = '' | 'individual' | 'org';
type StatusFilter = '' | 'active' | 'inactive';

/** Deterministic pastel gradient for the avatar, derived from the name. */
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

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Never';

function RowSkeleton() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-navy-700" />
        </td>
      ))}
    </tr>
  );
}

export const EndUserTable: React.FC<EndUserTableProps> = ({ onView, onEdit, onDelete }) => {
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    isIndividualSubscriber: undefined as boolean | undefined,
    isActive: undefined as boolean | undefined,
  });

  // Debounce the search box → server params (300ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setParams((p) => ({ ...p, search: searchInput.trim(), page: 1 }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setParams((p) => ({
      ...p,
      page: 1,
      isIndividualSubscriber: typeFilter === '' ? undefined : typeFilter === 'individual',
    }));
  }, [typeFilter]);

  useEffect(() => {
    setParams((p) => ({
      ...p,
      page: 1,
      isActive: statusFilter === '' ? undefined : statusFilter === 'active',
    }));
  }, [statusFilter]);

  const { endUsers, meta, isLoading, updateEndUser } = useEndUsers(params);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((meta?.total ?? 0) / params.limit)),
    [meta?.total, params.limit],
  );

  const handleToggleActive = async (user: EndUser) => {
    await updateEndUser({ id: user.id, data: { isActive: !user.isActive } });
  };

  const getActiveMemberships = (user: EndUser) =>
    (user.orgMemberships || []).filter((m) => m.status === 'active');

  /** Extract populated subscription info if available. */
  const getSubscriptionInfo = (user: EndUser) => {
    const sub = user.individualSubscriptionId;
    if (!sub || typeof sub === 'string') return null;
    const populated = sub as PopulatedSubscription;
    const planName =
      populated.planId && typeof populated.planId === 'object' ? populated.planId.name : null;
    return { status: populated.status, planName, periodEnd: populated.currentPeriodEnd };
  };

  const FilterChip = <T extends string>({
    value,
    current,
    onChange,
    label,
  }: {
    value: T;
    current: T;
    onChange: (v: T) => void;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={current === value}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        current === value
          ? 'bg-brand-500 text-white shadow-theme-xs'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            aria-label="Search end users"
            className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Type</span>
          <FilterChip value="" current={typeFilter} onChange={setTypeFilter} label="All" />
          <FilterChip
            value="individual"
            current={typeFilter}
            onChange={setTypeFilter}
            label="Individual"
          />
          <FilterChip
            value="org"
            current={typeFilter}
            onChange={setTypeFilter}
            label="Org Member"
          />
          <span className="mx-1 hidden h-5 w-px bg-gray-200 dark:bg-navy-700 sm:block" />
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</span>
          <FilterChip value="" current={statusFilter} onChange={setStatusFilter} label="All" />
          <FilterChip
            value="active"
            current={statusFilter}
            onChange={setStatusFilter}
            label="Active"
          />
          <FilterChip
            value="inactive"
            current={statusFilter}
            onChange={setStatusFilter}
            label="Inactive"
          />
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-navy-700 dark:bg-navy-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 dark:border-navy-700 dark:bg-navy-900/40">
                {[
                  'User',
                  'Type',
                  'Subscription',
                  'Org Roles',
                  'Last login',
                  'Status',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <RowSkeleton key={i} />
                  ))}
                </>
              ) : endUsers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                        <Users size={26} />
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                        {params.search || typeFilter || statusFilter
                          ? 'No users match your filters'
                          : 'No end users yet'}
                      </h3>
                      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                        {params.search || typeFilter || statusFilter
                          ? 'Try adjusting the search or clearing the filters.'
                          : 'End users who sign up on the client app will appear here.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                endUsers.map((user) => {
                  const activeRoles = getActiveMemberships(user);
                  return (
                    <tr
                      key={user.id}
                      className="group transition-colors hover:bg-gray-50/70 dark:hover:bg-navy-900/40"
                    >
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${getGradient(user.fullName)}`}
                          >
                            {getInitials(user.fullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {user.fullName}
                              {user.isEmailVerified && (
                                <BadgeCheck
                                  size={15}
                                  className="shrink-0 text-success-500"
                                  aria-label="Email verified"
                                />
                              )}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
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
                      </td>

                      {/* Subscription */}
                      <td className="px-5 py-4">
                        {(() => {
                          const info = getSubscriptionInfo(user);
                          if (!info) {
                            return <span className="text-xs text-gray-400">—</span>;
                          }
                          const isActive = info.status === 'active' || info.status === 'trialing';
                          return (
                            <div className="flex flex-col gap-0.5">
                              <span
                                className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  isActive
                                    ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400'
                                    : info.status === 'past_due'
                                      ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400'
                                      : 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400'
                                }`}
                              >
                                <CreditCard size={12} />
                                {info.planName || 'Plan'}
                              </span>
                              <span className="pl-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                                {isActive ? 'Active' : info.status.replace('_', ' ')}
                                {info.periodEnd && ` · until ${formatDate(info.periodEnd)}`}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Org roles */}
                      <td className="px-5 py-4">
                        {activeRoles.length === 0 ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {activeRoles.slice(0, 2).map((m) => (
                              <span
                                key={m.orgId}
                                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-navy-700 dark:text-gray-300"
                              >
                                {END_USER_ROLE_LABELS[m.role] || m.role}
                              </span>
                            ))}
                            {activeRoles.length > 2 && (
                              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-navy-700 dark:text-gray-400">
                                +{activeRoles.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Last login */}
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(user.lastLogin)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(user)}
                          title={user.isActive ? 'Click to deactivate' : 'Click to activate'}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                            user.isActive
                              ? 'bg-success-50 text-success-600 hover:bg-error-50 hover:text-error-600 dark:bg-success-500/15 dark:text-success-500 dark:hover:bg-error-500/15 dark:hover:text-error-500'
                              : 'bg-gray-100 text-gray-500 hover:bg-success-50 hover:text-success-600 dark:bg-navy-700 dark:text-gray-400 dark:hover:bg-success-500/15 dark:hover:text-success-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-success-500' : 'bg-gray-400'}`}
                          />
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onView(user)}
                            title={`View ${user.fullName}`}
                            aria-label={`View ${user.fullName}`}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-navy-700 dark:hover:text-gray-200"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(user)}
                            title={`Edit ${user.fullName}`}
                            aria-label={`Edit ${user.fullName}`}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-brand-50 hover:text-brand-500 dark:hover:bg-brand-500/10"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(user)}
                            title={`Delete ${user.fullName}`}
                            aria-label={`Delete ${user.fullName}`}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-error-50 hover:text-error-500 dark:hover:bg-error-500/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: count + pagination */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 dark:border-navy-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {meta?.total !== undefined ? (
              <>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{meta.total}</span>{' '}
                user{meta.total === 1 ? '' : 's'} · page{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {params.page}
                </span>{' '}
                of {totalPages}
              </>
            ) : (
              '—'
            )}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={params.limit}
              onChange={(e) => setParams((p) => ({ ...p, limit: Number(e.target.value), page: 1 }))}
              aria-label="Rows per page"
              className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-600 outline-none transition focus:border-brand-500 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={params.page <= 1}
              onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
              aria-label="Previous page"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-navy-700 dark:text-gray-300 dark:hover:bg-navy-800"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={params.page >= totalPages}
              onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
              aria-label="Next page"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-navy-700 dark:text-gray-300 dark:hover:bg-navy-800"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
