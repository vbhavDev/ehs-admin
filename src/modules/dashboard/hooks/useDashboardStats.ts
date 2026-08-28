import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizationsService } from '@/services/organizations.service';
import { endUsersService } from '@/services/end-users.service';
import { systemUsersService } from '@/services/system-users.service';
import { subscriptionPlansService } from '@/services/subscription-plans.service';
import { currenciesService } from '@/services/currencies.service';
import { websitesService } from '@/services/websites.service';
import { useHasPermission } from '@/lib/permissions';
import { ORGANIZATION_STATUS_LABELS } from '@/types/organization.types';
import { END_USER_ROLE_LABELS } from '@/types/end-user.types';
import { SUBSCRIPTION_PLAN_TIER_LABELS } from '@/types/subscription-plan.types';

/** Permission keys (mirrors the sidebar-menu seeder permission keys). */
export const DASHBOARD_PERMISSIONS = {
  ORGANIZATIONS: 'organizations.view',
  END_USERS: 'end-users.view',
  SYSTEM_USERS: 'users.view',
  PLANS: 'subscription-plans.view',
  CURRENCIES: 'currencies.view',
  WEBSITES: 'websites.view',
} as const;

const LIST_FETCH_LIMIT = 100;
const GROWTH_MONTHS = 6;

export interface BreakdownSlice {
  key: string;
  label: string;
  value: number;
}

export interface GrowthPoint {
  /** Short month label, e.g. "Mar" */
  label: string;
  organizations: number;
  endUsers: number;
}

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

/** Last N calendar months (oldest → newest), each with a short label. */
const buildMonthBuckets = (count: number): { key: string; label: string }[] => {
  const now = new Date();
  const buckets: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: monthKey(d),
      label: d.toLocaleString('en', { month: 'short' }),
    });
  }
  return buckets;
};

const parseCreatedAt = (value?: string): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Central dashboard data hook.
 *
 * Every query is gated by its module's `*.view` permission via `enabled`, so
 * restricted roles (e.g. staff) never fire requests they cannot access.
 * Aggregations are computed client-side from the returned models — the same
 * pattern the legacy dashboard used for websites.
 */
