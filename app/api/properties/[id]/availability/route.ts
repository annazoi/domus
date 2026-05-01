import { Reason } from '@prisma/client';
import { DateTime } from 'luxon';
import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { findHostProperty } from '@/app/api/_utils/property-host';
import { availabilityService } from './availability.service';
import { eachDayInRange, toUtcDay } from '@/features/property-availability/utils/date';

type AvailabilityUpdatePayload = {
	start?: string;
	end?: string;
	price?: number;
	is_available?: boolean;
	reason?: Reason | null;
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const property = await findHostProperty(id, hostId);
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	const now = DateTime.utc().startOf('day');
	const url = new URL(request.url);
	const start = availabilityService.parseDateParam(url.searchParams.get('start'), now.startOf('month'));
	const end = availabilityService.parseDateParam(
		url.searchParams.get('end'),
		now.endOf('month').startOf('day').plus({ days: 1 }),
	);
	if (!start || !end) return Response.json({ message: 'Invalid start or end date.' }, { status: 400 });
	if (start >= end) return Response.json({ message: 'start must be before end.' }, { status: 400 });

	const rows = await availabilityService.listByRange(id, start, end);
	return Response.json(availabilityService.toApiRows(rows));
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
	const rows = await availabilityService.upsertRange({
		propertyId: id,
		hostId,
		days,
		price,
		isAvailable,
		reason,
	});

	return Response.json({
		rows: availabilityService.toApiRows(rows),
	});
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const property = await findHostProperty(id, hostId);
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	const url = new URL(request.url);
	const startRaw = url.searchParams.get('start');
	const endRaw = url.searchParams.get('end');
	if (startRaw || endRaw) {
		if (!startRaw || !endRaw) {
			return Response.json({ message: 'start and end are required together.' }, { status: 400 });
		}
		const start = toUtcDay(startRaw);
		const end = toUtcDay(endRaw);
		if (!start.isValid || !end.isValid) {
			return Response.json({ message: 'Invalid start or end date.' }, { status: 400 });
		}
		if (start >= end) {
			return Response.json({ message: 'end must be after start.' }, { status: 400 });
		}
		const deleted = await availabilityService.clearByRange(id, start, end);
		return Response.json({ deleted: deleted.count });
	}

	const deleted = await availabilityService.clearByProperty(id);

	return Response.json({ deleted: deleted.count });
}
