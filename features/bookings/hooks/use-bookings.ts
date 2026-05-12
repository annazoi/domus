import { useMutation, useQuery } from '@tanstack/react-query';
import {
	createBooking,
	listBookings,
	type CreateBookingPayload,
	type CreateBookingResponse,
} from '../services/bookings.services';

export const bookingsQueryKey = {
	all: ['bookings'] as const,
};

export const useBookings = () => {
	return useQuery({
		queryKey: bookingsQueryKey.all,
		queryFn: listBookings,
	});
};

export const useCreateBooking = () => {
	return useMutation<CreateBookingResponse, Error, CreateBookingPayload>({
		mutationFn: createBooking,
	});
};
