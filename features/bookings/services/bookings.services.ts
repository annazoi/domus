import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { Booking } from '../interfaces/booking.interface';

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
};

export type CreateBookingResponse = {
	success: boolean;
	booking_id: string;
	totalPrice: number;
};

export const listBookings = async () => {
	const response = await axiosInstance.get<(Booking & { property_title: string })[]>(ApiRoutes.bookings.listMine);
	return response.data;
};

export const createBooking = async (payload: CreateBookingPayload) => {
	const response = await axiosInstance.post<CreateBookingResponse>(ApiRoutes.bookings.create, payload);
	return response.data;
};
