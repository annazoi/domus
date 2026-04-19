import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { prisma } from '@/lib/prisma';

interface AmenitiesPayload {
	amenity_ids: string[];
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const body = (await request.json()) as AmenitiesPayload;
	const property = await prisma.property.findFirst({
		where: { id, user_id: hostId },
		select: { id: true },
	});
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	return Response.json({
		success: true,
		property_id: id,
		amenity_ids: body.amenity_ids ?? [],
	});
}
