import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listPropertyServices, savePropertyServices } from '../services/services.services';
import type { Service } from '../interfaces/service.interface';
import { servicesQueryKey } from './use-services';

export type PropertyServiceInput = {
	id?: string;
	name: string;
	description?: string | null;
	price: number;
};

export const usePropertyServices = (propertyId: string) => {
	return useQuery<Service[]>({
		queryKey: servicesQueryKey.byProperty(propertyId),
		queryFn: () => listPropertyServices(propertyId),
		enabled: Boolean(propertyId),
	});
};

export const useSavePropertyServices = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (services: PropertyServiceInput[]) => savePropertyServices(propertyId, services),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: servicesQueryKey.byProperty(propertyId) });
		},
	});
};
