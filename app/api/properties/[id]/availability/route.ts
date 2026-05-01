import { Reason } from '@prisma/client';
import { DateTime } from 'luxon';
import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { findHostProperty } from '@/app/api/_utils/property-host';
import { prisma } from '@/lib/prisma';
import { eachDayInRange, toApiDate, toUtcDay } from '@/features/property-availability/utils/date';

type AvailabilityUpdatePayload = {
	start?: string;
	end?: string;
	price?: number;
	is_available?: boolean;
	reason?: Reason | null;
};

const parseDateParam = (value: string | null, fallback: DateTime) => {
	if (!value) return fallback;
	const parsed = DateTime.fromISO(value, { zone: 'utc' }).startOf('day');
	return parsed.isValid ? parsed : null;
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const property = await findHostProperty(id, hostId);
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	const now = DateTime.utc().startOf('day');
	const url = new URL(request.url);
	const start = parseDateParam(url.searchParams.get('start'), now.startOf('month'));
	const end = parseDateParam(url.searchParams.get('end'), now.endOf('month').startOf('day').plus({ days: 1 }));
	if (!start || !end) return Response.json({ message: 'Invalid start or end date.' }, { status: 400 });
	if (start >= end) return Response.json({ message: 'start must be before end.' }, { status: 400 });

	const rows = await prisma.propertyAvailability.findMany({
		where: {
			property_id: id,
			date: {
				gte: start.toJSDate(),
				lt: end.toJSDate(),
			},
		},
		orderBy: { date: 'asc' },
	});

	return Response.json(
		rows.map((row) => ({
			id: row.id,
			property_id: row.property_id,
			date: toApiDate(row.date.toISOString()),
			price: Number(row.price),
			is_available: row.is_available,
			reason: row.reason,
		})),
	);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const property = await findHostProperty(id, hostId);
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	const body = (await request.json()) as AvailabilityUpdatePayload;
	if (!body.start || !body.end) {
		return Response.json({ message: 'start and end are required.' }, { status: 400 });
	}

	if (typeof body.price !== 'number' || Number.isNaN(body.price) || body.price < 0) {
		return Response.json({ message: 'price must be a non-negative number.' }, { status: 400 });
	}
	const price = body.price;

	if (typeof body.is_available !== 'boolean') {
		return Response.json({ message: 'is_available must be boolean.' }, { status: 400 });
	}
	const isAvailable = body.is_available;

	const start = toUtcDay(body.start);
	const end = toUtcDay(body.end);
	if (!start.isValid || !end.isValid) {
		return Response.json({ message: 'Invalid start or end date.' }, { status: 400 });
	}
	if (start >= end) {
		return Response.json({ message: 'end must be after start.' }, { status: 400 });
	}

	const reason = body.reason ?? null;
	if (reason && !Object.values(Reason).includes(reason)) {
		return Response.json({ message: 'Invalid reason.' }, { status: 400 });
	}

	const days = eachDayInRange(start, end);
	const rows = await prisma.$transaction(
		days.map((day) =>
			prisma.propertyAvailability.upsert({
				where: {
					property_id_date: {
						property_id: id,
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
					property_id: id,
					user_id: hostId,
					date: day.toJSDate(),
					price,
					is_available: isAvailable,
					reason,
				},
			}),
		),
	);

	return Response.json({
		rows: rows.map((row) => ({
			id: row.id,
			property_id: row.property_id,
			date: toApiDate(row.date.toISOString()),
			price: Number(row.price),
			is_available: row.is_available,
			reason: row.reason,
		})),
	});
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const property = await findHostProperty(id, hostId);
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	const deleted = await prisma.propertyAvailability.deleteMany({
		where: {
			property_id: id,
		},
	});

	return Response.json({ deleted: deleted.count });
}
