import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { findHostProperty } from '@/app/api/_utils/property-host';
import { mapProperty } from '@/app/api/_utils/property-map';
import { hasPropertySlugConflict, slugifyPropertySlug } from '@/app/api/_utils/property-slug';
import { parseTimeToUtcDate } from '@/app/api/_utils/time-of-day';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const existing = await findHostProperty(id, hostId);
	if (!existing) return Response.json({ message: 'Property not found' }, { status: 404 });

	const body = (await request.json()) as {
		title?: string;
		slug?: string;
		description?: string;
		short_description?: string;
		property_type?: string;
		isVisible?: boolean;
		check_in_time?: string;
		check_out_time?: string;
	};

	if (!body.title?.trim()) {
		return Response.json({ message: 'Title is required.' }, { status: 400 });
	}

	const slug = slugifyPropertySlug(body.slug?.trim() ? body.slug : body.title);
	if (!slug) {
		return Response.json({ message: 'Slug is invalid.' }, { status: 400 });
	}
	const slugExists = await hasPropertySlugConflict({ slug, hostId, excludePropertyId: id });
	if (slugExists) {
		return Response.json({ message: 'Slug already exists for another property.' }, { status: 409 });
	}

	const updated = await prisma.property.update({
		where: { id },
		data: {
			title: body.title.trim(),
			slug,
			description: body.description?.trim() || null,
			short_description: body.short_description?.trim() || null,
			property_type: body.property_type?.trim() || existing.property_type,
			isPublished: body.isVisible ?? existing.isPublished,
			check_in_time: parseTimeToUtcDate(body.check_in_time, '15:00'),
			check_out_time: parseTimeToUtcDate(body.check_out_time, '11:00'),
		},
		include: { images: { orderBy: { order: 'asc' }, include: { document: true } } },
	});

	return Response.json(mapProperty(updated));
}
