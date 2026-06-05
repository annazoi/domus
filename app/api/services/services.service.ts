import { BookingStatus, PricingUnit } from '@prisma/client';
import { DateTime } from 'luxon';
import { buildPaginationMeta, type PaginatedResult } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import type {
	HostServiceRow,
	PropertyServiceLinksInput,
	ServiceImageRow,
	ServiceInput,
	ServiceRow,
} from './interfaces/services.interface';

const serviceImageSelect = {
	id: true,
	order: true,
	description: true,
	document: { select: { url: true } },
} as const;

const serviceSelect = {
	id: true,
	name: true,
	description: true,
	price: true,
	quantitable_item: true,
	pricing_unit: true,
	active: true,
	max_quantity: true,
	images: {
		orderBy: { order: 'asc' as const },
		select: serviceImageSelect,
	},
} as const;

type ServiceImageSelectRow = {
	id: string;
	order: number;
	description: string | null;
	document: { url: string } | null;
};

type ServiceSelectRow = {
	id: string;
	name: string;
	description: string | null;
	price: { toString(): string };
	quantitable_item: boolean;
	pricing_unit: PricingUnit;
	active: boolean;
	max_quantity: number | null;
	images: ServiceImageSelectRow[];
};

const mapServiceImageRow = (row: ServiceImageSelectRow): ServiceImageRow => ({
	id: row.id,
	order: row.order,
	description: row.description,
	url: row.document?.url ?? null,
});

const mapServiceRow = (row: ServiceSelectRow): ServiceRow => ({
	id: row.id,
	name: row.name,
	description: row.description,
	price: Number(row.price),
	quantitable_item: row.quantitable_item,
	pricing_unit: row.pricing_unit,
	active: row.active,
	max_quantity: row.max_quantity,
	images: row.images.map(mapServiceImageRow),
});

const mapServiceRows = (rows: ServiceSelectRow[]): ServiceRow[] => rows.map(mapServiceRow);

const serviceDataFromInput = (input: ServiceInput) => {
	const quantitable = input.quantitable_item ?? false;
	return {
		name: input.name.trim(),
		description: input.description?.trim() || null,
		price: input.price,
		quantitable_item: quantitable,
		pricing_unit: input.pricing_unit ?? PricingUnit.PER_STAY,
		active: input.active ?? true,
		max_quantity: quantitable ? input.max_quantity ?? null : null,
	};
};

function startOfTodayUtc() {
	return DateTime.utc().startOf('day').toJSDate();
}

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
			where: { property_id: property.id, service: { active: true } },
			orderBy: { service: { name: 'asc' } },
			select: {
				service: { select: serviceSelect },
			},
		});

		return mapServiceRows(rows.map((row) => row.service));
	},

	async listByHost(hostUserId: string): Promise<HostServiceRow[]> {
		const rows = await prisma.service.findMany({
			where: { host_user_id: hostUserId, active: true },
			orderBy: { name: 'asc' },
			select: {
				...serviceSelect,
				_count: { select: { property_services: true } },
			},
		});

		return rows.map((row) => ({
			...mapServiceRow(row),
			property_count: row._count.property_services,
		}));
	},

	async listByHostPaginated(hostUserId: string, page: number, pageSize: number) {
		const where = { host_user_id: hostUserId, active: true };

		const [total, rows] = await Promise.all([
			prisma.service.count({ where }),
			prisma.service.findMany({
				where,
				orderBy: { name: 'asc' },
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: {
					...serviceSelect,
					_count: { select: { property_services: true } },
				},
			}),
		]);

		const items = rows.map((row) => ({
			...mapServiceRow(row),
			property_count: row._count.property_services,
		}));

		return {
			items,
			pagination: buildPaginationMeta(page, pageSize, total),
		} satisfies PaginatedResult<HostServiceRow>;
	},

	async createForHost(hostUserId: string, input: ServiceInput) {
		const row = await prisma.service.create({
			data: {
				host_user_id: hostUserId,
				...serviceDataFromInput(input),
			},
			select: {
				...serviceSelect,
				_count: { select: { property_services: true } },
			},
		});

		return {
			...mapServiceRow(row),
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
			data: serviceDataFromInput(input),
			select: {
				...serviceSelect,
				_count: { select: { property_services: true } },
			},
		});

		return {
			...mapServiceRow(row),
			property_count: row._count.property_services,
		} satisfies HostServiceRow;
	},

	async deleteForHost(hostUserId: string, serviceId: string) {
		const existing = await prisma.service.findFirst({
			where: { id: serviceId, host_user_id: hostUserId },
			select: { id: true },
		});
		if (!existing) return { error: 'NOT_FOUND' as const };

		const inActiveStay = await prisma.serviceOrder.count({
			where: {
				service_id: serviceId,
				booking: {
					status: { not: BookingStatus.CANCELLED },
					check_in: { lte: startOfTodayUtc() },
				},
			},
		});
		if (inActiveStay > 0) return { error: 'SERVICE_IN_USE' as const };

		const hasOrders = await prisma.serviceOrder.count({
			where: { service_id: serviceId },
		});

		await prisma.propertyService.deleteMany({ where: { service_id: serviceId } });

		if (hasOrders > 0) {
			await prisma.service.update({
				where: { id: serviceId },
				data: { active: false },
			});
			return { error: null };
		}

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
				where: {
					service_id: { in: toRemove },
					booking: {
						property_id: property.id,
						status: { not: BookingStatus.CANCELLED },
						check_in: { lte: startOfTodayUtc() },
					},
				},
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
