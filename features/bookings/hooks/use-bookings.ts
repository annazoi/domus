import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthHydrated, useAuthStore } from '@/store/auth';
import type { PaginatedResult } from '@/lib/pagination';
import {
	createBooking,
	getMyTrip,
	listBookings,
	listBookingsPaginated,
	listMyTrips,
	listMyTripsPaginated,
	updateBooking,
	type CreateBookingPayload,
	type CreateBookingResponse,
	type ListBookingsPaginatedParams,
} from '../services/bookings.services';
import type { Booking, GuestTripDetail, HostBookingDetail, UpdateHostBookingInput } from '../interfaces/booking.interface';

export const bookingsQueryKey = {
	all: ['bookings'] as const,
	hostPage: (params: ListBookingsPaginatedParams) =>
		[
			'bookings',
			'host',
			params.page,
			params.pageSize,
			params.customerId ?? '',
			params.propertyId ?? '',
			params.dateFrom ?? '',
			params.dateTo ?? '',
			params.search ?? '',
			params.sort ?? 'check_in',
			params.excludeCancelled ?? false,
		] as const,
	guestTrips: (userId: string) => ['bookings', 'guest', userId] as const,
	guestTripsPage: (userId: string, page: number, pageSize: number) =>
		['bookings', 'guest', userId, page, pageSize] as const,
	guestTrip: (id: string) => ['bookings', 'guest', 'detail', id] as const,
};

export const useBookings = () => {
	return useQuery<HostBookingDetail[]>({
		queryKey: bookingsQueryKey.all,
		queryFn: listBookings,
	});
};

export const useBookingsPage = (params: ListBookingsPaginatedParams) => {
	return useQuery<PaginatedResult<HostBookingDetail>>({
		queryKey: bookingsQueryKey.hostPage(params),
		queryFn: () => listBookingsPaginated(params),
	});
};

export const useCustomerBookingsPage = (customerId: string, page: number, pageSize: number) => {
	return useBookingsPage({ page, pageSize, customerId });
};

export const useEarningsTransactionsPage = (page: number, pageSize: number) => {
	return useBookingsPage({ page, pageSize, sort: 'created_at', excludeCancelled: true });
};

export const useGuestTrips = () => {
	const hydrated = useAuthHydrated();
	const userId = useAuthStore((state) => state.user_uuid);
	return useQuery({
		queryKey: userId ? bookingsQueryKey.guestTrips(userId) : ['bookings', 'guest'],
		queryFn: listMyTrips,
		enabled: hydrated && Boolean(userId),
	});
};

export const useGuestTripsPage = (page: number, pageSize: number) => {
	const hydrated = useAuthHydrated();
	const userId = useAuthStore((state) => state.user_uuid);
	return useQuery<PaginatedResult<Booking>>({
		queryKey: userId ? bookingsQueryKey.guestTripsPage(userId, page, pageSize) : ['bookings', 'guest', page, pageSize],
		queryFn: () => listMyTripsPaginated(page, pageSize),
		enabled: hydrated && Boolean(userId),
	});
};

export const useGuestTrip = (id: string | null) => {
	return useQuery<GuestTripDetail>({
		queryKey: id ? bookingsQueryKey.guestTrip(id) : ['bookings', 'guest', 'detail'],
		queryFn: () => getMyTrip(id!),
		enabled: Boolean(id),
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
