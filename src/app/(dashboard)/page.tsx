'use client';
import React, { useEffect, useState } from 'react';
import { Building2, Users, UserCog, CreditCard, Globe, Coins } from 'lucide-react';
import { useDashboardStats } from '@/modules/dashboard/hooks/useDashboardStats';
import { DashboardHeader } from '@/modules/dashboard/components/DashboardHeader';
import { KpiCard, KpiCardProps } from '@/modules/dashboard/components/KpiCard';
import { EndUserGrowthChart } from '@/modules/dashboard/components/EndUserGrowthChart';
import { OrgStatusChart } from '@/modules/dashboard/components/OrgStatusChart';
import { PlanTierChart } from '@/modules/dashboard/components/PlanTierChart';
import { EndUserRolesChart } from '@/modules/dashboard/components/EndUserRolesChart';
import { SeatUtilizationChart } from '@/modules/dashboard/components/SeatUtilizationChart';
import { SystemUsersRoleChart } from '@/modules/dashboard/components/SystemUsersRoleChart';
import { RecentOrganizations } from '@/modules/dashboard/components/RecentOrganizations';
import { RecentEndUsers } from '@/modules/dashboard/components/RecentEndUsers';
import { NoAccessState } from '@/modules/dashboard/components/NoAccessState';

/**
 * Role-aware platform dashboard.
 *
 * Every section is gated by the signed-in admin's module view permissions —
 * super_admin / admin / devops (wildcard) see the full platform overview,
 * while restricted roles (e.g. staff) only see the cards & charts backed by
 * the modules they can access. Users without any module access get a guided
 * empty state instead of a broken page.
 */
