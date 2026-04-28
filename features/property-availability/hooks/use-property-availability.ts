import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAvailability, upsertAvailability } from '../services/property-availability.services';
import type { AvailabilityDay } from '../interfaces/property-availability.interface';

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
			reason?: 'BLOCKED' | 'MAINTENANCE' | 'BOOKED' | null;
		}) => upsertAvailability(propertyId, payload),
		onSuccess: (rows: AvailabilityDay[]) => {
			void queryClient.invalidateQueries({ queryKey: ['property-availability', propertyId] });
			for (const row of rows) {
				void queryClient.setQueryData<AvailabilityDay[] | undefined>(
					propertyAvailabilityQueryKey.all(propertyId),
					(previous) => {
						if (!previous) return [row];
						const next = previous.filter((item) => item.date !== row.date);
						next.push(row);
						return next;
					},
				);
			}
		},
	});
};
