'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  User,
  Building2,
  Calendar,
  Layers,
  Inbox,
  Eye,
  Trash2,
} from 'lucide-react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { SubscriptionItem } from '@/services/subscriptions.service';
import { useGlobalModal } from '@/hooks/useGlobalModal';

function formatCurrency(amount: number, currencyCode: string = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode || 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    return `${currencyCode} ${amount}`;
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-600 dark:bg-success-500/15 dark:text-success-400">
          <CheckCircle2 size={13} />
          Active
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-error-50 px-2.5 py-1 text-xs font-semibold text-error-600 dark:bg-error-500/15 dark:text-error-400">
          <XCircle size={13} />
          Cancelled
        </span>
      );
    case 'trialing':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          <Clock size={13} />
          Trialing
        </span>
      );
    case 'past_due':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
          <AlertTriangle size={13} />
          Past Due
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-navy-700 dark:text-gray-300">
          {status}
        </span>
      );
  }
}

export const ActiveSubscriptionsList: React.FC = () => {
  const [params, setParams] = useState({ page: 1, limit: 10, status: '' });
  const [search, setSearch] = useState('');
  const { subscriptions, meta, isLoading, deleteSubscription } = useSubscriptions(params);
  const { confirm, openModal, closeModal } = useGlobalModal();

  const totalPages = useMemo(() => {
    if (!meta?.total) return 1;
    return Math.max(1, Math.ceil(meta.total / params.limit));
  }, [meta?.total, params.limit]);

  const filteredSubscriptions = useMemo(() => {
    if (!search.trim()) return subscriptions;
    const lower = search.toLowerCase();
    return subscriptions.filter((sub) => {
      const userName = sub.userId?.fullName?.toLowerCase() || '';
      const userEmail = sub.userId?.email?.toLowerCase() || '';
      const orgName =
        sub.organizationId?.name?.toLowerCase() ||
        sub.organizationId?.companyName?.toLowerCase() ||
        '';
      const planName = sub.planId?.name?.toLowerCase() || '';
      const providerId = sub.providerSubscriptionId?.toLowerCase() || '';
      return (
        userName.includes(lower) ||
        userEmail.includes(lower) ||
        orgName.includes(lower) ||
        planName.includes(lower) ||
        providerId.includes(lower)
      );
    });
  }, [subscriptions, search]);

  const handleDelete = (sub: SubscriptionItem) => {
    const subscriberName =
      sub.userId?.fullName || sub.userId?.email || sub.organizationId?.name || 'this subscriber';
    confirm({
      title: 'Delete Subscription',
      message: `Are you sure you want to delete the subscription for "${subscriberName}"? This action cannot be undone.`,
      confirmText: 'Delete Subscription',
      type: 'danger',
      onConfirm: async () => {
        await deleteSubscription(sub.id);
      },
    });
  };

  const handleViewDetail = (sub: SubscriptionItem) => {
    openModal({
      title: 'Subscription Details',
      size: 'lg',
      content: (
        <div className="space-y-6 p-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-navy-700">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Subscription Details
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">ID: {sub.id}</p>
            </div>
            {getStatusBadge(sub.status)}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 dark:border-navy-700 dark:bg-navy-900/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Subscriber / Account
              </span>
              {sub.userId ? (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {sub.userId.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sub.userId.email}</p>
                  </div>
                </div>
              ) : sub.organizationId ? (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {sub.organizationId.name || sub.organizationId.companyName || 'Organization'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Unspecified Subscriber</p>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 dark:border-navy-700 dark:bg-navy-900/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Plan & Billing
              </span>
              <div className="mt-2">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {sub.planId?.name || 'Standard Plan'}{' '}
                  {sub.planId?.tier ? `(${sub.planId.tier})` : ''}
                </p>
                <p className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                  {formatCurrency(sub.amountPaid, sub.currencyCode)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3 dark:border-navy-700 dark:bg-navy-900/50">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Billing Period & Gateways
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Period Start:</span>{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {formatDate(sub.currentPeriodStart)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Period End:</span>{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {formatDate(sub.currentPeriodEnd)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Provider:</span>{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  {sub.paymentProvider || 'Direct / System'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Auto-Renew:</span>{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {sub.cancelAtPeriodEnd ? 'No (Cancels at end)' : 'Yes'}
                </span>
              </div>
            </div>
            {sub.providerSubscriptionId && (
              <div className="pt-2 border-t border-gray-200/60 dark:border-navy-800">
                <span className="text-xs text-gray-400">Provider Sub ID: </span>
                <code className="text-xs font-mono text-gray-800 dark:text-gray-200">
                  {sub.providerSubscriptionId}
                </code>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={closeModal}
              className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-200 dark:hover:bg-navy-600"
            >
              Close
            </button>
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscriptions, users, orgs..."
              className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-200"
            />
          </div>

          <select
            value={params.status}
            onChange={(e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 }))}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-brand-500 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past Due</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {meta?.total !== undefined && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Records:{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-100">{meta.total}</span>
          </p>
        )}
      </div>

      {/* Subscriptions Table */}
      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-navy-700 dark:bg-navy-800">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Loading active subscriptions...</p>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-navy-700 dark:bg-navy-800">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
            <Inbox size={26} />
          </span>
          <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
            {search || params.status
              ? 'No subscriptions match your filter'
              : 'No subscriptions found'}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            {search || params.status
              ? 'Try modifying your search criteria or clearing status filters.'
              : 'Active end-user and organization subscriptions from the database will appear here.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-navy-700 dark:bg-navy-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-navy-700 dark:bg-navy-900/50 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-4">Subscriber</th>
                  <th className="px-5 py-4">Plan Tier</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Billing Period</th>
                  <th className="px-5 py-4">Provider</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                {filteredSubscriptions.map((sub) => {
                  const subscriberName =
                    sub.userId?.fullName ||
                    sub.userId?.email ||
                    sub.organizationId?.name ||
                    sub.organizationId?.companyName ||
                    'Individual Subscriber';
                  const subscriberSub =
                    sub.userId?.email || (sub.organizationId ? 'Organization' : '');

                  return (
                    <tr
                      key={sub.id}
                      className="transition hover:bg-gray-50/60 dark:hover:bg-navy-700/50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-bold">
                            {sub.userId ? <User size={18} /> : <Building2 size={18} />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {subscriberName}
                            </p>
                            {subscriberSub && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {subscriberSub}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                          <Layers size={15} className="text-gray-400" />
                          {sub.planId?.name || 'Standard Plan'}
                        </div>
                      </td>

                      <td className="px-5 py-4">{getStatusBadge(sub.status)}</td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(sub.amountPaid, sub.currencyCode)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{formatDate(sub.currentPeriodStart)}</span>
                          <span>→</span>
                          <span>{formatDate(sub.currentPeriodEnd)}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-mono font-medium text-gray-700 uppercase dark:bg-navy-700 dark:text-gray-300">
                          <CreditCard size={12} />
                          {sub.paymentProvider || 'System'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(sub)}
                            title="View details"
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-navy-700 dark:hover:text-brand-400 transition"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(sub)}
                            title="Delete subscription"
                            className="rounded-lg p-2 text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-500 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filteredSubscriptions.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-100">{params.page}</span> of{' '}
            {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={params.page <= 1}
              onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-navy-700 dark:text-gray-300 dark:hover:bg-navy-800"
            >
              Previous
            </button>
            <button
              disabled={params.page >= totalPages}
              onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-navy-700 dark:text-gray-300 dark:hover:bg-navy-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
