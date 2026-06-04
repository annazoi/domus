import { PricingUnit } from '@prisma/client';
import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { servicesService } from '../services.service';
import type { ServiceInput } from '../interfaces/services.interface';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;

	let body: ServiceInput;
	try {
		body = (await request.json()) as ServiceInput;
	} catch {
		return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
	}

	if (!body.name?.trim()) {
		return Response.json({ message: 'Service name is required.' }, { status: 400 });
	}
	if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0) {
		return Response.json({ message: 'Service price must be a valid non-negative number.' }, { status: 400 });
	}
	if (body.pricing_unit !== undefined && !Object.values(PricingUnit).includes(body.pricing_unit)) {
		return Response.json({ message: 'Invalid pricing unit.' }, { status: 400 });
	}
	if (
		body.max_quantity !== undefined &&
		body.max_quantity !== null &&
		(!Number.isInteger(body.max_quantity) || body.max_quantity < 1)
	) {
		return Response.json({ message: 'max_quantity must be a positive integer.' }, { status: 400 });
	}
	if (
		body.quantitable_item &&
		(typeof body.max_quantity !== 'number' || !Number.isInteger(body.max_quantity) || body.max_quantity < 1)
	) {
		return Response.json(
			{ message: 'A max quantity of at least 1 is required for quantitable services.' },
			{ status: 400 },
		);
	}

	const service = await servicesService.updateForHost(hostId, id, body);
	if (!service) return Response.json({ message: 'Service not found' }, { status: 404 });

	return Response.json(service);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(_request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const result = await servicesService.deleteForHost(hostId, id);

	if (result.error === 'NOT_FOUND') {
		return Response.json({ message: 'Service not found' }, { status: 404 });
	}
	if (result.error === 'SERVICE_IN_USE') {
		return Response.json({ message: 'Cannot delete a service that is already booked.' }, { status: 409 });
	}

	return new Response(null, { status: 204 });
}
