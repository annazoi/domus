import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { propertyStore } from '@/store/property';

interface AmenitiesPayload {
	amenityIds: string[];
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const body = (await request.json()) as AmenitiesPayload;
	const updated = propertyStore.setAmenities(hostId, id, body.amenityIds ?? []);
	if (!updated) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json(updated);
}
