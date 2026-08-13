export interface SubscriptionPlanSummary {
  id: string;
  name: string;
  tier: string;
}

export interface PopulatedSubscription {
  id: string;
  status: string;
  planId?: SubscriptionPlanSummary | string | null;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  currencyCode?: string;
  amountPaid?: number;
  paymentProvider?: string;
  createdAt?: string;
}

export interface OrgMembership {
  orgId: string;
  role: string;
  status: string;
  joinedAt?: string;
  /** Org display name surfaced by the backend transform when populated (findOne). */
  orgName?: string;
}

export interface EndUser {
  id: string;
  email: string;
  fullName: string;
  isIndividualSubscriber: boolean;
  individualSubscriptionId?: PopulatedSubscription | string | null;
  orgMemberships: OrgMembership[];
  defaultOrgId?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isTermsAccepted: boolean;
  termsAcceptedAt?: string;
  isPrivacyPolicyAccepted: boolean;
  privacyPolicyAcceptedAt?: string;
  lastLogin?: string;
  storageLimitGB?: number;
  storageUsedBytes?: number;
  profileImageFileId?: { id: string; url?: string; key?: string } | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EndUserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  orgId?: string;
  isIndividualSubscriber?: boolean;
  isActive?: boolean;
  membershipStatus?: string;
  role?: string;
  sort?: string;
}

export interface CreateEndUserData {
  email: string;
  password: string;
  fullName: string;
  isIndividualSubscriber?: boolean;
  individualSubscriptionId?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isTermsAccepted?: boolean;
  isPrivacyPolicyAccepted?: boolean;
  profileImageFileId?: string;
}

export interface UpdateEndUserData {
  fullName?: string;
  password?: string;
  isIndividualSubscriber?: boolean;
  individualSubscriptionId?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isTermsAccepted?: boolean;
  termsAcceptedAt?: string;
  isPrivacyPolicyAccepted?: boolean;
  privacyPolicyAcceptedAt?: string;
  defaultOrgId?: string;
  profileImageFileId?: string;
}

export const END_USER_ROLES = [
  'org:owner',
  'org:admin',
  'org:inspector',
  'org:viewer',
  'individual',
] as const;

export type EndUserRole = (typeof END_USER_ROLES)[number];

export const END_USER_ROLE_LABELS: Record<string, string> = {
  'org:owner': 'Org Owner',
  'org:admin': 'Org Admin',
  'org:inspector': 'Org Inspector',
  'org:viewer': 'Org Viewer',
  individual: 'Individual',
};

export const ORG_MEMBERSHIP_STATUSES = ['active', 'pending_invite', 'deactivated'] as const;

export type OrgMembershipStatus = (typeof ORG_MEMBERSHIP_STATUSES)[number];

export const ORG_MEMBERSHIP_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending_invite: 'Pending Invite',
  deactivated: 'Deactivated',
};

/** Mirrors backend `SubscriptionStatus` enum (`backend/src/common/enums/end-user.enum.ts`). */
export const SUBSCRIPTION_STATUSES = ['active', 'cancelled', 'past_due', 'trialing'] as const;

export type SubscriptionStatusValue = (typeof SUBSCRIPTION_STATUSES)[number];

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  cancelled: 'Cancelled',
  past_due: 'Past Due',
  trialing: 'Trialing',
};
