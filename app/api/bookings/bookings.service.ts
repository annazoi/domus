import { BookingStatus as PrismaBookingStatus, Prisma, Reason } from '@prisma/client';
import { DateTime } from 'luxon';
import { BookingStatus } from '@/features/bookings/interfaces/booking-status';
import type { UpdateHostBookingInput } from '@/features/bookings/interfaces/booking.interface';
import { eachDayInRange, toApiDate, toUtcDay } from '@/features/property-availability/utils/date';
import { sendBookingConfirmationEmails } from '@/lib/email/booking-confirmation-emails';
import { buildPaginationMeta, type PaginatedResult } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';

export const BOOKINGS_SEARCH_MIN_LENGTH = 2;

const BOOKING_SEARCH_DATE_FORMATS = ['yyyy-MM-dd', 'dd/MM/yyyy', 'dd-MM-yyyy', 'MM/dd/yyyy'] as const;

type BookingView = {
	id: string;
	property_id: string;
	host_id: string;
	guest_name: string;
	start_date: string;
	end_date: string;
	status: BookingStatus;
	property_title: string;
};

const guestBookingSelect = {
	id: true,
	property_id: true,
	host_user_id: true,
	check_in: true,
	check_out: true,
	guests: true,
	total_price: true,
	status: true,
	created_at: true,
	property: {
		select: {
			title: true,
			slug: true,
			address: true,
			city: true,
			country: true,
			room_type: true,
			property_type: true,
		},
	},
	host: {
		select: {
			host_name: true,
			first_name: true,
			last_name: true,
			email: true,
			phone: true,
			avatar: { select: { url: true } },
		},
	},
	service_orders: {
		select: {
			id: true,
			service_id: true,
			quantity: true,
			unit_price: true,
			service: { select: { name: true } },
		},
		orderBy: { service: { name: 'asc' } },
	},
} as const;

type GuestBookingRow = Awaited<ReturnType<typeof prisma.booking.findFirst<{ select: typeof guestBookingSelect }>>>;

const hostBookingSelect = {
	id: true,
	property_id: true,
	customer_id: true,
	host_user_id: true,
	guest_user_id: true,
	check_in: true,
	check_out: true,
	guests: true,
	total_price: true,
	status: true,
	created_at: true,
	updated_at: true,
	property: {
		select: {
			title: true,
			slug: true,
			address: true,
			city: true,
			country: true,
			room_type: true,
			property_type: true,
		},
	},
	guest: {
		select: {
			first_name: true,
			last_name: true,
			email: true,
			phone: true,
		},
	},
	customer: {
		select: {
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
		},
	},
	service_orders: {
		select: {
			id: true,
			service_id: true,
			quantity: true,
			unit_price: true,
			service: { select: { name: true } },
		},
		orderBy: { service: { name: 'asc' } },
	},
	host: {
		select: {
			host_name: true,
			first_name: true,
			last_name: true,
			avatar: { select: { url: true } },
		},
	},
} as const;

type HostBookingRow = Awaited<ReturnType<typeof prisma.booking.findFirst<{ select: typeof hostBookingSelect }>>>;

const bookingStatusLabel = (status: PrismaBookingStatus): BookingStatus => {
	if (status === PrismaBookingStatus.CONFIRMED) return BookingStatus.CONFIRMED;
	if (status === PrismaBookingStatus.CANCELLED) return BookingStatus.CANCELLED;
	return BookingStatus.PENDING;
};

const bookingStatusFromApi = (status: BookingStatus): PrismaBookingStatus => {
	if (status === BookingStatus.CONFIRMED) return PrismaBookingStatus.CONFIRMED;
	if (status === BookingStatus.CANCELLED) return PrismaBookingStatus.CANCELLED;
	return PrismaBookingStatus.PENDING;
};

function trimOrNull(value: string | null | undefined) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

function tryParseBookingSearchDate(query: string) {
	for (const format of BOOKING_SEARCH_DATE_FORMATS) {
		const parsed = DateTime.fromFormat(query, format, { zone: 'utc' });
		if (parsed.isValid) return parsed.startOf('day');
	}

	const iso = DateTime.fromISO(query, { zone: 'utc' });
	if (iso.isValid) return iso.startOf('day');

	return null;
}

