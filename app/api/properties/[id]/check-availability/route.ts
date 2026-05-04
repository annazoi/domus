import { DateTime } from 'luxon';
import { prisma } from '@/lib/prisma';
import { eachDayInRange, toUtcDay } from '@/features/property-availability/utils/date';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const url = new URL(request.url);
	const checkInRaw = url.searchParams.get('check_in');
	const checkOutRaw = url.searchParams.get('check_out');
	const guestsRaw = url.searchParams.get('guests');

	if (!checkInRaw || !checkOutRaw || !guestsRaw) {
		return Response.json({ message: 'check_in, check_out and guests are required.' }, { status: 400 });
	}

	const checkIn = toUtcDay(checkInRaw);
	const checkOut = toUtcDay(checkOutRaw);
	const guests = Number.parseInt(guestsRaw, 10);

	if (!checkIn.isValid || !checkOut.isValid || !Number.isInteger(guests) || guests <= 0) {
		return Response.json({ message: 'Invalid query params.' }, { status: 400 });
	}
	if (checkIn >= checkOut) {
		return Response.json({ message: 'check_in must be before check_out.' }, { status: 400 });
	}

	const property = await prisma.property.findFirst({
		where: {
			OR: [{ id }, { slug: id }],
			isPublished: true,
		},
		select: { id: true, max_guests: true },
	});

	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });
	if (guests > property.max_guests) {
		return Response.json({ message: 'Guests exceed max guests for this property.' }, { status: 400 });
	}

	const nights = Math.trunc(checkOut.diff(checkIn, 'days').days);
	const days = eachDayInRange(checkIn, checkOut);
	const rows = await prisma.propertyAvailability.findMany({
		where: {
			property_id: property.id,
			date: { gte: checkIn.toJSDate(), lt: checkOut.toJSDate() },
		},
		select: { date: true, is_available: true, price: true },
		orderBy: { date: 'asc' },
	});

	// Booking-safe default: every requested night must be explicitly available.
	const byDate = new Map<string, { is_available: boolean; price: unknown }>();
	for (const row of rows) {
		const k = DateTime.fromJSDate(row.date, { zone: 'utc' }).toFormat('yyyy-MM-dd');
		byDate.set(k, { is_available: row.is_available, price: row.price });
	}

	let totalPrice = 0;
	for (const day of days) {
		const row = byDate.get(day.toFormat('yyyy-MM-dd'));
		if (!row || !row.is_available) {
			return Response.json({ isAvailable: false, totalPrice: null });
		}
		totalPrice += Number(row.price);
	}

	return Response.json({
		isAvailable: nights > 0,
		totalPrice: nights > 0 ? totalPrice : null,
	});
}
