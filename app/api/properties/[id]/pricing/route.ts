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
		isVisible?: boolean;
	};

	const updated = await prisma.property.update({
		where: { id },
		data: {
			...(body.isVisible !== undefined ? { isPublished: body.isVisible } : {}),
		},
		include: { images: { orderBy: { order: 'asc' }, include: { document: true } } },
	});

	return Response.json(mapProperty(updated));
}
