import { apiFetch } from './apiFetch';
import { CreateInvitationData, Invitation } from '@/types/invitation.types';

/** Admin org-invitation API — `/admin/organizations/:orgId/invitations`. */
export const invitationsService = {
  /** Invite an end user to an organization — sends the invite email. */
  createInvitation: async (orgId: string, data: CreateInvitationData): Promise<Invitation> => {
    return apiFetch<Invitation>(`/admin/organizations/${orgId}/invitations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
