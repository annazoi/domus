import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { propertyStore } from '@/store/property';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const property = propertyStore.getProperty(hostId, id);
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json(property);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const body = (await request.json()) as UpsertPropertyInput;
	if (!body.title || body.pricePerNight <= 0 || body.guests <= 0) {
		return Response.json({ message: 'Invalid payload. Title, price and guests are required.' }, { status: 400 });
	}

	const property = propertyStore.updateProperty(hostId, id, body);
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json(property);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const deleted = propertyStore.deleteProperty(hostId, id);
	if (!deleted) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json({ success: true });
}
