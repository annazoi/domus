import { servicesService } from './services.service';

export async function GET(request: Request) {
	const propertyId = new URL(request.url).searchParams.get('property_id')?.trim();
	if (!propertyId) {
		return Response.json({ message: 'property_id is required.' }, { status: 400 });
	}

	const services = await servicesService.listByProperty(propertyId);
	return Response.json(services);
}
