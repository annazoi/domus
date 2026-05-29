import { BookingStatus as PrismaBookingStatus, Reason } from '@prisma/client';
import { BookingStatus } from '@/features/bookings/interfaces/booking-status';
import type { UpdateHostBookingInput } from '@/features/bookings/interfaces/booking.interface';
import { eachDayInRange, toApiDate, toUtcDay } from '@/features/property-availability/utils/date';
import { prisma } from '@/lib/prisma';

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
	};
}

export const bookingsService = {	async listGuestBookings(guestUserId: string) {
		const rows = await prisma.booking.findMany({
			where: { guest_user_id: guestUserId },
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

	async updateHostBooking(hostId: string, bookingId: string, body: UpdateHostBookingInput) {
		const existing = await prisma.booking.findFirst({
			where: { id: bookingId, host_user_id: hostId },
			select: { id: true, customer_id: true },
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
