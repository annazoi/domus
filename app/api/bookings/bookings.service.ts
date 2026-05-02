import { Reason } from '@prisma/client';
import { DateTime } from 'luxon';
import { prisma } from '@/lib/prisma';
import { eachDayInRange, toApiDate, toUtcDay } from '@/features/property-availability/utils/date';

type BookingView = {
	id: string;
	property_id: string;
	host_id: string;
	guest_name: string;
	start_date: string;
	end_date: string;
	status: 'confirmed';
	property_title: string;
};

const groupBookedDays = (rows: Array<{ id: string; date: Date; property_id: string; property: { user_id: string; title: string } }>) => {
	const result: BookingView[] = [];
	let active: BookingView | null = null;
	let previousDay: DateTime | null = null;

	for (const row of rows) {
		const day = DateTime.fromJSDate(row.date, { zone: 'utc' }).startOf('day');
		const dayLabel = toApiDate(day.toISO() ?? row.date.toISOString());
		const isSameGroup =
			active &&
			active.property_id === row.property_id &&
			previousDay &&
			day.diff(previousDay, 'days').days === 1;

		if (!isSameGroup) {
			active = {
				id: row.id,
				property_id: row.property_id,
				host_id: row.property.user_id,
				guest_name: 'Booked guest',
				start_date: dayLabel,
				end_date: dayLabel,
				status: 'confirmed',
				property_title: row.property.title,
			};
			result.push(active);
		} else if (active) {
			active.end_date = dayLabel;
		}

		previousDay = day;
	}

	return result;
};

export const bookingsService = {
	async listHostBookings(hostId: string) {
		const rows = await prisma.propertyAvailability.findMany({
			where: {
				property: { user_id: hostId },
				reason: Reason.BOOKED,
				is_available: false,
			},
			orderBy: [{ property_id: 'asc' }, { date: 'asc' }],
			select: {
				id: true,
				date: true,
				property_id: true,
				property: { select: { user_id: true, title: true } },
			},
		});

		return groupBookedDays(rows);
	},

	async createBookingBlock(input: {
		hostId: string;
		propertyId: string;
		startDate: string;
		endDate: string;
	}) {
		const { hostId, propertyId, startDate, endDate } = input;
		const property = await prisma.property.findFirst({
			where: { id: propertyId, user_id: hostId },
			select: { id: true, user_id: true, title: true },
		});
		if (!property) return null;

		const start = toUtcDay(startDate);
		const endInclusive = toUtcDay(endDate);
		if (!start.isValid || !endInclusive.isValid || endInclusive < start) {
			return { error: 'INVALID_DATE' as const };
		}

		const endExclusive = endInclusive.plus({ days: 1 });
		const days = eachDayInRange(start, endExclusive);
		const rows = await prisma.$transaction(
			days.map((day) =>
				prisma.propertyAvailability.upsert({
					where: {
						property_id_date: {
							property_id: propertyId,
							date: day.toJSDate(),
						},
					},
					update: {
						user_id: hostId,
						is_available: false,
						reason: Reason.BOOKED,
					},
					create: {
						property_id: propertyId,
						user_id: hostId,
						date: day.toJSDate(),
						price: 0,
						is_available: false,
						reason: Reason.BOOKED,
					},
				}),
			),
		);

		return {
			id: rows[0]?.id ?? crypto.randomUUID(),
			property_id: propertyId,
			host_id: property.user_id,
			guest_name: 'Booked guest',
			start_date: toApiDate(start.toISO() ?? startDate),
			end_date: toApiDate(endInclusive.toISO() ?? endDate),
			status: 'confirmed' as const,
			property_title: property.title,
		};
	},
};
