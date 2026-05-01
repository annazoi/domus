import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { mapProperty } from '@/app/api/_utils/property-map';
import { hasPropertySlugConflict, slugifyPropertySlug } from '@/app/api/_utils/property-slug';
import { propertyService } from '@/app/api/properties/properties.service';
import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const property = await propertyService.findByHostAndId(hostId, id);
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json(mapProperty(property));
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const body = (await request.json()) as UpsertPropertyInput;
	if (!body.title?.trim()) {
		return Response.json({ message: 'Invalid payload. Title is required.' }, { status: 400 });
	}

	const existing = await propertyService.findByHostAndId(hostId, id);
	if (!existing) return Response.json({ message: 'Property not found' }, { status: 404 });

	const slug = slugifyPropertySlug(body.slug?.trim() ? body.slug : body.title);
	if (!slug) {
		return Response.json({ message: 'Slug is invalid.' }, { status: 400 });
	}
	const slugExists = await hasPropertySlugConflict({ slug, hostId, excludePropertyId: id });
	if (slugExists) {
		return Response.json({ message: 'Slug already exists for another property.' }, { status: 409 });
	}
	const property = await propertyService.update(id, body, slug);
	return Response.json(mapProperty(property));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const deleted = await propertyService.delete(hostId, id);
	if (!deleted.count) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json({ success: true });
}
