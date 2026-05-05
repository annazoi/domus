import { DateTime } from 'luxon';
import { prisma } from '@/lib/prisma';
import { toApiDate, toUtcDay } from '@/features/property-availability/utils/date';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const property = await prisma.property.findFirst({
		where: {
			OR: [{ id }, { slug: id }],
			isPublished: true,
		},
		select: { id: true },
	});

	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

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

	const [blockedRows, availableRows] = await Promise.all([
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
	]);

	const unavailableUnique = new Set<string>();
	for (const row of blockedRows) {
		unavailableUnique.add(toApiDate(row.date.toISOString()));
	}

	const availableUnique = new Set<string>();
	for (const row of availableRows) {
		availableUnique.add(toApiDate(row.date.toISOString()));
	}

	const unavailable_dates = [...unavailableUnique].sort();
	const available_dates = [...availableUnique].sort();

	return Response.json({ unavailable_dates, available_dates });
}
