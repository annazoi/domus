import { Reason } from '@prisma/client';
import { DateTime } from 'luxon';
import { prisma } from '@/lib/prisma';
import { toApiDate } from '@/features/property-availability/utils/date';

type AvailabilityRow = {
	id: string;
	property_id: string;
	date: string;
	price: number;
	is_available: boolean;
	reason: Reason | null;
};

const mapAvailabilityRow = (row: {
	id: string;
	property_id: string;
	date: Date;
	price: unknown;
	is_available: boolean;
	reason: Reason | null;
}): AvailabilityRow => ({
	id: row.id,
	property_id: row.property_id,
	date: toApiDate(row.date.toISOString()),
	price: Number(row.price),
	is_available: row.is_available,
	reason: row.reason,
});

export const availabilityService = {
	parseDateParam(value: string | null, fallback: DateTime) {
		if (!value) return fallback;
		const parsed = DateTime.fromISO(value, { zone: 'utc' }).startOf('day');
		return parsed.isValid ? parsed : null;
	},

	listByRange(propertyId: string, start: DateTime, end: DateTime) {
		return prisma.propertyAvailability.findMany({
			where: {
				property_id: propertyId,
				date: {
					gte: start.toJSDate(),
					lt: end.toJSDate(),
				},
			},
			orderBy: { date: 'asc' },
		});
	},

	upsertRange(input: {
		propertyId: string;
		hostId: string;
		days: DateTime[];
		price: number;
		isAvailable: boolean;
		reason: Reason | null;
	}) {
		const { propertyId, hostId, days, price, isAvailable, reason } = input;
		return prisma.$transaction(
			days.map((day) =>
				prisma.propertyAvailability.upsert({
					where: {
						property_id_date: {
							property_id: propertyId,
							date: day.toJSDate(),
						},
					},
					update: {
						price,
						is_available: isAvailable,
						reason,
						user_id: hostId,
					},
					create: {
						property_id: propertyId,
						user_id: hostId,
						date: day.toJSDate(),
						price,
						is_available: isAvailable,
						reason,
					},
				}),
			),
		);
	},

	clearByProperty(propertyId: string) {
		return prisma.propertyAvailability.deleteMany({
			where: { property_id: propertyId },
		});
	},

	clearByRange(propertyId: string, start: DateTime, end: DateTime) {
		return prisma.propertyAvailability.deleteMany({
			where: {
				property_id: propertyId,
				date: {
					gte: start.toJSDate(),
					lt: end.toJSDate(),
				},
			},
		});
	},

	toApiRows(rows: Array<{ id: string; property_id: string; date: Date; price: unknown; is_available: boolean; reason: Reason | null }>) {
		return rows.map(mapAvailabilityRow);
	},
};
