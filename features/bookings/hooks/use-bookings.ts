import { useQuery } from '@tanstack/react-query';
import { listBookings } from '../services/bookings.services';

export const bookingsQueryKey = {
	all: ['bookings'] as const,
};

export const useBookings = () => {
	return useQuery({
		queryKey: bookingsQueryKey.all,
		queryFn: listBookings,
	});
};
