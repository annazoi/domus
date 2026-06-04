import axios from 'axios';
import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type {
	BookingQuoteRequest,
	BookingQuoteResponse,
} from '../interfaces/price-snapshot.interface';

export const getBookingQuote = async (payload: BookingQuoteRequest) => {
	try {
		const response = await axiosInstance.post<BookingQuoteResponse>(ApiRoutes.bookings.quote, payload);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const message = error.response?.data?.message;
			throw new Error(typeof message === 'string' ? message : 'Could not load price quote.');
		}
		throw error instanceof Error ? error : new Error('Could not load price quote.');
	}
};
