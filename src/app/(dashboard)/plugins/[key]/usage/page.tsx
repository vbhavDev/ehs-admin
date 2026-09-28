'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Database, Zap, Clock } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import { pluginService, AiTrackingStats, AiTokenLog } from '@/services/plugin.service';
import { formatDate } from '@/utils/dateUtils';
import dayjs from 'dayjs';

export default function PluginUsagePage() {
  const params = useParams();
  const router = useRouter();
  const pluginKey = params?.key as string;

  const [stats, setStats] = useState<AiTrackingStats | null>(null);
  const [logs, setLogs] = useState<AiTokenLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    if (pluginKey) {
      fetchData();
    }
  }, [pluginKey, page, dateFilter, customStart, customEnd]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      let startDate = undefined;
      let endDate = undefined;

      if (dateFilter === 'today') {
        startDate = dayjs().startOf('day').toISOString();
        endDate = dayjs().endOf('day').toISOString();
      } else if (dateFilter === 'month') {
        startDate = dayjs().startOf('month').toISOString();
        endDate = dayjs().endOf('month').toISOString();
      } else if (dateFilter === 'custom' && customStart && customEnd) {
        startDate = dayjs(customStart).startOf('day').toISOString();
        endDate = dayjs(customEnd).endOf('day').toISOString();
      }

      // We use the pluginKey as the provider identifier
      const [statsRes, logsRes] = await Promise.all([
        pluginService.getAiTrackingStats({ provider: pluginKey, startDate, endDate }),
        pluginService.getAiTrackingLogs({
          provider: pluginKey,
          page,
          limit: 15,
          startDate,
          endDate,
        }),
      ]);

      setStats(statsRes);
      setLogs(logsRes.data);
      if (logsRes.meta) {
        setTotalPages(logsRes.meta.totalPages);
      }
    } catch (error) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-500">
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {pluginKey} Usage & Logs
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Monitor API token consumption, costs, and request logs for this AI engine.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Date Range
          </label>
          <div className="flex items-center space-x-2">
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as 'all' | 'today' | 'month' | 'custom');
                setPage(1);
              }}
              className="h-10 px-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white min-w-[150px]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {dateFilter === 'custom' && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-10 px-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-10 px-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white"
              />
            </div>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Database size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Input Tokens
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totals?.totalInput?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Output Tokens
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totals?.totalOutput?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-500/10 text-green-500 flex items-center justify-center">
                  <span className="text-xl font-bold">$</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Estimated Cost
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(stats.totals?.totalCost || 0).toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logs Table */}
          <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-navy-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Usage Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-navy-800/50">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tokens (In / Out)
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No logs found for the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 dark:hover:bg-navy-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Clock size={14} className="mr-2 text-gray-400" />
                            {formatDate(log.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {log.userId?.email || 'System'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-navy-700 text-gray-800 dark:text-gray-200">
                            {log.feature}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {log.model}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          <span className="text-blue-500 font-medium">{log.inputTokens}</span>
                          <span className="mx-1 text-gray-400">/</span>
                          <span className="text-purple-500 font-medium">{log.outputTokens}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">
                          ${log.estimatedCostUsd?.toFixed(5) || '0.00000'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-navy-800 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
