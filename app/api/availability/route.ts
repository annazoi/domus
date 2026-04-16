import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { propertyStore } from '@/store/property';

interface AvailabilityPayload {
	propertyId: string;
	date: string;
	isAvailable: boolean;
	customPrice: number | null;
}

export async function GET(request: Request) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const url = new URL(request.url);
	const propertyId = url.searchParams.get('property_id');
	if (!propertyId) return Response.json({ message: 'property_id is required' }, { status: 400 });

	const days = propertyStore.getAvailability(hostId, propertyId);
	if (!days) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json(days);
}

export async function POST(request: Request) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const body = (await request.json()) as AvailabilityPayload;
	const result = propertyStore.upsertAvailability(
		hostId,
		body.propertyId,
		body.date,
		body.isAvailable,
		body.customPrice ?? null,
	);

	if ('error' in result) {
		if (result.error === 'BOOKED') return Response.json({ message: 'This date is already booked.' }, { status: 409 });
		return Response.json({ message: 'Property not found' }, { status: 404 });
	}

	return Response.json(result.value);
}
