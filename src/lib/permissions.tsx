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
  if (
    user?.role?.roleKey === 'super_admin' ||
    permissions?.includes('*') ||
    permissions?.includes('*.*')
  ) {
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
