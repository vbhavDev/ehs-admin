import React from 'react';
import { useAuthStore } from '@/store/auth.store';

/**
 * Checks if the current user has a specific permission
 * Supports wildcard matching (e.g., '*', '*.*', 'communications.*', 'communications.providers.*')
 * @param permission The permission string to check (e.g., 'communications.providers.view')
 * @returns boolean
 */
export const hasPermission = (permission: string): boolean => {
  const { permissions, user } = useAuthStore.getState();

  if (!permission) return true;

  // 1. Super Admin role check or top-level wildcard ('*' or '*.*')
  const isSuperAdmin =
    user?.role?.roleKey === 'super_admin' ||
    user?.roles?.some((r: { roleKey?: string }) => r.roleKey === 'super_admin');

  if (isSuperAdmin || permissions?.includes('*') || permissions?.includes('*.*')) {
    return true;
  }

  if (!permissions || !Array.isArray(permissions)) {
    return false;
  }

  // 2. Exact permission match
  if (permissions.includes(permission)) {
    return true;
  }

  // 3. Wildcard entry checks:
  // e.g. "communications.*" matches "communications.providers.view"
  // e.g. "communications.providers.*" matches "communications.providers.view"
  const parts = permission.split('.');
  if (parts.length > 1) {
    // Check "domain.*" e.g., "communications.*"
    if (permissions.includes(`${parts[0]}.*`)) {
      return true;
    }
    // Check "domain.subdomain.*" e.g., "communications.providers.*"
    if (parts.length > 2 && permissions.includes(`${parts[0]}.${parts[1]}.*`)) {
      return true;
    }
  }

  return false;
};

/**
 * Reactive variant of {@link hasPermission} for client components.
 *
 * `hasPermission` reads `useAuthStore.getState()` once — it never re-evaluates
 * after the persisted auth store rehydrates on the client, which causes
 * permission-gated UI to flicker or stay hidden on first paint. This hook
 * subscribes to the store and recomputes whenever permissions/role change.
 */
export const useHasPermission = (permission: string): boolean => {
  const permissions = useAuthStore((s) => s.permissions);
  const roleKey = useAuthStore((s) => s.user?.role?.roleKey);
  const roles = useAuthStore((s) => s.user?.roles);

  return React.useMemo(() => {
    if (!permission) return true;

    const isSuperAdmin =
      roleKey === 'super_admin' ||
      roles?.some((r: { roleKey?: string }) => r.roleKey === 'super_admin');

    if (isSuperAdmin || permissions?.includes('*') || permissions?.includes('*.*')) {
      return true;
    }

    if (!permissions || !Array.isArray(permissions)) {
      return false;
    }

    if (permissions.includes(permission)) {
      return true;
    }

    const parts = permission.split('.');
    if (parts.length > 1) {
      if (permissions.includes(`${parts[0]}.*`)) {
        return true;
      }
      if (parts.length > 2 && permissions.includes(`${parts[0]}.${parts[1]}.*`)) {
        return true;
      }
    }

    return false;
  }, [permission, permissions, roleKey, roles]);
};

/**
 * React component wrapper for permission-based rendering
 */
export const Can = ({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const isAllowed = hasPermission(permission);

  if (!isAllowed) {
    return fallback;
  }

  return <>{children}</>;
};
