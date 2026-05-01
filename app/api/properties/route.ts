import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { hasPropertySlugConflict, slugifyPropertySlug } from '@/app/api/_utils/property-slug';
import { mapProperty } from '@/app/api/_utils/property-map';
import { propertyService } from '@/app/api/properties/properties.service';
import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const url = new URL(request.url);
	const hostFilter = url.searchParams.get('host_id');
	if (hostFilter && hostFilter !== 'me') {
		return Response.json({ message: 'Forbidden' }, { status: 403 });
	}

	const properties = await propertyService.listByHost(hostId);
	return Response.json(properties.map(mapProperty));
}

export async function POST(request: Request) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });
	const host = await prisma.user.findUnique({ where: { id: hostId }, select: { id: true } });
	if (!host) return Response.json({ message: 'Invalid host session. Please sign in again.' }, { status: 401 });

	const body = (await request.json()) as UpsertPropertyInput;
	if (!body.title?.trim()) {
		return Response.json({ message: 'Title is required.' }, { status: 400 });
	}

	try {
		const slug = slugifyPropertySlug(body.slug?.trim() ? body.slug : body.title);
		if (!slug) {
			return Response.json({ message: 'Slug is invalid.' }, { status: 400 });
		}
		const slugExists = await hasPropertySlugConflict({ slug, hostId });
		if (slugExists) {
			return Response.json({ message: 'Slug already exists for another property.' }, { status: 409 });
		}
		const created = await propertyService.create(hostId, body, slug);

		return Response.json(mapProperty(created), { status: 201 });
	} catch (error) {
		console.error('POST /api/properties failed', error);
		return Response.json(
			{ message: error instanceof Error ? error.message : 'Could not create property.' },
			{ status: 500 },
		);
	}
}
