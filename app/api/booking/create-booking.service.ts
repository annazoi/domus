import { BookingStatus, Prisma } from '@prisma/client';
import { ensureGuestUserAndCustomerForHost } from '@/app/api/booking/ensure-guest-and-customer';
import { toUtcDay } from '@/features/property-availability/utils/date';
import { calculateBookingPrice, type BookingPriceError } from '@/lib/pricing/booking-pricing.service';
import type { PriceSnapshot } from '@/lib/pricing/price-snapshot';
import { prisma } from '@/lib/prisma';

class BookingUnavailableError extends Error {
	override name = 'BookingUnavailableError';
}

export interface BookingServiceLine {
	service_id: string;
	quantity: number;
}

export interface CreateBookingInput {
	property_id: string;
	check_in: Date;
	check_out: Date;
	guests: number;
	guest: {
		first_name: string;
		last_name: string;
		email: string;
		phone: string | null;
	};
	services?: BookingServiceLine[];
}

export type CreateBookingErrorCode =
	| 'INVALID_SERVICE'
	| 'INVALID_SERVICE_QUANTITY'
	| 'UNAVAILABLE'
	| 'NOT_FOUND'
	| 'INVALID_INPUT'
	| 'GUESTS_EXCEED';

export type CreateBookingResult =
	| { ok: true; booking: Awaited<ReturnType<typeof prisma.booking.create>> }
	| { ok: false; error: CreateBookingErrorCode };

const PRICE_ERROR_TO_BOOKING_ERROR: Record<BookingPriceError, CreateBookingErrorCode> = {
	invalid_input: 'INVALID_INPUT',
	not_found: 'NOT_FOUND',
	guests_exceed_capacity: 'GUESTS_EXCEED',
	unavailable: 'UNAVAILABLE',
	invalid_service: 'INVALID_SERVICE',
	invalid_service_quantity: 'INVALID_SERVICE_QUANTITY',
};

function snapshotToJson(snapshot: PriceSnapshot) {
	return snapshot as unknown as Prisma.InputJsonValue;
}

export async function createBookingRecord(
	input: CreateBookingInput,
	options: { status?: BookingStatus; authenticatedUserId?: string | null } = {},
): Promise<CreateBookingResult> {
	const status = options.status ?? BookingStatus.PENDING;
	const serviceLines = input.services ?? [];
	const extras = serviceLines.map((line) => ({ service_id: line.service_id, quantity: line.quantity }));

	const preTx = await calculateBookingPrice({
		property_id: input.property_id,
		check_in: input.check_in,
		check_out: input.check_out,
		guests: input.guests,
		extras,
		hostId: options.authenticatedUserId,
	});

	if (preTx.kind === 'error') {
		return { ok: false, error: PRICE_ERROR_TO_BOOKING_ERROR[preTx.error] };
	}

	try {
		const booking = await prisma.$transaction(
			async (tx) => {
				const verified = await calculateBookingPrice(
					{
						property_id: input.property_id,
						check_in: input.check_in,
						check_out: input.check_out,
						guests: input.guests,
						extras,
						hostId: options.authenticatedUserId,
					},
					tx,
				);

				if (verified.kind === 'error') {
					if (verified.error === 'invalid_service') throw new Error('INVALID_SERVICE');
					if (verified.error === 'invalid_service_quantity') throw new Error('INVALID_SERVICE_QUANTITY');
					throw new BookingUnavailableError();
				}

				const { guestUserId, customerId } = await ensureGuestUserAndCustomerForHost(tx, {
					email: input.guest.email,
					first_name: input.guest.first_name,
					last_name: input.guest.last_name,
					phone: input.guest.phone,
					hostUserId: verified.hostUserId,
					authenticatedUserId: options.authenticatedUserId,
				});

				const { snapshot } = verified;

				const created = await tx.booking.create({
					data: {
						property_id: verified.propertyId,
						host_user_id: verified.hostUserId,
						guest_user_id: guestUserId,
						customer_id: customerId,
						check_in: input.check_in,
						check_out: input.check_out,
						guests: input.guests,
						nights: snapshot.nights,
						currency: snapshot.currency,
						total_price: snapshot.total,
						subtotal_accommodation: snapshot.subtotal_accommodation,
						subtotal_extras: snapshot.subtotal_extras,
						fees: snapshot.fees,
						discount_amount: snapshot.discount_amount,
						price_snapshot: snapshotToJson(snapshot),
						status,
					},
				});

				if (verified.extras.length > 0) {
					await Promise.all(
						verified.extras.map((extra) =>
							tx.serviceOrder.create({
								data: {
									user_id: guestUserId,
									service_id: extra.service_id,
									booking_id: created.id,
									customer_id: customerId,
									quantity: extra.quantity,
									unit_price: extra.unit_price,
								},
							}),
						),
					);
				}

				return created;
			},
			{
				isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
			},
		);

		return { ok: true, booking };
	} catch (e) {
		if (e instanceof Error && e.message === 'INVALID_SERVICE') {
			return { ok: false, error: 'INVALID_SERVICE' };
		}
		if (e instanceof Error && e.message === 'INVALID_SERVICE_QUANTITY') {
			return { ok: false, error: 'INVALID_SERVICE_QUANTITY' };
		}
		if (e instanceof BookingUnavailableError) {
			return { ok: false, error: 'UNAVAILABLE' };
		}
		if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2034') {
			return { ok: false, error: 'UNAVAILABLE' };
		}
		throw e;
	}
}

