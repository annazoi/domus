import { prisma } from '@/lib/prisma';
import type { PropertyServiceInput, ServiceRow } from './interfaces/services.interface';

const serviceSelect = {
	id: true,
	name: true,
	description: true,
	price: true,
} as const;

const mapServiceRows = (
	rows: { id: string; name: string; description: string | null; price: { toString(): string } }[],
): ServiceRow[] =>
	rows.map((row) => ({
		id: row.id,
		name: row.name,
		description: row.description,
		price: Number(row.price),
	}));

async function resolvePropertyId(propertyRef: string) {
	const property = await prisma.property.findFirst({
		where: {
			OR: [{ id: propertyRef }, { slug: propertyRef }],
		},
		select: { id: true },
	});
	return property?.id ?? null;
}

export const servicesService = {
	async listByProperty(propertyRef: string) {
		const propertyId = await resolvePropertyId(propertyRef);
		if (!propertyId) return [];

		const rows = await prisma.propertyService.findMany({
			where: { property_id: propertyId },
			orderBy: { service: { name: 'asc' } },
			select: {
				service: { select: serviceSelect },
			},
		});

		return mapServiceRows(rows.map((row) => row.service));
	},

	async syncForProperty(propertyRef: string, items: PropertyServiceInput[]) {
		const propertyId = await resolvePropertyId(propertyRef);
		if (!propertyId) return { error: 'PROPERTY_NOT_FOUND' as const };

		const deduped = items
			.map((item) => ({
				id: item.id?.trim() || undefined,
				name: item.name.trim(),
				description: item.description?.trim() || null,
				price: item.price,
			}))
			.filter((item) => item.name.length > 0 && Number.isFinite(item.price) && item.price >= 0);

		const existingLinks = await prisma.propertyService.findMany({
			where: { property_id: propertyId },
			select: { service_id: true },
		});
		const existingIds = new Set(existingLinks.map((row) => row.service_id));
		const incomingIds = new Set(deduped.map((item) => item.id).filter((id): id is string => Boolean(id)));

		const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
		if (toDelete.length) {
			const inUse = await prisma.serviceOrder.count({
				where: { service_id: { in: toDelete } },
			});
			if (inUse > 0) {
				return { error: 'SERVICE_IN_USE' as const };
			}

			await prisma.propertyService.deleteMany({
				where: { property_id: propertyId, service_id: { in: toDelete } },
			});

			await prisma.service.deleteMany({
				where: {
					id: { in: toDelete },
					property_services: { none: {} },
				},
			});
		}

		for (const item of deduped) {
			if (item.id && existingIds.has(item.id)) {
				await prisma.service.update({
					where: { id: item.id },
					data: {
						name: item.name,
						description: item.description,
						price: item.price,
					},
				});
				continue;
			}

			const created = await prisma.service.create({
				data: {
					name: item.name,
					description: item.description,
					price: item.price,
				},
			});

			await prisma.propertyService.create({
				data: {
					property_id: propertyId,
					service_id: created.id,
				},
			});
		}

		return { error: null };
	},
};
