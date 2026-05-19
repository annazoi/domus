import { DateTime } from 'luxon';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';

export type OverviewStats = {
	totalBookings: number;
	revenueThisMonth: number;
	occupancyRate: number;
	recentBookings: HostBookingDetail[];
};

export const formatOverviewCurrency = (amount: number) =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

export const formatOverviewPercent = (value: number) => `${value}%`;

export function computeOverviewStats(
	bookings: HostBookingDetail[],
	propertyCount: number,
): OverviewStats {
	const monthStart = DateTime.utc().startOf('month');
	const monthEnd = monthStart.endOf('month');
	const daysInMonth = monthEnd.day;

	const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled');

	let revenueThisMonth = 0;
	let bookedNightsThisMonth = 0;

	for (const booking of activeBookings) {
		const checkIn = DateTime.fromISO(booking.check_in_iso, { zone: 'utc' }).startOf('day');
		const checkOut = DateTime.fromISO(booking.check_out_iso, { zone: 'utc' }).startOf('day');

		if (checkIn >= monthStart && checkIn <= monthEnd) {
			revenueThisMonth += booking.total_price;
		}

		if (booking.status !== 'confirmed') {
			continue;
		}

		for (let day = checkIn; day < checkOut; day = day.plus({ days: 1 })) {
			if (day >= monthStart && day <= monthEnd) {
				bookedNightsThisMonth += 1;
			}
		}
	}

	const capacity = propertyCount * daysInMonth;
	const occupancyRate = capacity > 0 ? Math.round((bookedNightsThisMonth / capacity) * 100) : 0;

	return {
		totalBookings: activeBookings.length,
		revenueThisMonth,
		occupancyRate,
		recentBookings: bookings.slice(0, 5),
	};
}
