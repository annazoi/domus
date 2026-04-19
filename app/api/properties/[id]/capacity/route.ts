import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { findHostProperty } from '@/app/api/_utils/property-host';
import { mapProperty } from '@/app/api/_utils/property-map';
import { prisma } from '@/lib/prisma';

const intOr = (value: unknown, fallback: number) => {
	const n = Number(value);
	return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const existing = await findHostProperty(id, hostId);
	if (!existing) return Response.json({ message: 'Property not found' }, { status: 404 });

	const body = (await request.json()) as {
		max_guests?: number;
		bedrooms?: number;
		beds?: number;
		bathrooms?: number;
	};

	const maxGuests = intOr(body.max_guests, existing.max_guests);
	if (maxGuests < 1) {
		return Response.json({ message: 'max_guests must be at least 1.' }, { status: 400 });
	}

	const updated = await prisma.property.update({
		where: { id },
		data: {
			max_guests: maxGuests,
			bedrooms: Math.max(0, intOr(body.bedrooms, existing.bedrooms)),
			beds: Math.max(0, intOr(body.beds, existing.beds)),
			bathrooms: Math.max(0, intOr(body.bathrooms, existing.bathrooms)),
		},
		include: { images: { orderBy: { order: 'asc' } } },
	});

	return Response.json(mapProperty(updated));
}
