import { useQuery } from '@tanstack/react-query';
import { getBookingQuote } from '../services/booking-quote.service';
import type { BookingQuoteRequest } from '../interfaces/price-snapshot.interface';

const serializeServices = (request: BookingQuoteRequest) => {
	const fromServices = (request.services ?? []).map((line) => `${line.service_id}:${line.quantity}`);
	const fromIds = (request.extra_service_ids ?? []).map((id) => `${id}:1`);
	return [...fromServices, ...fromIds].sort().join(',');
};

export const bookingQuoteKey = (request: BookingQuoteRequest) =>
	[
		'booking-quote',
		request.property_id,
		request.check_in,
		request.check_out,
		request.guests,
		serializeServices(request),
	] as const;

export const useBookingQuote = (request: BookingQuoteRequest, enabled: boolean) => {
	return useQuery({
		queryKey: bookingQuoteKey(request),
		queryFn: () => getBookingQuote(request),
		enabled,
		staleTime: 30_000,
	});
};
