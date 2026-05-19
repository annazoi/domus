import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { prisma } from '@/lib/prisma';
import { servicesService } from '@/app/api/services/services.service';
import type { PropertyServiceInput } from '@/app/api/services/interfaces/services.interface';

interface ServicesPayload {
	services?: PropertyServiceInput[];
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const property = await prisma.property.findFirst({
		where: { id },
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

	let body: ServicesPayload;
	try {
		body = (await request.json()) as ServicesPayload;
	} catch {
		return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
	}

	const services = body.services ?? [];
	for (const item of services) {
		if (!item.name?.trim()) {
			return Response.json({ message: 'Each service needs a name.' }, { status: 400 });
		}
		if (typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price < 0) {
			return Response.json({ message: 'Each service needs a valid price.' }, { status: 400 });
		}
	}

	const result = await servicesService.syncForProperty(id, services);
	if (result.error === 'PROPERTY_NOT_FOUND') {
		return Response.json({ message: 'Property not found' }, { status: 404 });
	}
	if (result.error === 'SERVICE_IN_USE') {
		return Response.json(
			{ message: 'Cannot remove a service that is already booked.' },
			{ status: 409 },
		);
	}

	const updated = await servicesService.listByProperty(id);
	return Response.json(updated);
}
