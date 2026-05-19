import { useQuery } from '@tanstack/react-query';
import { listServices } from '../services/services.services';
import type { Service } from '../interfaces/service.interface';

export const servicesQueryKey = {
	byProperty: (propertyId: string) => ['services', propertyId] as const,
};

export const useServices = (propertyId: string) => {
	return useQuery<Service[]>({
		queryKey: servicesQueryKey.byProperty(propertyId),
		queryFn: () => listServices(propertyId),
		enabled: Boolean(propertyId),
	});
};
