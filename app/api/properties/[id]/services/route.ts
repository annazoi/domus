import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { prisma } from '@/lib/prisma';
import { servicesService } from '@/app/api/services/services.service';
import type { PropertyServiceLinksInput } from '@/app/api/services/interfaces/services.interface';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const property = await prisma.property.findFirst({
		where: {
			OR: [{ id }, { slug: id }],
		},
		select: { id: true },
	});
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	const services = await servicesService.listByProperty(id);
	return Response.json(services);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const property = await prisma.property.findFirst({
		where: { id, user_id: hostId },
		select: { id: true },
	});
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	let body: PropertyServiceLinksInput;
	try {
		body = (await request.json()) as PropertyServiceLinksInput;
	} catch {
		return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
	}

	if (!Array.isArray(body.service_ids)) {
		return Response.json({ message: 'service_ids must be an array.' }, { status: 400 });
	}

	const result = await servicesService.syncPropertyLinks(id, hostId, body);
	if (result.error === 'PROPERTY_NOT_FOUND') {
		return Response.json({ message: 'Property not found' }, { status: 404 });
	}
	if (result.error === 'INVALID_SERVICE') {
		return Response.json({ message: 'One or more services are invalid.' }, { status: 400 });
	}
	if (result.error === 'SERVICE_IN_USE') {
		return Response.json(
			{ message: 'Cannot remove a service that is already booked for this property.' },
			{ status: 409 },
		);
	}

	const updated = await servicesService.listByProperty(id);
	return Response.json(updated);
}
