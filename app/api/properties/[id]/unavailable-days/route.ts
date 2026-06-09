import { BookingStatus } from '@prisma/client';
import { DateTime } from 'luxon';
import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { eachDayInRange, toApiDate, toUtcDay } from '@/features/property-availability/utils/date';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const hostId = getHostIdFromRequest(request);

	const property = await prisma.property.findFirst({
		where: {
			OR: [{ id }, { slug: id }],
		},
		select: { id: true, user_id: true, isPublished: true },
	});

	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });
	if (!property.isPublished && property.user_id !== hostId) {
		return Response.json({ message: 'Property not found' }, { status: 404 });
	}

	const url = new URL(request.url);
	const startRaw = url.searchParams.get('start');
	const endRaw = url.searchParams.get('end');

	const rangeStart = startRaw ? toUtcDay(startRaw) : DateTime.utc().startOf('day');
	const rangeEndExclusive = endRaw
		? DateTime.fromISO(endRaw, { zone: 'utc' }).startOf('day')
		: rangeStart.plus({ days: 540 });

	if (!rangeStart.isValid || !rangeEndExclusive.isValid || rangeStart >= rangeEndExclusive) {
		return Response.json({ message: 'Invalid start or end.' }, { status: 400 });
	}

	const [blockedRows, availableRows, bookings] = await Promise.all([
		prisma.propertyAvailability.findMany({
			where: {
				property_id: property.id,
				is_available: false,
			},
			select: { date: true },
			orderBy: { date: 'asc' },
		}),
		prisma.propertyAvailability.findMany({
			where: {
				property_id: property.id,
				is_available: true,
				date: {
					gte: rangeStart.toJSDate(),
					lt: rangeEndExclusive.toJSDate(),
				},
			},
			select: { date: true },
			orderBy: { date: 'asc' },
		}),
		prisma.booking.findMany({
			where: {
				property_id: property.id,
				status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
				check_in: { lt: rangeEndExclusive.toJSDate() },
				check_out: { gt: rangeStart.toJSDate() },
			},
			select: { check_in: true, check_out: true },
		}),
	]);

	const unavailableUnique = new Set<string>();
	for (const row of blockedRows) {
		unavailableUnique.add(toApiDate(row.date.toISOString()));
	}

	const availableUnique = new Set<string>();
	for (const row of availableRows) {
		availableUnique.add(toApiDate(row.date.toISOString()));
	}

	for (const booking of bookings) {
		const checkIn = DateTime.fromJSDate(booking.check_in, { zone: 'utc' }).startOf('day');
		const checkOut = DateTime.fromJSDate(booking.check_out, { zone: 'utc' }).startOf('day');
		for (const day of eachDayInRange(checkIn, checkOut)) {
			const key = day.toFormat('yyyy-MM-dd');
			unavailableUnique.add(key);
			availableUnique.delete(key);
		}
	}

	const unavailable_dates = [...unavailableUnique].sort();
	const available_dates = [...availableUnique].sort();

	return Response.json({ unavailable_dates, available_dates });
}