export const useDashboardStats = () => {
  const canViewOrganizations = useHasPermission(DASHBOARD_PERMISSIONS.ORGANIZATIONS);
  const canViewEndUsers = useHasPermission(DASHBOARD_PERMISSIONS.END_USERS);
  const canViewSystemUsers = useHasPermission(DASHBOARD_PERMISSIONS.SYSTEM_USERS);
  const canViewPlans = useHasPermission(DASHBOARD_PERMISSIONS.PLANS);
  const canViewCurrencies = useHasPermission(DASHBOARD_PERMISSIONS.CURRENCIES);
  const canViewWebsites = useHasPermission(DASHBOARD_PERMISSIONS.WEBSITES);

  const organizationsQuery = useQuery({
    queryKey: ['dashboard', 'organizations'],
    queryFn: () => organizationsService.getOrganizations({ limit: LIST_FETCH_LIMIT }),
    enabled: canViewOrganizations,
    staleTime: 30_000,
  });

  const endUsersQuery = useQuery({
    queryKey: ['dashboard', 'end-users'],
    queryFn: () => endUsersService.getEndUsers({ limit: LIST_FETCH_LIMIT }),
    enabled: canViewEndUsers,
    staleTime: 30_000,
  });

  const systemUsersQuery = useQuery({
    queryKey: ['dashboard', 'system-users'],
    queryFn: () => systemUsersService.getUsers({ limit: LIST_FETCH_LIMIT }),
    enabled: canViewSystemUsers,
    staleTime: 30_000,
  });

  const plansQuery = useQuery({
    queryKey: ['dashboard', 'subscription-plans'],
    queryFn: () => subscriptionPlansService.getPlans({ limit: LIST_FETCH_LIMIT }),
    enabled: canViewPlans,
    staleTime: 30_000,
  });

  const currenciesQuery = useQuery({
    queryKey: ['dashboard', 'currencies'],
    queryFn: () => currenciesService.getCurrencies({ limit: LIST_FETCH_LIMIT }),
    enabled: canViewCurrencies,
    staleTime: 30_000,
  });

  const websitesQuery = useQuery({
    queryKey: ['dashboard', 'websites'],
    queryFn: () => websitesService.getWebsites({ limit: LIST_FETCH_LIMIT }),
    enabled: canViewWebsites,
    staleTime: 30_000,
  });

  const organizations = useMemo(
    () => organizationsQuery.data?.data || [],
    [organizationsQuery.data],
  );
  const endUsers = useMemo(() => endUsersQuery.data?.data || [], [endUsersQuery.data]);
  const systemUsers = useMemo(() => systemUsersQuery.data?.data || [], [systemUsersQuery.data]);
  const plans = useMemo(() => plansQuery.data?.data || [], [plansQuery.data]);
  const currencies = useMemo(() => currenciesQuery.data?.data || [], [currenciesQuery.data]);
  const websites = useMemo(() => websitesQuery.data?.data || [], [websitesQuery.data]);

  /** Organizations grouped by lifecycle status (active, suspended, …). */
  const orgsByStatus = useMemo<BreakdownSlice[]>(() => {
    const counts = new Map<string, number>();
    organizations.forEach((org) => {
      const status = org.status || 'unknown';
      counts.set(status, (counts.get(status) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([key, value]) => ({
        key,
        label: ORGANIZATION_STATUS_LABELS[key] || key,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [organizations]);

  /** Organizations grouped by their subscription plan tier. */
  const orgsByPlanTier = useMemo<BreakdownSlice[]>(() => {
    const counts = new Map<string, number>();
    organizations.forEach((org) => {
      const tier =
        typeof org.subscriptionPlanId === 'object' && org.subscriptionPlanId
          ? org.subscriptionPlanId.tier
          : 'unassigned';
      counts.set(tier, (counts.get(tier) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([key, value]) => ({
        key,
        label: key === 'unassigned' ? 'No Plan' : SUBSCRIPTION_PLAN_TIER_LABELS[key] || key,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [organizations]);

  /** Platform-wide seat consumption (used vs. limit). */
  const seatUsage = useMemo(() => {
    const limit = organizations.reduce((sum, org) => sum + (org.seatLimit || 0), 0);
    const used = organizations.reduce((sum, org) => sum + (org.usedSeats || 0), 0);
    const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    return { used, limit, percent };
  }, [organizations]);

  /** End users grouped by org role / individual subscription. */
  const endUsersByRole = useMemo<BreakdownSlice[]>(() => {
    const counts = new Map<string, number>();
    endUsers.forEach((user) => {
      const activeMembership = user.orgMemberships?.find((m) => m.status === 'active');
      let role = activeMembership?.role as string | undefined;
      if (typeof activeMembership?.role === 'object' && activeMembership.role !== null) {
        const roleObj = activeMembership.role as { roleKey?: string; _id?: string };
        role = roleObj.roleKey || roleObj._id || String(roleObj);
      }
      role = role || (user.isIndividualSubscriber ? 'individual' : undefined);

      if (!role || typeof role !== 'string') {
        counts.set('unassigned', (counts.get('unassigned') || 0) + 1);
        return;
      }
      counts.set(role, (counts.get(role) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([key, value]) => ({
        key,
        label: key === 'unassigned' ? 'No Active Role' : END_USER_ROLE_LABELS[key] || key,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [endUsers]);

  /** Monthly sign-up growth (orgs + end users) for the last 6 months. */
  const growthTrend = useMemo<GrowthPoint[]>(() => {
    const buckets = buildMonthBuckets(GROWTH_MONTHS);
    const orgCounts = new Map<string, number>();
    const userCounts = new Map<string, number>();

    organizations.forEach((org) => {
      const d = parseCreatedAt(org.createdAt);
      if (d) orgCounts.set(monthKey(d), (orgCounts.get(monthKey(d)) || 0) + 1);
    });
    endUsers.forEach((user) => {
      const d = parseCreatedAt(user.createdAt);
      if (d) userCounts.set(monthKey(d), (userCounts.get(monthKey(d)) || 0) + 1);
    });

    return buckets.map((bucket) => ({
      label: bucket.label,
      organizations: orgCounts.get(bucket.key) || 0,
      endUsers: userCounts.get(bucket.key) || 0,
    }));
  }, [organizations, endUsers]);

  /** System users grouped by role name. */
  const systemUsersByRole = useMemo<BreakdownSlice[]>(() => {
    const counts = new Map<string, number>();
    systemUsers.forEach((user) => {
      const roleName = user.role?.name || 'No Role';
      counts.set(roleName, (counts.get(roleName) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([key, value]) => ({ key, label: key, value }))
      .sort((a, b) => b.value - a.value);
  }, [systemUsers]);

  const endUserStats = useMemo(() => {
    const verified = endUsers.filter((u) => u.isEmailVerified).length;
    const individuals = endUsers.filter((u) => u.isIndividualSubscriber).length;
    return {
      verified,
      individuals,
      orgMembers: endUsers.length - individuals,
    };
  }, [endUsers]);

  const recentOrganizations = useMemo(
    () =>
      [...organizations]
        .sort(
          (a, b) =>
            (parseCreatedAt(b.createdAt)?.getTime() || 0) -
            (parseCreatedAt(a.createdAt)?.getTime() || 0),
        )
        .slice(0, 5),
    [organizations],
  );

  const recentEndUsers = useMemo(
    () =>
      [...endUsers]
        .sort(
          (a, b) =>
            (parseCreatedAt(b.createdAt)?.getTime() || 0) -
            (parseCreatedAt(a.createdAt)?.getTime() || 0),
        )
        .slice(0, 5),
    [endUsers],
  );

  const isLoading =
    (canViewOrganizations && organizationsQuery.isLoading) ||
    (canViewEndUsers && endUsersQuery.isLoading) ||
    (canViewSystemUsers && systemUsersQuery.isLoading) ||
    (canViewPlans && plansQuery.isLoading) ||
    (canViewCurrencies && currenciesQuery.isLoading) ||
    (canViewWebsites && websitesQuery.isLoading);

  return {
    permissions: {
      organizations: canViewOrganizations,
      endUsers: canViewEndUsers,
      systemUsers: canViewSystemUsers,
      plans: canViewPlans,
      currencies: canViewCurrencies,
      websites: canViewWebsites,
    },
    isLoading,
    organizations: {
      total: organizationsQuery.data?.meta?.total ?? organizations.length,
      active: organizations.filter((o) => o.status === 'active').length,
      list: organizations,
      byStatus: orgsByStatus,
      byPlanTier: orgsByPlanTier,
      seatUsage,
      recent: recentOrganizations,
    },
    endUsers: {
      total: endUsersQuery.data?.meta?.total ?? endUsers.length,
      ...endUserStats,
      list: endUsers,
      byRole: endUsersByRole,
      recent: recentEndUsers,
    },
    systemUsers: {
      total: systemUsersQuery.data?.meta?.total ?? systemUsers.length,
      active: systemUsers.filter((u) => u.isActive).length,
      byRole: systemUsersByRole,
    },
    plans: {
      total: plansQuery.data?.meta?.total ?? plans.length,
      active: plans.filter((p) => p.isActive).length,
    },
    currencies: {
      total: currenciesQuery.data?.meta?.total ?? currencies.length,
      default: currencies.find((c) => c.isDefault) || null,
    },
    websites: {
      total: websitesQuery.data?.meta?.total ?? websites.length,
      active: websites.filter((w) => w.isActive).length,
    },
    growthTrend,
  };
};
