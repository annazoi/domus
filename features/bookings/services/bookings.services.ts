import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { PaginatedResult } from '@/lib/pagination';
import type { Booking, GuestTripDetail, HostBookingDetail, UpdateHostBookingInput } from '../interfaces/booking.interface';

export type CreateBookingPayload = {
	property_id: string;
	check_in: string;
	check_out: string;
	guests: number;
	guest: {
		first_name: string;
		last_name: string;
		email: string;
		phone?: string;
	};
	services?: { service_id: string; quantity: number }[];
};

export type CreateBookingResponse = {
	success: boolean;
	booking_id: string;
	totalPrice: number;
};

export const listBookings = async () => {
	const response = await axiosInstance.get<HostBookingDetail[]>(ApiRoutes.bookings.listMine);
	return response.data;
};

export const BOOKINGS_SEARCH_MIN_LENGTH = 2;

export type ListBookingsPaginatedParams = {
	page: number;
	pageSize: number;
	customerId?: string;
	propertyId?: string;
	dateFrom?: string;
	dateTo?: string;
	search?: string;
	sort?: 'check_in' | 'created_at';
	excludeCancelled?: boolean;
};

export const listBookingsPaginated = async (params: ListBookingsPaginatedParams) => {
	const response = await axiosInstance.get<PaginatedResult<HostBookingDetail>>(
		ApiRoutes.bookings.listMinePaginated({
			page: params.page,
			limit: params.pageSize,
			customer_id: params.customerId,
			property_id: params.propertyId,
			date_from: params.dateFrom,
			date_to: params.dateTo,
			q: params.search,
			sort: params.sort,
			exclude_cancelled: params.excludeCancelled,
		}),
	);
	return response.data;
};

export const listMyTripsPaginated = async (page: number, pageSize: number) => {
	const response = await axiosInstance.get<PaginatedResult<Booking>>(
		ApiRoutes.bookings.listMyTripsPaginated(page, pageSize),
	);
	return response.data;
};

export const listMyTrips = async () => {
	const response = await axiosInstance.get<Booking[]>(ApiRoutes.bookings.listMyTrips);
	return response.data;
};

export const getMyTrip = async (id: string) => {
	const response = await axiosInstance.get<GuestTripDetail>(ApiRoutes.bookings.booking(id));
	return response.data;
};

export const createBooking = async (payload: CreateBookingPayload) => {
	const response = await axiosInstance.post<CreateBookingResponse>(ApiRoutes.bookings.create, payload);
	return response.data;
};

export const updateBooking = async (id: string, input: UpdateHostBookingInput) => {
	const response = await axiosInstance.patch<HostBookingDetail>(ApiRoutes.bookings.booking(id), input);
	return response.data;
};
