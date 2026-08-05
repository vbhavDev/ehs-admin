import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsService } from '@/services/organizations.service';
import {
  OrganizationQueryParams,
  CreateOrganizationData,
  UpdateOrganizationData,
} from '@/types/organization.types';
import toast from 'react-hot-toast';

export const useOrganizations = (params: OrganizationQueryParams = {}) => {
  const queryClient = useQueryClient();

  const orgsQuery = useQuery({
    queryKey: ['organizations', params],
    queryFn: () => organizationsService.getOrganizations(params),
  });

  const createOrgMutation = useMutation({
    mutationFn: (data: CreateOrganizationData) => organizationsService.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create organization');
    },
  });

  const updateOrgMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationData }) =>
      organizationsService.updateOrganization(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update organization');
    },
  });

  const deleteOrgMutation = useMutation({
    mutationFn: organizationsService.deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete organization');
    },
  });

  return {
    organizations: orgsQuery.data?.data || [],
    meta: orgsQuery.data?.meta,
    isLoading: orgsQuery.isLoading,
    isError: orgsQuery.isError,
    error: orgsQuery.error,
    createOrganization: createOrgMutation.mutateAsync,
    updateOrganization: updateOrgMutation.mutateAsync,
    deleteOrganization: deleteOrgMutation.mutateAsync,
    isCreating: createOrgMutation.isPending,
    isUpdating: updateOrgMutation.isPending,
    isDeleting: deleteOrgMutation.isPending,
  };
};

export const useOrganization = (id: string | null) => {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: () => (id ? organizationsService.getOrganizationById(id) : null),
    enabled: !!id,
  });
};
