import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { hasPropertySlugConflict, slugifyPropertySlug } from '@/app/api/_utils/property-slug';
import { mapProperty } from '@/app/api/_utils/property-map';
import { parseTimeToUtcDate } from '@/app/api/_utils/time-of-day';
import { RoomTypes } from '@/config/constants/dropdowns/room-type.options';
import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { prisma } from '@/lib/prisma';

const intOr = (value: unknown, fallback: number) => {
	const n = Number(value);
	return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

export async function GET(request: Request) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const url = new URL(request.url);
	const hostFilter = url.searchParams.get('host_id');
	if (hostFilter && hostFilter !== 'me') {
		return Response.json({ message: 'Forbidden' }, { status: 403 });
	}

	const properties = await prisma.property.findMany({
		where: { user_id: hostId },
		orderBy: { created_at: 'desc' },
		include: {
			images: { orderBy: { order: 'asc' }, include: { document: true } },
			amenities: {
				select: {
					value: true,
					description: true,
					documents: { orderBy: { created_at: 'desc' }, take: 1 },
				},
			},
		},
	});
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

	const maxGuests = Math.max(1, intOr(body.max_guests, 1));

	try {
		const slug = slugifyPropertySlug(body.slug?.trim() ? body.slug : body.title);
		if (!slug) {
			return Response.json({ message: 'Slug is invalid.' }, { status: 400 });
		}
		const slugExists = await hasPropertySlugConflict({ slug, hostId });
		if (slugExists) {
			return Response.json({ message: 'Slug already exists for another property.' }, { status: 409 });
		}
		const check_in_time = parseTimeToUtcDate(body.check_in_time, '15:00');
		const check_out_time = parseTimeToUtcDate(body.check_out_time, '11:00');

		const created = await prisma.property.create({
			data: {
				title: body.title.trim(),
				slug,
				description: body.description?.trim() || null,
				short_description: body.short_description?.trim() || null,
				property_type: (body.property_type ?? '').trim() || 'property',
				room_type: (body.room_type ?? '').trim() || RoomTypes.ENTIRE_PLACE,
				check_in_time,
				check_out_time,
				max_guests: maxGuests,
				bedrooms: Math.max(0, intOr(body.bedrooms, 1)),
				beds: Math.max(0, intOr(body.beds, 1)),
				bathrooms: Math.max(0, intOr(body.bathrooms, 1)),
				country: (body.country ?? '').trim(),
				city: (body.city ?? '').trim(),
				address: (body.address ?? '').trim(),
				latitude: body.lat ?? 0,
				longitude: body.lng ?? 0,
				isPublished: body.isVisible ?? false,
				user_id: hostId,
			},
			include: {
				images: { orderBy: { order: 'asc' }, include: { document: true } },
				amenities: {
					select: {
						value: true,
						description: true,
						documents: { orderBy: { created_at: 'desc' }, take: 1 },
					},
				},
			},
		});

		return Response.json(mapProperty(created), { status: 201 });
	} catch (error) {
		console.error('POST /api/properties failed', error);
		return Response.json(
			{ message: error instanceof Error ? error.message : 'Could not create property.' },
			{ status: 500 },
		);
	}
}
