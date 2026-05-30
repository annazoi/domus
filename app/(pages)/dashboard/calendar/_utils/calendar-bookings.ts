import { DateTime } from 'luxon';
import { BookingStatus } from '@/features/bookings/interfaces/booking-status';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';
import { eachDayInRange, toApiDate } from '@/features/property-availability/utils/date';

export function bookingCoversDate(booking: HostBookingDetail, date: string) {
	const day = DateTime.fromISO(date, { zone: 'utc' }).startOf('day');
	const checkIn = DateTime.fromISO(booking.start_date, { zone: 'utc' }).startOf('day');
	const checkOut = DateTime.fromISO(booking.end_date, { zone: 'utc' }).startOf('day');
	return day >= checkIn && day < checkOut;
}

export function bookingsForDate(bookings: HostBookingDetail[], date: string) {
	return bookings.filter((booking) => bookingCoversDate(booking, date));
}

export function buildBookingsByDate(bookings: HostBookingDetail[]) {
	const map = new Map<string, HostBookingDetail[]>();

	for (const booking of bookings) {
		for (const night of eachDayInRange(booking.start_date, booking.end_date)) {
			const date = toApiDate(night);
			const existing = map.get(date) ?? [];
			existing.push(booking);
			map.set(date, existing);
		}
	}

	return map;
}

export function activeBookingsForDate(bookings: HostBookingDetail[], date: string) {
	return bookingsForDate(bookings, date).filter((booking) => booking.status !== BookingStatus.CANCELLED);
}

export function hasActiveBookings(bookings: HostBookingDetail[], date: string) {
	return activeBookingsForDate(bookings, date).length > 0;
}
