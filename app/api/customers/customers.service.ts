import { BookingStatus, Prisma } from '@prisma/client';
import { buildPaginationMeta, type PaginatedResult } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';

const customerSelect = {
	id: true,
	first_name: true,
	last_name: true,
	email: true,
	phone: true,
	vat_number: true,
	notes: true,
	address: true,
	city: true,
	state: true,
	zip: true,
	country: true,
} as const;

type CustomerSelectRow = {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone: string | null;
	vat_number: string | null;
	notes: string | null;
	address: string | null;
	city: string | null;
	state: string | null;
	zip: string | null;
	country: string | null;
};

function mapCustomerWithStats(
	c: CustomerSelectRow,
	countByCustomer: Map<string, number>,
	spentByCustomer: Map<string, number>,
) {
	return {
		id: c.id,
		first_name: c.first_name,
		last_name: c.last_name,
		email: c.email,
		phone: c.phone,
		vat_number: c.vat_number,
		notes: c.notes,
		address: c.address,
		city: c.city,
		state: c.state,
		zip: c.zip,
		country: c.country,
		booking_count: countByCustomer.get(c.id) ?? 0,
		total_spent: spentByCustomer.get(c.id) ?? 0,
	};
}

async function loadStatsMaps(hostUserId: string, customerIds?: string[]) {
	const customerFilter =
		customerIds && customerIds.length > 0 ? { customer_id: { in: customerIds } } : {};

	const [countRows, spentRows] = await Promise.all([
		prisma.booking.groupBy({
			by: ['customer_id'],
			where: { host_user_id: hostUserId, ...customerFilter },
			_count: { _all: true },
		}),
		prisma.booking.groupBy({
			by: ['customer_id'],
			where: {
				host_user_id: hostUserId,
				status: { not: BookingStatus.CANCELLED },
				...customerFilter,
			},
			_sum: { total_price: true },
		}),
	]);

	return {
		countByCustomer: new Map(countRows.map((r) => [r.customer_id, r._count._all])),
		spentByCustomer: new Map(
			spentRows.map((r) => [r.customer_id, Number(r._sum.total_price ?? 0)]),
		),
	};
}

export type UpdateHostCustomerBody = {
	first_name?: string;
	last_name?: string;
	email?: string;
	phone?: string | null;
	vat_number?: string | null;
	notes?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
	country?: string | null;
};

function trimOrNull(value: string | null | undefined) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

function buildCustomerListWhere(hostUserId: string, query?: string): Prisma.CustomerWhereInput {
	const base: Prisma.CustomerWhereInput = { host_user_id: hostUserId };
	const trimmed = query?.trim();
	if (!trimmed || trimmed.length < 3) return base;

	return {
		...base,
		OR: [
			{ first_name: { contains: trimmed, mode: 'insensitive' } },
			{ last_name: { contains: trimmed, mode: 'insensitive' } },
			{ email: { contains: trimmed, mode: 'insensitive' } },
			{ phone: { contains: trimmed, mode: 'insensitive' } },
			{ city: { contains: trimmed, mode: 'insensitive' } },
			{ country: { contains: trimmed, mode: 'insensitive' } },
			{ vat_number: { contains: trimmed, mode: 'insensitive' } },
		],
	};
}

export const customersService = {
	async getHostCustomer(hostUserId: string, customerId: string) {
		const customer = await prisma.customer.findFirst({
			where: { id: customerId, host_user_id: hostUserId },
			select: customerSelect,
		});
		if (!customer) return null;

		const { countByCustomer, spentByCustomer } = await loadStatsMaps(hostUserId, [customerId]);
		return mapCustomerWithStats(customer, countByCustomer, spentByCustomer);
	},

	async listHostCustomersWithStats(hostUserId: string) {
		const [customers, { countByCustomer, spentByCustomer }] = await Promise.all([
			prisma.customer.findMany({
				where: { host_user_id: hostUserId },
				orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
				select: customerSelect,
			}),
			loadStatsMaps(hostUserId),
		]);

		return customers.map((c) => mapCustomerWithStats(c, countByCustomer, spentByCustomer));
	},

	async listHostCustomersWithStatsPaginated(
		hostUserId: string,
		page: number,
		pageSize: number,
		query?: string,
	) {
		const where = buildCustomerListWhere(hostUserId, query);

		const [total, customers] = await Promise.all([
			prisma.customer.count({ where }),
			prisma.customer.findMany({
				where,
				orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: customerSelect,
			}),
		]);

		const customerIds = customers.map((customer) => customer.id);
		const { countByCustomer, spentByCustomer } = await loadStatsMaps(hostUserId, customerIds);

		return {
			items: customers.map((customer) => mapCustomerWithStats(customer, countByCustomer, spentByCustomer)),
			pagination: buildPaginationMeta(page, pageSize, total),
		} satisfies PaginatedResult<ReturnType<typeof mapCustomerWithStats>>;
	},

	async updateHostCustomer(hostUserId: string, customerId: string, body: UpdateHostCustomerBody) {
		const existing = await prisma.customer.findFirst({
			where: { id: customerId, host_user_id: hostUserId },
			select: { id: true },
		});
		if (!existing) return null;

		const first_name = body.first_name?.trim();
		const last_name = body.last_name?.trim();
		const email = body.email?.trim();
		if (!first_name || !last_name || !email) {
			return { error: 'invalid' as const };
		}

		const updated = await prisma.customer.update({
			where: { id: customerId },
			data: {
				first_name,
				last_name,
				email,
				phone: trimOrNull(body.phone ?? null),
				vat_number: trimOrNull(body.vat_number ?? null),
				notes: trimOrNull(body.notes ?? null),
				address: trimOrNull(body.address ?? null),
				city: trimOrNull(body.city ?? null),
				state: trimOrNull(body.state ?? null),
				zip: trimOrNull(body.zip ?? null),
				country: trimOrNull(body.country ?? null),
			},
			select: customerSelect,
		});

		const { countByCustomer, spentByCustomer } = await loadStatsMaps(hostUserId, [customerId]);
		return mapCustomerWithStats(updated, countByCustomer, spentByCustomer);
	},
};
