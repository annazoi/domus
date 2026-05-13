import { useMutation, useQuery } from '@tanstack/react-query';
import {
	createBooking,
	listBookings,
	listMyTrips,
	type CreateBookingPayload,
	type CreateBookingResponse,
} from '../services/bookings.services';
import type { HostBookingDetail } from '../interfaces/booking.interface';

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