export default function DashboardPage() {
  const stats = useDashboardStats();
  const { permissions, isLoading } = stats;

  // The auth store rehydrates from localStorage only on the client — defer
  // rendering until mounted so SSR HTML matches the first client render
  // (same pattern as AppSidebar's mounted guard).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // KPI card pool in priority order — only cards the role may see are kept,
  // capped at four so the row stays balanced on desktop.
  const kpiCards: KpiCardProps[] = [
    ...(permissions.organizations
      ? [
          {
            title: 'Organizations',
            value: stats.organizations.total,
            subtitle: `${stats.organizations.active} active tenants`,
            icon: <Building2 size={24} strokeWidth={1.5} />,
            bgIllustration: <Building2 size={100} strokeWidth={1} />,
            iconBgColor: 'bg-purple-50 dark:bg-purple-500/10',
            iconTextColor: 'text-purple-600 dark:text-purple-400',
            href: '/organizations',
          },
        ]
      : []),
    ...(permissions.endUsers
      ? [
          {
            title: 'End Users',
            value: stats.endUsers.total,
            subtitle: `${stats.endUsers.verified} verified · ${stats.endUsers.individuals} individual`,
            icon: <Users size={24} strokeWidth={1.5} />,
            bgIllustration: <Users size={100} strokeWidth={1} />,
            iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
            iconTextColor: 'text-blue-600 dark:text-blue-400',
            href: '/end-users',
          },
        ]
      : []),
    ...(permissions.systemUsers
      ? [
          {
            title: 'System Users',
            value: stats.systemUsers.total,
            subtitle: `${stats.systemUsers.active} active team members`,
            icon: <UserCog size={24} strokeWidth={1.5} />,
            bgIllustration: <UserCog size={100} strokeWidth={1} />,
            iconBgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
            iconTextColor: 'text-indigo-600 dark:text-indigo-400',
            href: '/users',
          },
        ]
      : []),
    ...(permissions.plans
      ? [
          {
            title: 'Subscription Plans',
            value: stats.plans.total,
            subtitle: `${stats.plans.active} active plans`,
            icon: <CreditCard size={24} strokeWidth={1.5} />,
            bgIllustration: <CreditCard size={100} strokeWidth={1} />,
            iconBgColor: 'bg-green-50 dark:bg-green-500/10',
            iconTextColor: 'text-green-600 dark:text-green-400',
            href: '/subscription-plans',
          },
        ]
      : []),
    ...(permissions.websites
      ? [
          {
            title: 'Websites',
            value: stats.websites.total,
            subtitle: `${stats.websites.active} active sites`,
            icon: <Globe size={24} strokeWidth={1.5} />,
            bgIllustration: <Globe size={100} strokeWidth={1} />,
            iconBgColor: 'bg-orange-50 dark:bg-orange-500/10',
            iconTextColor: 'text-orange-600 dark:text-orange-400',
            href: '/websites',
          },
        ]
      : []),
    ...(permissions.currencies
      ? [
          {
            title: 'Currencies',
            value: stats.currencies.total,
            subtitle: stats.currencies.default
              ? `Default: ${stats.currencies.default.code}`
              : 'No default configured',
            icon: <Coins size={24} strokeWidth={1.5} />,
            bgIllustration: <Coins size={100} strokeWidth={1} />,
            iconBgColor: 'bg-yellow-50 dark:bg-yellow-500/10',
            iconTextColor: 'text-yellow-600 dark:text-yellow-400',
            href: '/currencies',
          },
        ]
      : []),
  ].slice(0, 4);

  const hasAnyAccess = Object.values(permissions).some(Boolean);
  const showGrowth = permissions.endUsers || permissions.organizations;

  // Distribution charts row — span adapts to how many sections are visible.
  const distributionCharts: React.ReactNode[] = [];
  if (permissions.organizations) {
    distributionCharts.push(
      <OrgStatusChart key="org-status" data={stats.organizations.byStatus} />,
    );
    distributionCharts.push(
      <PlanTierChart key="plan-tier" data={stats.organizations.byPlanTier} />,
    );
  }
  if (permissions.endUsers) {
    distributionCharts.push(<EndUserRolesChart key="end-roles" data={stats.endUsers.byRole} />);
  }

  // Team composition + recent activity row — span adapts likewise.
  const activityBlocks: React.ReactNode[] = [];
  if (permissions.systemUsers) {
    activityBlocks.push(<SystemUsersRoleChart key="sys-roles" data={stats.systemUsers.byRole} />);
  }
  if (permissions.organizations) {
    activityBlocks.push(
      <RecentOrganizations key="recent-orgs" organizations={stats.organizations.recent} />,
    );
  }
  if (permissions.endUsers) {
    activityBlocks.push(<RecentEndUsers key="recent-users" endUsers={stats.endUsers.recent} />);
  }

  const spanFor = (count: number): string => {
    if (count === 1) return 'col-span-12';
    if (count === 2) return 'col-span-12 xl:col-span-6';
    return 'col-span-12 md:col-span-6 xl:col-span-4';
  };

  if (!mounted || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-pulse">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 dark:bg-navy-700 rounded-lg" />
            <div className="h-4 w-64 bg-gray-100 dark:bg-navy-750 rounded-lg" />
          </div>
          <div className="h-8 w-28 bg-gray-200 dark:bg-navy-700 rounded-full" />
        </div>

        {/* KPI Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <KpiCard
              key={i}
              title=""
              value=""
              icon={null}
              iconBgColor=""
              iconTextColor=""
              isLoading={true}
            />
          ))}
        </div>

        {/* Main Charts Skeleton */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-theme-xs dark:border-navy-700 dark:bg-navy-800 animate-pulse">
            <div className="h-5 w-40 bg-gray-200 dark:bg-navy-700 rounded-md mb-2" />
            <div className="h-4 w-60 bg-gray-100 dark:bg-navy-750 rounded-md mb-6" />
            <div className="h-64 bg-gray-100 dark:bg-navy-750/50 rounded-xl" />
          </div>
          <div className="col-span-12 xl:col-span-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-theme-xs dark:border-navy-700 dark:bg-navy-800 animate-pulse">
            <div className="h-5 w-36 bg-gray-200 dark:bg-navy-700 rounded-md mb-2" />
            <div className="h-4 w-48 bg-gray-100 dark:bg-navy-750 rounded-md mb-6" />
            <div className="h-64 bg-gray-100 dark:bg-navy-750/50 rounded-xl" />
          </div>
        </div>

        {/* Sub-Charts / Activity Skeleton */}
        <div className="grid grid-cols-12 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="col-span-12 md:col-span-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-theme-xs dark:border-navy-700 dark:bg-navy-800 animate-pulse space-y-4"
            >
              <div className="h-5 w-32 bg-gray-200 dark:bg-navy-700 rounded-md" />
              <div className="h-48 bg-gray-100 dark:bg-navy-750/50 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader />

      {!hasAnyAccess ? (
        <NoAccessState />
      ) : (
        <>
          {/* KPI cards — built from live models, filtered by role permissions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {kpiCards.map((card) => (
              <KpiCard key={card.title} {...card} />
            ))}
          </div>

          {/* Growth trend + seat utilization */}
          {(showGrowth || permissions.organizations) && (
            <div className="grid grid-cols-12 gap-6">
              {showGrowth && (
                <EndUserGrowthChart
                  data={stats.growthTrend}
                  showOrganizations={permissions.organizations}
                  showEndUsers={permissions.endUsers}
                  className={
                    permissions.organizations ? 'col-span-12 xl:col-span-8' : 'col-span-12'
                  }
                />
              )}
              {permissions.organizations && (
                <SeatUtilizationChart
                  used={stats.organizations.seatUsage.used}
                  limit={stats.organizations.seatUsage.limit}
                  percent={stats.organizations.seatUsage.percent}
                  className={showGrowth ? 'col-span-12 xl:col-span-4' : 'col-span-12'}
                />
              )}
            </div>
          )}

          {/* Distribution charts */}
          {distributionCharts.length > 0 && (
            <div className="grid grid-cols-12 gap-6">
              {distributionCharts.map((chart) =>
                React.cloneElement(chart as React.ReactElement<{ className?: string }>, {
                  className: spanFor(distributionCharts.length),
                }),
              )}
            </div>
          )}

          {/* Team composition + recent activity */}
          {activityBlocks.length > 0 && (
            <div className="grid grid-cols-12 gap-6">
              {activityBlocks.map((block) =>
                React.cloneElement(block as React.ReactElement<{ className?: string }>, {
                  className: spanFor(activityBlocks.length),
                }),
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
