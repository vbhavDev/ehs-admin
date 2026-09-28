'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { clientDesignService } from '@/services/client-design.service';
import { ClientDesignOverview, UpsertClientDesignDraftData } from '@/types/client-design.types';

export const CLIENT_DESIGN_QUERY_KEY = ['client-design-overview'];

export function useClientDesign() {
  const queryClient = useQueryClient();

  const overviewQuery = useQuery({
    queryKey: CLIENT_DESIGN_QUERY_KEY,
    queryFn: () => clientDesignService.getOverview(),
    staleTime: 30 * 1000,
  });

  const syncOverview = (overview: ClientDesignOverview | undefined) => {
    if (overview) queryClient.setQueryData(CLIENT_DESIGN_QUERY_KEY, overview);
  };

  const saveDraftMutation = useMutation({
    mutationFn: (data: UpsertClientDesignDraftData) => clientDesignService.saveDraft(data),
    onSuccess: (overview) => {
      syncOverview(overview);
      toast.success('Draft saved — preview it, then publish');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to save draft'),
  });

  const publishMutation = useMutation({
    mutationFn: (changeSummary?: string) => clientDesignService.publish(changeSummary),
    onSuccess: (overview) => {
      syncOverview(overview);
      toast.success('Design configuration published — client apps update within a minute');
    },
    onError: (error: Error) => toast.error(error.message || 'Publish failed'),
  });

  const rollbackMutation = useMutation({
    mutationFn: (version: number) => clientDesignService.rollback(version),
    onSuccess: (overview) => {
      syncOverview(overview);
      toast.success('Rolled back to the selected version');
    },
    onError: (error: Error) => toast.error(error.message || 'Rollback failed'),
  });

  return {
    overview: overviewQuery.data,
    isLoading: overviewQuery.isLoading,
    saveDraft: saveDraftMutation.mutateAsync,
    isSavingDraft: saveDraftMutation.isPending,
    publish: publishMutation.mutateAsync,
    isPublishing: publishMutation.isPending,
    rollback: rollbackMutation.mutateAsync,
    isRollingBack: rollbackMutation.isPending,
  };
}
