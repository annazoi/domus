import axiosInstance from '@/config/api/axios';
import type { Booking } from '../interfaces/booking.interface';

export const listBookings = async () => {
	const response = await axiosInstance.get<(Booking & { property_title: string })[]>('/bookings?host_id=me');
	return response.data;
};
