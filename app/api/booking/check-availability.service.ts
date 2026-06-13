import { BookingStatus } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
import { eachDayInRange } from '@/features/property-availability/utils/date';
import { prisma } from '@/lib/prisma';

export type CheckAvailabilityInternalParams = {
	property_id: string;
	check_in: Date;
	check_out: Date;
	guests: number;
	hostId?: string | null;
};

export type CheckAvailabilityInternalResult = {
	isAvailable: boolean;
	totalPrice: number | null;
};

export type CheckAvailabilityInternalResponse =
	| ({ kind: 'invalid_input' } & CheckAvailabilityInternalResult)
	| ({ kind: 'not_found' } & CheckAvailabilityInternalResult)
	| ({ kind: 'guests_exceed_capacity' } & CheckAvailabilityInternalResult)
	| ({
			kind: 'ok';
			propertyId: string;
			hostUserId: string;
	  } & CheckAvailabilityInternalResult);

type DbClient = Pick<PrismaClient, 'property' | 'propertyAvailability' | 'booking'>;

function toUtcDayFromJsDate(d: Date) {
	return DateTime.fromJSDate(d, { zone: 'utc' }).startOf('day');
}

export async function checkAvailabilityInternal(
	params: CheckAvailabilityInternalParams,
	db: DbClient = prisma,
): Promise<CheckAvailabilityInternalResponse> {
	const checkIn = toUtcDayFromJsDate(params.check_in);
	const checkOut = toUtcDayFromJsDate(params.check_out);
	const guests = params.guests;

	if (!checkIn.isValid || !checkOut.isValid || !Number.isInteger(guests) || guests <= 0) {
		return { kind: 'invalid_input', isAvailable: false, totalPrice: null };
	}
	if (checkIn >= checkOut) {
		return { kind: 'invalid_input', isAvailable: false, totalPrice: null };
	}

	const property = await db.property.findFirst({
		where: {
			OR: [{ id: params.property_id }, { slug: params.property_id }],
		},
		select: {
			id: true,
			max_guests: true,
			user_id: true,
			isPublished: true,
			minimum_advance_reservation_hours: true,
			minimum_rental_period_nights: true,
			maximum_rental_period_nights: true,
		},
	});

	if (!property) {
		return { kind: 'not_found', isAvailable: false, totalPrice: null };
	}
	if (!property.isPublished && property.user_id !== params.hostId) {
		return { kind: 'not_found', isAvailable: false, totalPrice: null };
	}

	if (guests > property.max_guests) {
		return {
			kind: 'guests_exceed_capacity',
			isAvailable: false,
			totalPrice: null,
		};
	}

	const nights = Math.trunc(checkOut.diff(checkIn, 'days').days);

	if (property.minimum_rental_period_nights !== null && nights < property.minimum_rental_period_nights) {
		return { kind: 'invalid_input', isAvailable: false, totalPrice: null };
	}

	if (property.maximum_rental_period_nights !== null && nights > property.maximum_rental_period_nights) {
		return { kind: 'invalid_input', isAvailable: false, totalPrice: null };
	}

	if (property.minimum_advance_reservation_hours !== null) {
		const hoursUntilCheckIn = checkIn.diff(DateTime.utc(), 'hours').hours;
		if (hoursUntilCheckIn < property.minimum_advance_reservation_hours) {
			return { kind: 'invalid_input', isAvailable: false, totalPrice: null };
		}
	}

	const overlappingBooking = await db.booking.findFirst({
		where: {
			property_id: property.id,
			status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
			AND: [{ check_in: { lt: checkOut.toJSDate() } }, { check_out: { gt: checkIn.toJSDate() } }],
		},
		select: { id: true },
	});

	if (overlappingBooking) {
		return {
			kind: 'ok',
			propertyId: property.id,
			hostUserId: property.user_id,
			isAvailable: false,
			totalPrice: null,
		};
	}

	const days = eachDayInRange(checkIn, checkOut);
	const rows = await db.propertyAvailability.findMany({
		where: {
			property_id: property.id,
			date: { gte: checkIn.toJSDate(), lt: checkOut.toJSDate() },
		},
		select: { date: true, is_available: true, price: true },
		orderBy: { date: 'asc' },
	});

	const byDate = new Map<string, { is_available: boolean; price: unknown }>();
	for (const row of rows) {
		const key = DateTime.fromJSDate(row.date, { zone: 'utc' }).toFormat('yyyy-MM-dd');
		byDate.set(key, { is_available: row.is_available, price: row.price });
	}

	let totalPrice = 0;
	for (const day of days) {
		const row = byDate.get(day.toFormat('yyyy-MM-dd'));
		if (!row || !row.is_available) {
			return {
				kind: 'ok',
				propertyId: property.id,
				hostUserId: property.user_id,
				isAvailable: false,
				totalPrice: null,
			};
		}
		totalPrice += Number(row.price);
	}

	const isAvailable = nights > 0;

	return {
		kind: 'ok',
		propertyId: property.id,
		hostUserId: property.user_id,
		isAvailable,
		totalPrice: isAvailable ? totalPrice : null,
	};
}