export async function findReusablePendingBooking(
	input: CreateBookingInput,
	options: { authenticatedUserId?: string | null } = {},
) {
	const property = await prisma.property.findFirst({
		where: {
			OR: [{ id: input.property_id }, { slug: input.property_id }],
		},
		select: { id: true, user_id: true, isPublished: true },
	});
	if (!property) return null;
	if (!property.isPublished && property.user_id !== options.authenticatedUserId) return null;

	const serviceLines = input.services ?? [];
	if (serviceLines.length > 0) return null;

	const pending = await prisma.booking.findFirst({
		where: {
			property_id: property.id,
			status: BookingStatus.PENDING,
			check_in: input.check_in,
			check_out: input.check_out,
			guests: input.guests,
			guest: { email: input.guest.email },
		},
		orderBy: { created_at: 'desc' },
		select: { id: true },
	});

	if (!pending) return null;

	const serviceOrderCount = await prisma.serviceOrder.count({
		where: { booking_id: pending.id },
	});
	if (serviceOrderCount > 0) return null;

	return pending;
}

export function mergeServiceLines(
	services: { service_id?: string; quantity?: number }[] | undefined,
	extraServiceIds: string[] | undefined,
): BookingServiceLine[] {
	const byId = new Map<string, number>();

	for (const line of services ?? []) {
		const id = line.service_id?.trim();
		if (!id) continue;
		byId.set(id, line.quantity ?? 1);
	}

	for (const rawId of extraServiceIds ?? []) {
		const id = rawId?.trim();
		if (!id || byId.has(id)) continue;
		byId.set(id, 1);
	}

	return [...byId.entries()].map(([service_id, quantity]) => ({ service_id, quantity }));
}

export function parseCreateBookingBody(body: {
	property_id?: string;
	check_in?: string;
	check_out?: string;
	guests?: number;
	guest?: {
		first_name?: string;
		last_name?: string;
		email?: string;
		phone?: string;
	};
	services?: { service_id?: string; quantity?: number }[];
	extra_service_ids?: string[];
}) {
	const property_id = body.property_id?.trim();
	const checkInDay = body.check_in ? toUtcDay(body.check_in) : null;
	const checkOutDay = body.check_out ? toUtcDay(body.check_out) : null;
	const guestsRaw = body.guests;

	const first_name = body.guest?.first_name?.trim() ?? '';
	const last_name = body.guest?.last_name?.trim() ?? '';
	const email = body.guest?.email?.trim().toLowerCase() ?? '';
	const phone = body.guest?.phone?.trim() || null;

	const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

	if (!property_id || !checkInDay || !checkOutDay || guestsRaw === undefined || guestsRaw === null) {
		return { ok: false as const, message: 'property_id, check_in and check_out are required.' };
	}
	if (!checkInDay.isValid || !checkOutDay.isValid || typeof guestsRaw !== 'number' || !Number.isInteger(guestsRaw) || guestsRaw <= 0) {
		return { ok: false as const, message: 'Invalid check_in, check_out or guests.' };
	}
	if (!first_name || !last_name) {
		return { ok: false as const, message: 'guest.first_name and guest.last_name are required.' };
	}
	if (!email || !isValidEmail(email)) {
		return { ok: false as const, message: 'A valid guest.email is required.' };
	}

	const serviceLines = mergeServiceLines(body.services, body.extra_service_ids);

	for (const line of serviceLines) {
		if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
			return { ok: false as const, message: 'Invalid service quantity.' };
		}
	}

	return {
		ok: true as const,
		input: {
			property_id,
			check_in: checkInDay.toJSDate(),
			check_out: checkOutDay.toJSDate(),
			guests: guestsRaw,
			guest: { first_name, last_name, email, phone },
			services: serviceLines,
		},
	};
}

export function createBookingErrorResponse(error: CreateBookingErrorCode) {
	switch (error) {
		case 'INVALID_SERVICE':
			return { message: 'One or more selected services are invalid.', status: 400 };
		case 'INVALID_SERVICE_QUANTITY':
			return { message: 'Quantity is not allowed for one or more selected services.', status: 400 };
		case 'UNAVAILABLE':
			return {
				message: 'Property is not available for the selected dates.',
				status: 409,
				body: { message: 'Property is not available for the selected dates.' },
			};
		case 'NOT_FOUND':
			return { message: 'Property not found', status: 404 };
		case 'INVALID_INPUT':
			return { message: 'Invalid check_in, check_out or guests.', status: 400 };
		case 'GUESTS_EXCEED':
			return { message: 'Guests exceed max guests for this property.', status: 400 };
		default:
			return { message: 'Could not create booking.', status: 500 };
	}
}
