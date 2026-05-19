import { DateTime } from 'luxon';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';
import { formatOverviewCurrency } from './compute-overview-stats';

export type EarningsWeekBar = {
	label: string;
	revenue: number;
	revenueFormatted: string;
	heightPercent: number;
};

export type EarningsTransaction = {
	bookingId: string;
	id: string;
	guest: string;
	amount: string;
	date: string;
};

export type EarningsStats = {
	monthLabel: string;
	monthlyRevenue: number;
	monthlyRevenueFormatted: string;
	weeklyBars: EarningsWeekBar[];
	recentTransactions: EarningsTransaction[];
};

const formatTransactionDate = (iso: string) => DateTime.fromISO(iso, { zone: 'utc' }).toFormat('MMM d');

const formatBookingRef = (id: string) => id.slice(0, 8).toUpperCase();

export function computeEarningsStats(bookings: HostBookingDetail[]): EarningsStats {
	const monthStart = DateTime.utc().startOf('month');
	const monthEnd = monthStart.endOf('month');
	const daysInMonth = monthEnd.day;
	const weekCount = Math.ceil(daysInMonth / 7);

	const weeklyRevenue = Array.from({ length: weekCount }, () => 0);
	let monthlyRevenue = 0;

	const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled');

	for (const booking of activeBookings) {
		const checkIn = DateTime.fromISO(booking.check_in_iso, { zone: 'utc' }).startOf('day');

		if (checkIn >= monthStart && checkIn <= monthEnd) {
			monthlyRevenue += booking.total_price;
			const weekIndex = Math.min(Math.floor((checkIn.day - 1) / 7), weekCount - 1);
			weeklyRevenue[weekIndex] += booking.total_price;
		}
	}

	const maxWeekRevenue = Math.max(...weeklyRevenue, 0);
	const weeklyBars: EarningsWeekBar[] = weeklyRevenue.map((revenue, index) => ({
		label: `W${index + 1}`,
		revenue,
		revenueFormatted: formatOverviewCurrency(revenue),
		heightPercent: maxWeekRevenue > 0 ? Math.round((revenue / maxWeekRevenue) * 100) : 0,
	}));

	const recentTransactions: EarningsTransaction[] = [...activeBookings]
		.sort((a, b) => DateTime.fromISO(b.created_at).toMillis() - DateTime.fromISO(a.created_at).toMillis())
		.slice(0, 10)
		.map((booking) => ({
			bookingId: booking.id,
			id: formatBookingRef(booking.id),
			guest: booking.guest_name,
			amount: formatOverviewCurrency(booking.total_price),
			date: formatTransactionDate(booking.created_at),
		}));

	return {
		monthLabel: monthStart.toFormat('MMMM yyyy'),
		monthlyRevenue,
		monthlyRevenueFormatted: formatOverviewCurrency(monthlyRevenue),
		weeklyBars,
		recentTransactions,
	};
}
