import type { QueryClient } from '@tanstack/react-query';
import type { AvailabilityDay } from '@/features/property-availability/interfaces/property-availability.interface';
import { propertyAvailabilityQueryKey } from '@/features/property-availability/hooks/use-property-availability';

type MergeAvailabilityRowsParams = {
	queryClient: QueryClient;
	propertyId: string;
	start?: string;
	end?: string;
	rows: AvailabilityDay[];
};

export const mergeAvailabilityRowsInCache = ({
	queryClient,
	propertyId,
	start,
	end,
	rows,
}: MergeAvailabilityRowsParams) => {
	queryClient.setQueryData<AvailabilityDay[] | undefined>(
		propertyAvailabilityQueryKey.all(propertyId, start, end),
		(previous) => {
			const next = [...(previous ?? [])];
			for (const row of rows) {
				const existingIndex = next.findIndex((item) => item.date === row.date);
				if (existingIndex >= 0) next[existingIndex] = row;
				else next.push(row);
			}
			return next.sort((a, b) => a.date.localeCompare(b.date));
		},
	);
};