function buildHostBookingSearchOr(query: string): Prisma.BookingWhereInput[] {
	const trimmed = query.trim();
	const insensitive = { contains: trimmed, mode: 'insensitive' as const };
	const clauses: Prisma.BookingWhereInput[] = [
		{ id: insensitive },
		{ guest_user_id: insensitive },
		{ customer_id: insensitive },
		{ property_id: insensitive },
		{ property: { title: insensitive } },
		{ guest: { first_name: insensitive } },
		{ guest: { last_name: insensitive } },
		{ guest: { email: insensitive } },
		{ guest: { phone: insensitive } },
		{ customer: { first_name: insensitive } },
		{ customer: { last_name: insensitive } },
		{ customer: { email: insensitive } },
		{ customer: { phone: insensitive } },
		{ customer: { vat_number: insensitive } },
	];

	const searchDate = tryParseBookingSearchDate(trimmed);
	if (searchDate) {
		clauses.push({
			check_in: { lt: searchDate.plus({ days: 1 }).toJSDate() },
			check_out: { gt: searchDate.toJSDate() },
		});
	}

	return clauses;
}

async function guestBookingAccessWhere(guestUserId: string) {
	const user = await prisma.user.findUnique({
		where: { id: guestUserId },
		select: { email: true },
	});
	const guestCustomers = await prisma.customer.findMany({
		where: { guest_user_id: guestUserId },
		select: { id: true, email: true },
	});

	const emails = new Set<string>();
	const userEmail = user?.email?.trim().toLowerCase();
	if (userEmail) emails.add(userEmail);
	for (const customer of guestCustomers) {
		const customerEmail = customer.email.trim().toLowerCase();
		if (customerEmail) emails.add(customerEmail);
	}
	const emailList = [...emails];
	const customerIds = guestCustomers.map((customer) => customer.id);

	return {
		OR: [
			{ guest_user_id: guestUserId },
			...(customerIds.length > 0 ? [{ customer_id: { in: customerIds } }] : []),
			...(emailList.length > 0
				? [
						{ customer: { email: { in: emailList, mode: 'insensitive' as const } } },
						{ guest: { email: { in: emailList, mode: 'insensitive' as const } } },
					]
				: []),
		],
	};
}

function mapGuestBookingRow(row: NonNullable<GuestBookingRow>) {
	const hostName = `${row.host.first_name} ${row.host.last_name}`.trim();
	return {
		id: row.id,
		property_id: row.property_id,
		host_id: row.host_user_id,
		host_name: hostName || 'Host',
		start_date: toApiDate(row.check_in.toISOString()),
		end_date: toApiDate(row.check_out.toISOString()),
		status: bookingStatusLabel(row.status),
		property_title: row.property.title,
		guests: row.guests,
		total_price: Number(row.total_price),
		check_in_iso: row.check_in.toISOString(),
		check_out_iso: row.check_out.toISOString(),
		created_at: row.created_at.toISOString(),
		property: {
			slug: row.property.slug,
			address: row.property.address,
			city: row.property.city,
			country: row.property.country,
			room_type: row.property.room_type,
			property_type: row.property.property_type,
		},
		host: {
			first_name: row.host.first_name,
			last_name: row.host.last_name,
			host_name: row.host.host_name,
			email: row.host.email,
			phone: row.host.phone,
			avatar_url: row.host.avatar?.url ?? null,
		},
		service_orders: row.service_orders.map((order) => ({
			id: order.id,
			service_id: order.service_id,
			name: order.service.name,
			quantity: order.quantity,
			unit_price: Number(order.unit_price),
			line_total: Number(order.unit_price) * order.quantity,
		})),
	};
}

function mapHostBookingRow(row: NonNullable<HostBookingRow>) {
	const guestName = `${row.guest.first_name} ${row.guest.last_name}`.trim();
	return {
		id: row.id,
		property_id: row.property_id,
		customer_id: row.customer_id,
		host_id: row.host_user_id,
		guest_user_id: row.guest_user_id,
		guest_name: guestName || 'Guest',
		start_date: toApiDate(row.check_in.toISOString()),
		end_date: toApiDate(row.check_out.toISOString()),
		status: bookingStatusLabel(row.status),
		property_title: row.property.title,
		guests: row.guests,
		total_price: Number(row.total_price),
		check_in_iso: row.check_in.toISOString(),
		check_out_iso: row.check_out.toISOString(),
		created_at: row.created_at.toISOString(),
		updated_at: row.updated_at.toISOString(),
		property: {
			slug: row.property.slug,
			address: row.property.address,
			city: row.property.city,
			country: row.property.country,
			room_type: row.property.room_type,
			property_type: row.property.property_type,
		},
		guest: {
			first_name: row.guest.first_name,
			last_name: row.guest.last_name,
			email: row.guest.email,
			phone: row.guest.phone,
		},
		customer: {
			first_name: row.customer.first_name,
			last_name: row.customer.last_name,
			email: row.customer.email,
			phone: row.customer.phone,
			vat_number: row.customer.vat_number,
			notes: row.customer.notes,
			address: row.customer.address,
			city: row.customer.city,
			state: row.customer.state,
			zip: row.customer.zip,
			country: row.customer.country,
		},
		service_orders: row.service_orders.map((order) => ({
			id: order.id,
			service_id: order.service_id,
			name: order.service.name,
			quantity: order.quantity,
			unit_price: Number(order.unit_price),
			line_total: Number(order.unit_price) * order.quantity,
		})),
		host: {
			first_name: row.host.first_name,
			last_name: row.host.last_name,
			host_name: row.host.host_name,
			avatar_url: row.host.avatar?.url ?? null,
		},
	};
}

