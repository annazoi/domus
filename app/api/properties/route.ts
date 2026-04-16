import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { propertyStore } from '@/store/property';
import { getHostIdFromRequest } from '@/app/api/_utils/auth';

export async function GET(request: Request) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const url = new URL(request.url);
	const hostFilter = url.searchParams.get('host_id');
	if (hostFilter && hostFilter !== 'me') {
		return Response.json({ message: 'Forbidden' }, { status: 403 });
	}

	const properties = propertyStore.getProperties(hostId);
	return Response.json(properties);
}

export async function POST(request: Request) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const body = (await request.json()) as UpsertPropertyInput;
	if (!body.title || body.pricePerNight <= 0 || body.guests <= 0) {
		return Response.json({ message: 'Invalid payload. Title, price and guests are required.' }, { status: 400 });
	}

	const created = propertyStore.createProperty(hostId, body);
	return Response.json(created, { status: 201 });
}
