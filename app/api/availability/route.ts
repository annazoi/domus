import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { AvailabilityStatus, type AvailabilityStatus as AvailabilityStatusType } from '@/features/property-availability/interfaces/property-availability.interface';
import { toApiDate, toUtcDay } from '@/features/property-availability/utils/date';
import { propertyStore } from '@/store/property';

interface AvailabilityPayload {
	property_id: string;
	date: string;
	is_available: boolean;
	price?: number;
	reason?: AvailabilityStatusType | null;
}

export async function GET(request: Request) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const url = new URL(request.url);
	const property_id = url.searchParams.get('property_id');
	if (!property_id) return Response.json({ message: 'property_id is required' }, { status: 400 });

	const days = propertyStore.getAvailability(hostId, property_id);
	if (!days) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json(days);
}

export async function POST(request: Request) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const body = (await request.json()) as AvailabilityPayload;
	if (!body.property_id || !body.date) {
		return Response.json({ message: 'property_id and date are required' }, { status: 400 });
	}

	const normalizedDate = toUtcDay(body.date);
	if (!normalizedDate.isValid) {
		return Response.json({ message: 'Invalid date.' }, { status: 400 });
	}

	const result = propertyStore.upsertAvailability(
		hostId,
		body.property_id,
		toApiDate(normalizedDate),
		body.is_available,
		body.price ?? 0,
		body.reason ?? null,
	);

	if ('error' in result) {
		if (result.error === AvailabilityStatus.BOOKED) {
			return Response.json({ message: 'This date is already booked.' }, { status: 409 });
		}
		return Response.json({ message: 'Property not found' }, { status: 404 });
	}

	return Response.json(result.value);
}
