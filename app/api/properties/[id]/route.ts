import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { mapProperty } from '@/app/api/_utils/property-map';
import { uniquePropertySlug } from '@/app/api/_utils/property-slug';
import { parseTimeToUtcDate } from '@/app/api/_utils/time-of-day';
import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { prisma } from '@/lib/prisma';

const intOr = (value: unknown, fallback: number) => {
	const n = Number(value);
	return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const property = await prisma.property.findFirst({
		where: { id, user_id: hostId },
		include: { images: { orderBy: { order: 'asc' } } },
	});
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

	const maxGuests = Math.max(1, intOr(body.max_guests, 1));

	const existing = await prisma.property.findFirst({
		where: { id, user_id: hostId },
		select: { id: true },
	});
	if (!existing) return Response.json({ message: 'Property not found' }, { status: 404 });

	const slug = await uniquePropertySlug(body.slug?.trim() ? body.slug : body.title, id);
	const cleaningRaw = Number(body.cleaning_fee);
	const cleaning_fee = Number.isFinite(cleaningRaw) ? Math.max(0, cleaningRaw) : 0;
	const check_in_time = parseTimeToUtcDate(body.check_in_time, '15:00');
	const check_out_time = parseTimeToUtcDate(body.check_out_time, '11:00');

	const property = await prisma.property.update({
		where: { id },
		data: {
			title: body.title.trim(),
			slug,
			description: body.description?.trim() || null,
			short_description: body.short_description?.trim() || null,
			property_type: (body.property_type ?? '').trim() || 'property',
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
			cleaning_fee,
			status: body.status ?? 'draft',
		},
		include: { images: { orderBy: { order: 'asc' } } },
	});
	return Response.json(mapProperty(property));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const deleted = await prisma.property.deleteMany({
		where: { id, user_id: hostId },
	});
	if (!deleted.count) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json({ success: true });
}
