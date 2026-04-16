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
	images: [],
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const property = await prisma.property.findFirst({
		where: { id, ownerId: hostId },
	});
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json(mapProperty(property));
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const body = (await request.json()) as UpsertPropertyInput;
	if (!body.title || body.pricePerNight <= 0 || body.guests <= 0) {
		return Response.json({ message: 'Invalid payload. Title, price and guests are required.' }, { status: 400 });
	}

	const existing = await prisma.property.findFirst({
		where: { id, ownerId: hostId },
		select: { id: true },
	});
	if (!existing) return Response.json({ message: 'Property not found' }, { status: 404 });

	const property = await prisma.property.update({
		where: { id },
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
		},
	});
	return Response.json(mapProperty(property));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const deleted = await prisma.property.deleteMany({
		where: { id, ownerId: hostId },
	});
	if (!deleted.count) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json({ success: true });
}
