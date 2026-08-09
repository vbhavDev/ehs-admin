import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  locationsService,
  LocationQueryParams,
  CreateLocationData,
  UpdateLocationData,
} from '@/services/locations.service';
import toast from 'react-hot-toast';

export const useLocations = (params: LocationQueryParams = {}) => {
  const queryClient = useQueryClient();

  const locationsQuery = useQuery({
    queryKey: ['locations', params],
    queryFn: () => locationsService.getLocations(params),
  });

  const statesQuery = useQuery({
    queryKey: ['locations-states'],
    queryFn: () => locationsService.getStates(),
  });

  const createLocationMutation = useMutation({
    mutationFn: (data: CreateLocationData) => locationsService.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations-states'] });
      toast.success('Location entry added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add location entry');
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationData }) =>
      locationsService.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations-states'] });
      toast.success('Location entry updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update location entry');
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: (id: string) => locationsService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations-states'] });
      toast.success('Location entry deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete location entry');
    },
  });

  return {
    locations: locationsQuery.data?.data || [],
    meta: locationsQuery.data?.meta,
    states: statesQuery.data || [],
    isLoading: locationsQuery.isLoading,
    isError: locationsQuery.isError,
    error: locationsQuery.error,
    createLocation: createLocationMutation.mutateAsync,
    updateLocation: updateLocationMutation.mutateAsync,
    deleteLocation: deleteLocationMutation.mutateAsync,
    isCreating: createLocationMutation.isPending,
    isUpdating: updateLocationMutation.isPending,
    isDeleting: deleteLocationMutation.isPending,
  };
};

export const useCitiesByState = (state: string) => {
  return useQuery({
    queryKey: ['locations-cities', state],
    queryFn: () => (state ? locationsService.getCitiesByState(state) : []),
    enabled: !!state,
  });
};

export const useLocationByPincode = (pincode: string) => {
  return useQuery({
    queryKey: ['locations-pincode', pincode],
    queryFn: () =>
      pincode && pincode.length === 6 ? locationsService.getLocationByPincode(pincode) : [],
    enabled: !!pincode && pincode.length === 6,
  });
};
