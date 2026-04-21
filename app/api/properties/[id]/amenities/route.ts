import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { mapProperty } from '@/app/api/_utils/property-map';
import { prisma } from '@/lib/prisma';

interface AmenityItem {
	value: string;
	description?: string | null;
}

interface AmenitiesPayload {
	amenities?: AmenityItem[];
	/** @deprecated use `amenities` */
	amenity_ids?: string[];
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const body = (await request.json()) as AmenitiesPayload;

	const property = await prisma.property.findFirst({
		where: { id, user_id: hostId },
		select: { id: true },
	});
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	let items: AmenityItem[] = [];
	if (body.amenities?.length) {
		items = body.amenities;
	} else if (body.amenity_ids?.length) {
		items = body.amenity_ids.map((value) => ({ value, description: null }));
	}

	const mergedByValue = new Map<string, AmenityItem>();
	for (const item of items) {
		const value = item.value.trim();
		if (!value) continue;
		mergedByValue.set(value, { value, description: item.description ?? null });
	}
	const deduped = [...mergedByValue.values()];
	const values = deduped.map((i) => i.value);

	await prisma.$transaction(async (tx) => {
		if (!deduped.length) {
			await tx.propertyAmenity.deleteMany({ where: { property_id: id } });
			return;
		}

		await tx.propertyAmenity.deleteMany({
			where: {
				property_id: id,
				value: { notIn: values },
			},
		});

		for (const item of deduped) {
			const description = item.description?.trim() || null;
			const existing = await tx.propertyAmenity.findFirst({
				where: { property_id: id, value: item.value },
			});
			if (existing) {
				await tx.propertyAmenity.update({
					where: { id: existing.id },
					data: { description },
				});
			} else {
				await tx.propertyAmenity.create({
					data: {
						property_id: id,
						value: item.value,
						description,
					},
				});
			}
		}
	});

	const updated = await prisma.property.findFirst({
		where: { id },
		include: {
			images: { orderBy: { order: 'asc' }, include: { document: true } },
			amenities: { select: { value: true, description: true } },
		},
	});
	if (!updated) return Response.json({ message: 'Property not found' }, { status: 404 });

	return Response.json(mapProperty(updated));
}
