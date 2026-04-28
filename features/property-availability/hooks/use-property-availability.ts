import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AvailabilityStatus } from '../interfaces/property-availability.interface';
import { listAvailability, upsertAvailability } from '../services/property-availability.services';

export const propertyAvailabilityQueryKey = {
	all: (propertyId: string, start?: string, end?: string) => ['property-availability', propertyId, start, end] as const,
};

export const usePropertyAvailability = (propertyId: string, start?: string, end?: string) => {
	return useQuery({
		queryKey: propertyAvailabilityQueryKey.all(propertyId, start, end),
		queryFn: () => listAvailability(propertyId, start, end),
		enabled: Boolean(propertyId),
	});
};

export const useUpsertPropertyAvailability = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: {
			start: string;
			end: string;
			price: number;
			is_available: boolean;
			reason?: AvailabilityStatus | null;
		}) => upsertAvailability(propertyId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['property-availability', propertyId] });
		},
	});
};
