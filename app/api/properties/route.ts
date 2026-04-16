import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import type { Property as PropertyDTO, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { prisma } from '@/lib/prisma';

const mapProperty = (property: {
	id: string;
	title: string;
	description: string | null;
	propertyType: string;
	maxGuests: number;
	bedrooms: number;
	beds: number;
	bathrooms: number;
	pricePerNight: { toNumber(): number };
	country: string;
	city: string;
	address: string;
	latitude: number;
	longitude: number;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	ownerId: string;
	images: Array<{
		id: string;
		propertyId: string;
		url: string;
		isCover: boolean;
		order: number;
	}>;
}): PropertyDTO => ({
	id: property.id,
	hostId: property.ownerId,
	title: property.title,
	slug: property.title
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, ''),
	description: property.description ?? '',
	propertyType: property.propertyType,
	roomType: '',
	guests: property.maxGuests,
	bedrooms: property.bedrooms,
	beds: property.beds,
	bathrooms: property.bathrooms,
	country: property.country,
	city: property.city,
	address: property.address,
	lat: property.latitude,
	lng: property.longitude,
	pricePerNight: property.pricePerNight.toNumber(),
	cleaningFee: 0,
	status: property.status as PropertyDTO['status'],
	amenityIds: [],
	createdAt: property.createdAt.toISOString(),
	updatedAt: property.updatedAt.toISOString(),
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
		where: { ownerId: hostId },
		orderBy: { createdAt: 'desc' },
		include: { images: { orderBy: { order: 'asc' } } },
	});
	return Response.json(properties.map(mapProperty));
}

export async function POST(request: Request) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const body = (await request.json()) as UpsertPropertyInput;
	if (!body.title || body.pricePerNight <= 0 || body.guests <= 0) {
		return Response.json({ message: 'Invalid payload. Title, price and guests are required.' }, { status: 400 });
	}

	try {
		const created = await prisma.property.create({
			data: {
				title: body.title.trim(),
				description: body.description?.trim() || null,
				propertyType: body.propertyType.trim() || 'Property',
				maxGuests: body.guests,
				bedrooms: body.bedrooms,
				beds: body.beds,
				bathrooms: body.bathrooms,
				pricePerNight: body.pricePerNight,
				country: body.country.trim(),
				city: body.city.trim(),
				address: body.address.trim(),
				latitude: body.lat ?? 0,
				longitude: body.lng ?? 0,
				status: body.status,
				ownerId: hostId,
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
