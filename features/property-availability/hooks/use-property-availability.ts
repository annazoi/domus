import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAvailability, upsertAvailability } from '../services/property-availability.services';

export const propertyAvailabilityQueryKey = {
	all: (propertyId: string) => ['property-availability', propertyId] as const,
};

export const usePropertyAvailability = (propertyId: string) => {
	return useQuery({
		queryKey: propertyAvailabilityQueryKey.all(propertyId),
		queryFn: () => listAvailability(propertyId),
		enabled: Boolean(propertyId),
	});
};

export const useUpsertPropertyAvailability = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: { date: string; is_available: boolean; custom_price: number | null }) =>
			upsertAvailability(propertyId, payload.date, payload.is_available, payload.custom_price),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: propertyAvailabilityQueryKey.all(propertyId) });
		},
	});
};
