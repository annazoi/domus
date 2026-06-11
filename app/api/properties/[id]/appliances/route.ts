import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { mapProperty } from '@/app/api/_utils/property-map';
import { propertyDetailInclude } from '@/app/api/_utils/property-include';
import { uploadFiles } from '@/app/api/utils/cloudinary/cloudinary.service';
import { buildImageDocumentCreateInput } from '@/app/api/utils/documents/documents.service';
import { prisma } from '@/lib/prisma';
import { normalizeRichTextForDb } from '@/lib/rich-text/normalize-rich-text-for-db';

interface ApplianceItem {
	key: string;
	id?: string | null;
	title: string;
	description?: string | null;
}

interface AppliancesPayload {
	appliances?: ApplianceItem[];
	removed_ids?: string[];
	clear_image_keys?: string[];
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const contentType = request.headers.get('content-type') ?? '';
	let body: AppliancesPayload = {};
	let imageFilesByKey = new Map<string, File>();

	if (contentType.includes('multipart/form-data')) {
		const formData = await request.formData();
		const rawAppliances = formData.get('appliances');
		if (typeof rawAppliances === 'string' && rawAppliances.trim()) {
			try {
				body.appliances = JSON.parse(rawAppliances) as ApplianceItem[];
			} catch {
				body.appliances = [];
			}
		}
		const rawRemovedIds = formData.get('removed_ids');
		if (typeof rawRemovedIds === 'string' && rawRemovedIds.trim()) {
			try {
				body.removed_ids = JSON.parse(rawRemovedIds) as string[];
			} catch {
				body.removed_ids = [];
			}
		}
		const rawClearKeys = formData.get('clear_image_keys');
		if (typeof rawClearKeys === 'string' && rawClearKeys.trim()) {
			try {
				body.clear_image_keys = JSON.parse(rawClearKeys) as string[];
			} catch {
				body.clear_image_keys = [];
			}
		}

		const imageKeysRaw = formData.get('image_keys');
		let imageKeys: string[] = [];
		if (typeof imageKeysRaw === 'string' && imageKeysRaw.trim()) {
			try {
				imageKeys = (JSON.parse(imageKeysRaw) as unknown[]).filter((v): v is string => typeof v === 'string');
			} catch {
				imageKeys = [];
			}
		}
		const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);
		files.forEach((file, index) => {
			const key = imageKeys[index]?.trim();
			if (key) imageFilesByKey.set(key, file);
		});
	} else {
		body = (await request.json()) as AppliancesPayload;
	}

	const property = await prisma.property.findFirst({
		where: { id, user_id: hostId },
		select: { id: true },
	});
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	const items = (body.appliances ?? [])
		.map((item) => ({
			key: item.key.trim(),
			id: item.id?.trim() || null,
			title: item.title.trim(),
			description: normalizeRichTextForDb(item.description),
		}))
		.filter((item) => item.key && item.title);

	const removedIds = [...new Set((body.removed_ids ?? []).map((v) => v.trim()).filter(Boolean))];
	const clearImageKeys = new Set((body.clear_image_keys ?? []).map((v) => v.trim()).filter(Boolean));
	const keyToApplianceId = new Map<string, string>();

	await prisma.$transaction(async (tx) => {
		if (removedIds.length) {
			await tx.propertyAppliance.deleteMany({
				where: { property_id: id, id: { in: removedIds } },
			});
		}

		for (const [index, item] of items.entries()) {
			if (item.id) {
				const existing = await tx.propertyAppliance.findFirst({
					where: { id: item.id, property_id: id },
					select: { id: true },
				});
				if (existing) {
					await tx.propertyAppliance.update({
						where: { id: existing.id },
						data: { title: item.title, description: item.description, order: index },
					});
					keyToApplianceId.set(item.key, existing.id);
					continue;
				}
			}

			const created = await tx.propertyAppliance.create({
				data: {
					property_id: id,
					title: item.title,
					description: item.description,
					order: index,
				},
				select: { id: true },
			});
			keyToApplianceId.set(item.key, created.id);
		}

		const keptIds = [...keyToApplianceId.values()];
		if (keptIds.length) {
			await tx.propertyAppliance.deleteMany({
				where: {
					property_id: id,
					id: { notIn: keptIds },
				},
			});
		} else {
			await tx.propertyAppliance.deleteMany({ where: { property_id: id } });
		}
	});

	const clearApplianceIds = [...clearImageKeys]
		.map((key) => keyToApplianceId.get(key))
		.filter((v): v is string => Boolean(v));

	if (clearApplianceIds.length) {
		await prisma.document.deleteMany({
			where: { user_id: hostId, property_appliance_id: { in: clearApplianceIds } },
		});
	}

	if (imageFilesByKey.size) {
		const imageEntries = [...imageFilesByKey.entries()].filter(([key]) => keyToApplianceId.has(key));
		if (imageEntries.length) {
			const uploaded = await uploadFiles(imageEntries.map(([, file]) => file));
			await prisma.$transaction(async (tx) => {
				for (const [index, [key]] of imageEntries.entries()) {
					const applianceId = keyToApplianceId.get(key);
					if (!applianceId) continue;
					await tx.document.deleteMany({ where: { user_id: hostId, property_appliance_id: applianceId } });
					await tx.document.create({
						data: {
							...buildImageDocumentCreateInput(hostId, uploaded[index], 0),
							property_appliance: { connect: { id: applianceId } },
						},
					});
				}
			});
		}
	}

	const updated = await prisma.property.findFirst({
		where: { id },
		include: propertyDetailInclude,
	});
	if (!updated) return Response.json({ message: 'Property not found' }, { status: 404 });

	return Response.json(mapProperty(updated));
}
