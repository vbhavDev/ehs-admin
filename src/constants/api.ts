export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/admin/auth/login',
    SIGNUP: '/admin/auth/signup',
    LOGOUT: '/admin/auth/logout',
    ME: '/admin/auth/me',
    REFRESH: '/admin/auth/refresh',
    FORGOT_PASSWORD: '/admin/auth/forgot-password',
    VERIFY_OTP: '/admin/auth/verify-otp',
    RESET_PASSWORD: '/admin/auth/reset-password',
    PROFILE: '/admin/auth/profile',
    CHANGE_PASSWORD: '/admin/auth/change-password',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  MEDIA: {
    BASE: '/media',
    UPLOAD: '/media/upload',
  },
  ADMIN: {
    MENUS: '/admin/sidebar-menu',
    ROLES: {
      BASE: '/admin/roles',
      BY_ID: (id: string) => `/admin/roles/${id}`,
    },
    CURRENCIES: {
      BASE: '/admin/currencies',
      BY_ID: (id: string) => `/admin/currencies/${id}`,
    },
    SUBSCRIPTION_PLANS: {
      BASE: '/admin/subscription-plans',
      BY_ID: (id: string) => `/admin/subscription-plans/${id}`,
    },
    ORGANIZATIONS: {
      BASE: '/admin/organizations',
      BY_ID: (id: string) => `/admin/organizations/${id}`,
    },
    END_USERS: {
      BASE: '/admin/end-users',
      BY_ID: (id: string) => `/admin/end-users/${id}`,
    },
    PLATFORM_SETTINGS: {
      BASE: '/admin/platform-settings',
      TRUNCATE_CLIENT_DATA: '/admin/platform-settings/truncate-client-data',
    },
    PLUGINS: {
      BASE: '/admin/plugins',
      BY_KEY: (key: string) => `/admin/plugins/${key}`,
      TOGGLE: (key: string) => `/admin/plugins/${key}/toggle`,
      TEST_CONNECTION: (key: string) => `/admin/plugins/${key}/test-connection`,
    },
    COMMUNICATIONS: {
      LOGS: '/admin/communications/logs',
      LOG_BY_ID: (id: string) => `/admin/communications/logs/${id}`,
      SEND: '/admin/communications/send',
      WEBHOOKS: '/admin/communications/webhooks',
      WEBHOOK_BY_ID: (id: string) => `/admin/communications/webhooks/${id}`,
    },
  },
  PUBLIC: {
    BRANDING: '/public/branding',
  },
  SYSTEM: {
    TEST_CONNECTION: '/test-connection',
    HEALTH: '/health',
  },
} as const;
