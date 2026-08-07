export interface OrgMembership {
  orgId: string;
  role: string;
  status: string;
  joinedAt?: string;
}

export interface EndUser {
  id: string;
  email: string;
  fullName: string;
  isIndividualSubscriber: boolean;
  individualSubscriptionId?: { id: string; status: string } | string | null;
  orgMemberships: OrgMembership[];
  defaultOrgId?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isTermsAccepted: boolean;
  termsAcceptedAt?: string;
  isPrivacyPolicyAccepted: boolean;
  privacyPolicyAcceptedAt?: string;
  lastLogin?: string;
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
