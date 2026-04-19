import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { findHostProperty } from '@/app/api/_utils/property-host';
import { mapProperty } from '@/app/api/_utils/property-map';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const existing = await findHostProperty(id, hostId);
	if (!existing) return Response.json({ message: 'Property not found' }, { status: 404 });

	const body = (await request.json()) as {
		country?: string;
		city?: string;
		address?: string;
		lat?: number | null;
		lng?: number | null;
	};

	const lat = body.lat === undefined ? existing.latitude : (body.lat ?? 0);
	const lng = body.lng === undefined ? existing.longitude : (body.lng ?? 0);

	const updated = await prisma.property.update({
		where: { id },
		data: {
			country: body.country !== undefined ? body.country.trim() : existing.country,
			city: body.city !== undefined ? body.city.trim() : existing.city,
			address: body.address !== undefined ? body.address.trim() : existing.address,
			latitude: typeof lat === 'number' && Number.isFinite(lat) ? lat : 0,
			longitude: typeof lng === 'number' && Number.isFinite(lng) ? lng : 0,
		},
		include: { images: { orderBy: { order: 'asc' } } },
	});

	return Response.json(mapProperty(updated));
}
