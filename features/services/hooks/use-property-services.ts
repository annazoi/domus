import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listPropertyServices, syncPropertyServiceLinks } from '../services/services.services';
import type { Service } from '../interfaces/service.interface';
import { hostServicesQueryKey } from './use-host-services';
import { servicesQueryKey } from './use-services';

export const usePropertyServices = (propertyId: string) => {
	return useQuery<Service[]>({
		queryKey: servicesQueryKey.byProperty(propertyId),
		queryFn: () => listPropertyServices(propertyId),
		enabled: Boolean(propertyId),
	});
};

export const useSyncPropertyServiceLinks = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (serviceIds: string[]) => syncPropertyServiceLinks(propertyId, serviceIds),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: servicesQueryKey.byProperty(propertyId) });
			void queryClient.invalidateQueries({ queryKey: hostServicesQueryKey.all });
		},
	});
};
