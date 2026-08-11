import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { invitationsService } from '@/services/invitations.service';
import { CreateInvitationData } from '@/types/invitation.types';

/** Send an org invitation email to an end user (admin). */
export const useInviteEndUser = () => {
  const mutation = useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: CreateInvitationData }) =>
      invitationsService.createInvitation(orgId, data),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });

  return {
    inviteEndUser: mutation.mutateAsync,
    isInviting: mutation.isPending,
  };
};
