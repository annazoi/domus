import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createBooking,
	listBookings,
	listMyTrips,
	updateBooking,
	type CreateBookingPayload,
	type CreateBookingResponse,
} from '../services/bookings.services';
import type { HostBookingDetail, UpdateHostBookingInput } from '../interfaces/booking.interface';

export const bookingsQueryKey = {
	all: ['bookings'] as const,
	guestTrips: ['bookings', 'guest'] as const,
};

export const useBookings = () => {
	return useQuery<HostBookingDetail[]>({
		queryKey: bookingsQueryKey.all,
		queryFn: listBookings,
	});
};

export const useGuestTrips = () => {
	return useQuery({
		queryKey: bookingsQueryKey.guestTrips,
		queryFn: listMyTrips,
	});
};

export const useCreateBooking = () => {
	return useMutation<CreateBookingResponse, Error, CreateBookingPayload>({
		mutationFn: createBooking,
	});
};

export const useUpdateBooking = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateHostBookingInput }) => updateBooking(id, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: bookingsQueryKey.all });
			void queryClient.invalidateQueries({ queryKey: ['host-customers'] });
		},
	});
};
