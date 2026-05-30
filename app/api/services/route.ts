import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { servicesService } from './services.service';
import type { ServiceInput } from './interfaces/services.interface';

export async function GET(request: Request) {
	const url = new URL(request.url);
	const hostIdParam = url.searchParams.get('host_id');
	const propertyId = url.searchParams.get('property_id')?.trim();

	if (hostIdParam === 'me') {
		const hostId = getHostIdFromRequest(request);
		if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

		try {
			const services = await servicesService.listByHost(hostId);
			return Response.json(services);
		} catch (error) {
			console.error('GET /api/services failed', error);
			return Response.json(
				{ message: error instanceof Error ? error.message : 'Could not load services.' },
				{ status: 500 },
			);
		}
	}

	if (propertyId) {
		const services = await servicesService.listByProperty(propertyId);
		return Response.json(services);
	}

	return Response.json({ message: 'property_id or host_id=me is required.' }, { status: 400 });
}

export async function POST(request: Request) {
	const url = new URL(request.url);
	if (url.searchParams.get('host_id') !== 'me') {
		return Response.json({ message: 'Forbidden' }, { status: 403 });
	}

	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

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

	try {
		const service = await servicesService.createForHost(hostId, body);
		return Response.json(service, { status: 201 });
	} catch (error) {
		console.error('POST /api/services failed', error);
		return Response.json(
			{ message: error instanceof Error ? error.message : 'Could not create service.' },
			{ status: 500 },
		);
	}
}