export const bookingsService = {
	async getGuestBooking(guestUserId: string, bookingId: string) {
		const accessWhere = await guestBookingAccessWhere(guestUserId);
		const row = await prisma.booking.findFirst({
			where: { id: bookingId, ...accessWhere },
			select: guestBookingSelect,
		});
		if (!row) return null;
		return mapGuestBookingRow(row);
	},

	async listGuestBookings(guestUserId: string) {
		const accessWhere = await guestBookingAccessWhere(guestUserId);

		const rows = await prisma.booking.findMany({
			where: accessWhere,
			orderBy: { check_in: 'desc' },
			select: {
				id: true,
				property_id: true,
				check_in: true,
				check_out: true,
				status: true,
				host: { select: { id: true, first_name: true, last_name: true } },
				property: { select: { title: true } },
			},
		});

		return rows.map((row) => ({
			id: row.id,
			property_id: row.property_id,
			host_id: row.host.id,
			guest_name: `${row.host.first_name} ${row.host.last_name}`.trim(),
			start_date: toApiDate(row.check_in.toISOString()),
			end_date: toApiDate(row.check_out.toISOString()),
			status: bookingStatusLabel(row.status),
			property_title: row.property.title,
		}));
	},

	async listHostBookings(hostId: string) {
		const rows = await prisma.booking.findMany({
			where: { host_user_id: hostId },
			orderBy: { check_in: 'desc' },
			select: hostBookingSelect,
		});

		return rows.map(mapHostBookingRow);
	},

	async listHostBookingsPaginated(
		hostId: string,
		page: number,
		pageSize: number,
		options?: {
			customerId?: string;
			propertyId?: string;
			dateFrom?: string;
			dateTo?: string;
			search?: string;
			orderBy?: 'check_in' | 'created_at';
			excludeCancelled?: boolean;
		},
	) {
		const where: Prisma.BookingWhereInput = {
			host_user_id: hostId,
			...(options?.customerId ? { customer_id: options.customerId } : {}),
			...(options?.propertyId ? { property_id: options.propertyId } : {}),
			...(options?.excludeCancelled ? { status: { not: PrismaBookingStatus.CANCELLED } } : {}),
		};

		const search = options?.search?.trim();
		if (search && search.length >= BOOKINGS_SEARCH_MIN_LENGTH) {
			where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), { OR: buildHostBookingSearchOr(search) }];
		}

		if (options?.dateFrom) {
			const from = toUtcDay(options.dateFrom);
			if (from.isValid) {
				where.check_out = { gt: from.toJSDate() };
			}
		}

		if (options?.dateTo) {
			const toExclusive = toUtcDay(options.dateTo).plus({ days: 1 });
			if (toExclusive.isValid) {
				where.check_in = { lt: toExclusive.toJSDate() };
			}
		}

		const orderBy = options?.orderBy === 'created_at' ? { created_at: 'desc' as const } : { check_in: 'desc' as const };

		const [total, rows] = await Promise.all([
			prisma.booking.count({ where }),
			prisma.booking.findMany({
				where,
				orderBy,
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: hostBookingSelect,
			}),
		]);

		return {
			items: rows.map(mapHostBookingRow),
			pagination: buildPaginationMeta(page, pageSize, total),
		} satisfies PaginatedResult<ReturnType<typeof mapHostBookingRow>>;
	},

	async listGuestBookingsPaginated(guestUserId: string, page: number, pageSize: number) {
		const accessWhere = await guestBookingAccessWhere(guestUserId);

		const [total, rows] = await Promise.all([
			prisma.booking.count({ where: accessWhere }),
			prisma.booking.findMany({
				where: accessWhere,
				orderBy: { check_in: 'desc' },
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: {
					id: true,
					property_id: true,
					check_in: true,
					check_out: true,
					status: true,
					host: { select: { id: true, first_name: true, last_name: true } },
					property: { select: { title: true } },
				},
			}),
		]);

		const items = rows.map((row) => ({
			id: row.id,
			property_id: row.property_id,
			host_id: row.host.id,
			guest_name: `${row.host.first_name} ${row.host.last_name}`.trim(),
			start_date: toApiDate(row.check_in.toISOString()),
			end_date: toApiDate(row.check_out.toISOString()),
			status: bookingStatusLabel(row.status),
			property_title: row.property.title,
		}));

		return {
			items,
			pagination: buildPaginationMeta(page, pageSize, total),
		} satisfies PaginatedResult<(typeof items)[number]>;
	},

	async updateHostBooking(hostId: string, bookingId: string, body: UpdateHostBookingInput) {
		const existing = await prisma.booking.findFirst({
			where: { id: bookingId, host_user_id: hostId },
			select: { id: true, customer_id: true, status: true },
		});
		if (!existing) return null;

		const checkIn = toUtcDay(body.start_date);
		const checkOut = toUtcDay(body.end_date);
		if (!checkIn.isValid || !checkOut.isValid || checkOut <= checkIn) {
			return { error: 'invalid_dates' as const };
		}

		if (!Number.isInteger(body.guests) || body.guests < 1) {
			return { error: 'invalid_guests' as const };
		}

		if (!Number.isFinite(body.total_price) || body.total_price < 0) {
			return { error: 'invalid_price' as const };
		}

		if (!Object.values(BookingStatus).includes(body.status)) {
			return { error: 'invalid_status' as const };
		}

		const { customer } = body;
		const first_name = customer.first_name.trim();
		const last_name = customer.last_name.trim();
		const email = customer.email.trim();
		if (!first_name || !last_name || !email) {
			return { error: 'invalid_customer' as const };
		}

		await prisma.$transaction([
			prisma.booking.update({
				where: { id: bookingId },
				data: {
					check_in: checkIn.toJSDate(),
					check_out: checkOut.toJSDate(),
					guests: body.guests,
					total_price: body.total_price,
					status: bookingStatusFromApi(body.status),
				},
			}),
			prisma.customer.update({
				where: { id: existing.customer_id },
				data: {
					first_name,
					last_name,
					email,
					phone: trimOrNull(customer.phone),
					vat_number: trimOrNull(customer.vat_number),
					notes: trimOrNull(customer.notes),
					address: trimOrNull(customer.address),
					city: trimOrNull(customer.city),
					state: trimOrNull(customer.state),
					zip: trimOrNull(customer.zip),
					country: trimOrNull(customer.country),
				},
			}),
		]);

		const nextStatus = bookingStatusFromApi(body.status);
		if (nextStatus === PrismaBookingStatus.CONFIRMED && existing.status !== PrismaBookingStatus.CONFIRMED) {
			void sendBookingConfirmationEmails(bookingId).catch((error) => {
				console.error(`Failed to send booking confirmation emails for ${bookingId}:`, error);
			});
		}

		const row = await prisma.booking.findFirst({
			where: { id: bookingId },
			select: hostBookingSelect,
		});
		if (!row) return null;

		return mapHostBookingRow(row);
	},

	async createBookingBlock(input: {		hostId: string;
		propertyId: string;
		startDate: string;
		endDate: string;
	}) {
		const { hostId, propertyId, startDate, endDate } = input;
		const property = await prisma.property.findFirst({
			where: { id: propertyId, user_id: hostId },
			select: { id: true, user_id: true, title: true },
		});
		if (!property) return null;

		const start = toUtcDay(startDate);
		const endInclusive = toUtcDay(endDate);
		if (!start.isValid || !endInclusive.isValid || endInclusive < start) {
			return { error: 'INVALID_DATE' as const };
		}

		const endExclusive = endInclusive.plus({ days: 1 });
		const days = eachDayInRange(start, endExclusive);
		const rows = await prisma.$transaction(
			days.map((day) =>
				prisma.propertyAvailability.upsert({
					where: {
						property_id_date: {
							property_id: propertyId,
							date: day.toJSDate(),
						},
					},
					update: {
						user_id: hostId,
						is_available: false,
						reason: Reason.BOOKED,
					},
					create: {
						property_id: propertyId,
						user_id: hostId,
						date: day.toJSDate(),
						price: 0,
						is_available: false,
						reason: Reason.BOOKED,
					},
				}),
			),
		);

		return {
			id: rows[0]?.id ?? crypto.randomUUID(),
			property_id: propertyId,
			host_id: property.user_id,
			guest_name: 'Booked guest',
			start_date: toApiDate(start.toISO() ?? startDate),
			end_date: toApiDate(endInclusive.toISO() ?? endDate),
			status: BookingStatus.CONFIRMED,
			property_title: property.title,
		};
	},
};
