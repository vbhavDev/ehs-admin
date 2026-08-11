export interface CreateInvitationData {
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  orgId: string;
  status: string;
  fullName?: string;
  expiresAt?: string;
  createdAt?: string;
}
