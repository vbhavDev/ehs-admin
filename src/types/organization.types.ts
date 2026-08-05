export interface OrgAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Organization {
  id: string;
  companyName: string;
  slug: string;
  domain?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  address?: OrgAddress;
  gstin?: string;
  employeeCount?: number;
  siteCount?: number;
  logoFileId?: { id: string; url?: string; key?: string } | string | null;
  subscriptionPlanId?: { id: string; name: string; tier: string } | string | null;
  currencyCode?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  seatLimit: number;
  usedSeats: number;
  status: string;
  isActive: boolean;
  billingEmail?: string;
  createdByAdminId?: { id: string; fullName: string; email: string } | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isActive?: boolean;
  subscriptionPlanId?: string;
  sort?: string;
}

export interface CreateOrganizationData {
  companyName: string;
  slug: string;
  domain?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  address?: OrgAddress;
  gstin?: string;
  employeeCount?: number;
  siteCount?: number;
  logoFileId?: string;
  subscriptionPlanId?: string;
  currencyCode?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  seatLimit?: number;
  billingEmail?: string;
}

export interface UpdateOrganizationData {
  companyName?: string;
  domain?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  address?: OrgAddress;
  gstin?: string;
  employeeCount?: number;
  siteCount?: number;
  logoFileId?: string;
  subscriptionPlanId?: string;
  currencyCode?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  seatLimit?: number;
  status?: string;
  isActive?: boolean;
  billingEmail?: string;
}

export const ORGANIZATION_STATUSES = [
  'active',
  'suspended',
  'pending_setup',
  'expired',
  'canceled',
] as const;

export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];

export const ORGANIZATION_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending_setup: 'Pending Setup',
  expired: 'Expired',
  canceled: 'Canceled',
};
