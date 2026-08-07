import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endUsersService } from '@/services/end-users.service';
import { EndUserQueryParams, CreateEndUserData, UpdateEndUserData } from '@/types/end-user.types';
import toast from 'react-hot-toast';

export const useEndUsers = (params: EndUserQueryParams = {}) => {
  const queryClient = useQueryClient();

  const endUsersQuery = useQuery({
    queryKey: ['end-users', params],
    queryFn: () => endUsersService.getEndUsers(params),
  });

  const createEndUserMutation = useMutation({
    mutationFn: (data: CreateEndUserData) => endUsersService.createEndUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['end-users'] });
      toast.success('End user created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create end user');
    },
  });

  const updateEndUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEndUserData }) =>
      endUsersService.updateEndUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['end-users'] });
      toast.success('End user updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update end user');
    },
  });

  const deleteEndUserMutation = useMutation({
    mutationFn: endUsersService.deleteEndUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['end-users'] });
      toast.success('End user deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete end user');
    },
  });

  return {
    endUsers: endUsersQuery.data?.data || [],
    meta: endUsersQuery.data?.meta,
    isLoading: endUsersQuery.isLoading,
    isError: endUsersQuery.isError,
    error: endUsersQuery.error,
    createEndUser: createEndUserMutation.mutateAsync,
    updateEndUser: updateEndUserMutation.mutateAsync,
    deleteEndUser: deleteEndUserMutation.mutateAsync,
    isCreating: createEndUserMutation.isPending,
    isUpdating: updateEndUserMutation.isPending,
    isDeleting: deleteEndUserMutation.isPending,
  };
};

export const useEndUser = (id: string | null) => {
  return useQuery({
    queryKey: ['end-users', id],
    queryFn: () => (id ? endUsersService.getEndUserById(id) : null),
    enabled: !!id,
  });
};
