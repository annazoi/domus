import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { mapProperty } from '@/app/api/_utils/property-map';
import { uploadFiles } from '@/app/api/services/cloudinary/cloudinary.service';
import { buildImageDocumentCreateInput } from '@/app/api/services/documents/documents.service';
import { prisma } from '@/lib/prisma';

interface AmenityItem {
	value: string;
	description?: string | null;
}

interface AmenitiesPayload {
	amenities?: AmenityItem[];
	/** @deprecated use `amenities` */
	amenity_ids?: string[];
	clear_image_values?: string[];
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const contentType = request.headers.get('content-type') ?? '';
	let body: AmenitiesPayload = {};
	let imageFilesByValue = new Map<string, File>();

	if (contentType.includes('multipart/form-data')) {
		const formData = await request.formData();
		const rawAmenities = formData.get('amenities');
		if (typeof rawAmenities === 'string' && rawAmenities.trim()) {
			try {
				body.amenities = JSON.parse(rawAmenities) as AmenityItem[];
			} catch {
				body.amenities = [];
			}
		}
		const rawClearValues = formData.get('clear_image_values');
		if (typeof rawClearValues === 'string' && rawClearValues.trim()) {
			try {
				body.clear_image_values = JSON.parse(rawClearValues) as string[];
			} catch {
				body.clear_image_values = [];
			}
		}

		const imageValuesRaw = formData.get('image_values');
		let imageValues: string[] = [];
		if (typeof imageValuesRaw === 'string' && imageValuesRaw.trim()) {
			try {
				imageValues = (JSON.parse(imageValuesRaw) as unknown[]).filter(
					(v): v is string => typeof v === 'string',
				);
			} catch {
				imageValues = [];
			}
		}
		const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);
		files.forEach((file, index) => {
			const value = imageValues[index]?.trim();
			if (value) imageFilesByValue.set(value, file);
		});
	} else {
		body = (await request.json()) as AmenitiesPayload;
	}

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
	const clearImageValues = new Set((body.clear_image_values ?? []).map((v) => v.trim()).filter(Boolean));

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

	const amenitiesByValue = await prisma.propertyAmenity.findMany({
		where: { property_id: id },
		select: { id: true, value: true },
	});
	const amenityIdByValue = new Map(amenitiesByValue.map((item) => [item.value, item.id]));

	const clearAmenityIds = [...clearImageValues]
		.map((value) => amenityIdByValue.get(value))
		.filter((v): v is string => Boolean(v));

	if (clearAmenityIds.length) {
		await prisma.document.deleteMany({
			where: { user_id: hostId, property_amenity_id: { in: clearAmenityIds } },
		});
	}

	if (imageFilesByValue.size) {
		const imageEntries = [...imageFilesByValue.entries()].filter(([value]) => amenityIdByValue.has(value));
		if (imageEntries.length) {
			const uploaded = await uploadFiles(imageEntries.map(([, file]) => file));
			await prisma.$transaction(async (tx) => {
				for (const [index, [value]] of imageEntries.entries()) {
					const amenityId = amenityIdByValue.get(value);
					if (!amenityId) continue;
					await tx.document.deleteMany({ where: { user_id: hostId, property_amenity_id: amenityId } });
					await tx.document.create({
						data: {
							...buildImageDocumentCreateInput(hostId, uploaded[index], 0),
							property_amenity: { connect: { id: amenityId } },
						},
					});
				}
			});
		}
	}

	const updated = await prisma.property.findFirst({
		where: { id },
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
	if (!updated) return Response.json({ message: 'Property not found' }, { status: 404 });

	return Response.json(mapProperty(updated));
}
