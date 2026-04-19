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
		cleaning_fee?: number;
		status?: string;
	};

	const cleaningRaw = body.cleaning_fee !== undefined ? Number(body.cleaning_fee) : existing.cleaning_fee;
	const cleaning_fee = Number.isFinite(cleaningRaw) ? Math.max(0, cleaningRaw) : existing.cleaning_fee;

	const updated = await prisma.property.update({
		where: { id },
		data: {
			cleaning_fee,
			...(body.status !== undefined ? { status: body.status } : {}),
		},
		include: { images: { orderBy: { order: 'asc' }, include: { document: true } } },
	});

	return Response.json(mapProperty(updated));
}
