import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import type { Property as PropertyDTO, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { prisma } from '@/lib/prisma';

const mapProperty = (property: {
	id: string;
	title: string;
	description: string | null;
	property_type: string;
	max_guests: number;
	bedrooms: number;
	beds: number;
	bathrooms: number;
	country: string;
	city: string;
	address: string;
	latitude: number;
	longitude: number;
	status: string;
	created_at: Date;
	updated_at: Date;
	user_id: string;
	images: Array<{
		id: string;
		property_id: string;
		url: string;
		is_cover: boolean;
		order: number;
	}>;
}): PropertyDTO => ({
	id: property.id,
	host_id: property.user_id,
	title: property.title,
	slug: property.title
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, ''),
	description: property.description ?? '',
	property_type: property.property_type,
	room_type: '',
	max_guests: property.max_guests,
	bedrooms: property.bedrooms,
	beds: property.beds,
	bathrooms: property.bathrooms,
	country: property.country,
	city: property.city,
	address: property.address,
	lat: property.latitude,
	lng: property.longitude,
	cleaning_fee: 0,
	status: property.status as PropertyDTO['status'],
	amenity_ids: [],
	created_at: property.created_at.toISOString(),
	updated_at: property.updated_at.toISOString(),
	images: property.images,
});

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
		include: { images: { orderBy: { order: 'asc' } } },
	});
	return Response.json(properties.map(mapProperty));
}

export async function POST(request: Request) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const body = (await request.json()) as UpsertPropertyInput;
	if (!body.title || body.max_guests <= 0) {
		return Response.json({ message: 'Invalid payload. Title and max_guests are required.' }, { status: 400 });
	}

	try {
		const created = await prisma.property.create({
			data: {
				title: body.title.trim(),
				description: body.description?.trim() || null,
				property_type: body.property_type.trim() || 'Property',
				max_guests: body.max_guests,
				bedrooms: body.bedrooms,
				beds: body.beds,
				bathrooms: body.bathrooms,
				country: body.country.trim(),
				city: body.city.trim(),
				address: body.address.trim(),
				latitude: body.lat ?? 0,
				longitude: body.lng ?? 0,
				status: body.status,
				user_id: hostId,
			},
			include: { images: { orderBy: { order: 'asc' } } },
		});

		return Response.json(mapProperty(created), { status: 201 });
	} catch (error) {
		return Response.json(
			{ message: error instanceof Error ? error.message : 'Could not create property.' },
			{ status: 500 },
		);
	}
}
