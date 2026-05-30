import { prisma } from '@/lib/prisma';
import type { HostServiceRow, PropertyServiceLinksInput, ServiceInput, ServiceRow } from './interfaces/services.interface';

const serviceSelect = {
	id: true,
	name: true,
	description: true,
	price: true,
	quantifiable_item: true,
} as const;

const mapServiceRows = (
	rows: {
		id: string;
		name: string;
		description: string | null;
		price: { toString(): string };
		quantifiable_item: boolean;
	}[],
): ServiceRow[] =>
	rows.map((row) => ({
		id: row.id,
		name: row.name,
		description: row.description,
		price: Number(row.price),
		quantifiable_item: row.quantifiable_item,
	}));

async function resolvePropertyId(propertyRef: string) {
	const property = await prisma.property.findFirst({
		where: {
			OR: [{ id: propertyRef }, { slug: propertyRef }],
		},
		select: { id: true, user_id: true },
	});
	return property;
}

export const servicesService = {
	async listByProperty(propertyRef: string) {
		const property = await resolvePropertyId(propertyRef);
		if (!property) return [];

		const rows = await prisma.propertyService.findMany({
			where: { property_id: property.id },
			orderBy: { service: { name: 'asc' } },
			select: {
				service: { select: serviceSelect },
			},
		});

		return mapServiceRows(rows.map((row) => row.service));
	},

	async listByHost(hostUserId: string): Promise<HostServiceRow[]> {
		const rows = await prisma.service.findMany({
			where: { host_user_id: hostUserId },
			orderBy: { name: 'asc' },
			select: {
				...serviceSelect,
				_count: { select: { property_services: true } },
			},
		});

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			description: row.description,
			price: Number(row.price),
			quantifiable_item: row.quantifiable_item,
			property_count: row._count.property_services,
		}));
	},

	async createForHost(hostUserId: string, input: ServiceInput) {
		const row = await prisma.service.create({
			data: {
				host_user_id: hostUserId,
				name: input.name.trim(),
				description: input.description?.trim() || null,
				price: input.price,
				quantifiable_item: input.quantifiable_item ?? false,
			},
			select: {
				...serviceSelect,
				_count: { select: { property_services: true } },
			},
		});

		return {
			id: row.id,
			name: row.name,
			description: row.description,
			price: Number(row.price),
			quantifiable_item: row.quantifiable_item,
			property_count: row._count.property_services,
		} satisfies HostServiceRow;
	},

	async updateForHost(hostUserId: string, serviceId: string, input: ServiceInput) {
		const existing = await prisma.service.findFirst({
			where: { id: serviceId, host_user_id: hostUserId },
			select: { id: true },
		});
		if (!existing) return null;

		const row = await prisma.service.update({
			where: { id: serviceId },
			data: {
				name: input.name.trim(),
				description: input.description?.trim() || null,
				price: input.price,
				quantifiable_item: input.quantifiable_item ?? false,
			},
			select: {
				...serviceSelect,
				_count: { select: { property_services: true } },
			},
		});

		return {
			id: row.id,
			name: row.name,
			description: row.description,
			price: Number(row.price),
			quantifiable_item: row.quantifiable_item,
			property_count: row._count.property_services,
		} satisfies HostServiceRow;
	},

	async deleteForHost(hostUserId: string, serviceId: string) {
		const existing = await prisma.service.findFirst({
			where: { id: serviceId, host_user_id: hostUserId },
			select: { id: true },
		});
		if (!existing) return { error: 'NOT_FOUND' as const };

		const inUse = await prisma.serviceOrder.count({
			where: { service_id: serviceId },
		});
		if (inUse > 0) return { error: 'SERVICE_IN_USE' as const };

		await prisma.propertyService.deleteMany({ where: { service_id: serviceId } });
		await prisma.service.delete({ where: { id: serviceId } });

		return { error: null };
	},

	async syncPropertyLinks(propertyRef: string, hostUserId: string, input: PropertyServiceLinksInput) {
		const property = await resolvePropertyId(propertyRef);
		if (!property) return { error: 'PROPERTY_NOT_FOUND' as const };
		if (property.user_id !== hostUserId) return { error: 'PROPERTY_NOT_FOUND' as const };

		const serviceIds = [...new Set(input.service_ids.map((id) => id.trim()).filter(Boolean))];

		if (serviceIds.length) {
			const ownedCount = await prisma.service.count({
				where: { id: { in: serviceIds }, host_user_id: hostUserId },
			});
			if (ownedCount !== serviceIds.length) {
				return { error: 'INVALID_SERVICE' as const };
			}
		}

		const existingLinks = await prisma.propertyService.findMany({
			where: { property_id: property.id },
			select: { service_id: true },
		});
		const existingIds = new Set(existingLinks.map((row) => row.service_id));
		const incomingIds = new Set(serviceIds);

		const toRemove = [...existingIds].filter((id) => !incomingIds.has(id));
		if (toRemove.length) {
			const inUse = await prisma.serviceOrder.count({
				where: { service_id: { in: toRemove }, booking: { property_id: property.id } },
			});
			if (inUse > 0) {
				return { error: 'SERVICE_IN_USE' as const };
			}

			await prisma.propertyService.deleteMany({
				where: { property_id: property.id, service_id: { in: toRemove } },
			});
		}

		const toAdd = serviceIds.filter((id) => !existingIds.has(id));
		if (toAdd.length) {
			await prisma.propertyService.createMany({
				data: toAdd.map((service_id) => ({
					property_id: property.id,
					service_id,
				})),
				skipDuplicates: true,
			});
		}

		return { error: null };
	},
};
