import { BookingStatus, Prisma } from '@prisma/client';
import { checkAvailabilityInternal } from '@/app/api/booking/check-availability.service';
import { ensureGuestUserAndCustomerForHost } from '@/app/api/booking/ensure-guest-and-customer';
import { toUtcDay } from '@/features/property-availability/utils/date';
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

export async function createBookingRecord(
	input: CreateBookingInput,
	options: { status?: BookingStatus } = {},
): Promise<CreateBookingResult> {
	const status = options.status ?? BookingStatus.PENDING;
	const serviceLines = input.services ?? [];

	const preTx = await checkAvailabilityInternal({
		property_id: input.property_id,
		check_in: input.check_in,
		check_out: input.check_out,
		guests: input.guests,
	});

	if (preTx.kind === 'invalid_input') {
		return { ok: false, error: 'INVALID_INPUT' };
	}
	if (preTx.kind === 'not_found') {
		return { ok: false, error: 'NOT_FOUND' };
	}
	if (preTx.kind === 'guests_exceed_capacity') {
		return { ok: false, error: 'GUESTS_EXCEED' };
	}
	if (!preTx.isAvailable || preTx.totalPrice === null) {
		return { ok: false, error: 'UNAVAILABLE' };
	}

	try {
		const booking = await prisma.$transaction(
			async (tx) => {
				const verified = await checkAvailabilityInternal(
					{
						property_id: input.property_id,
						check_in: input.check_in,
						check_out: input.check_out,
						guests: input.guests,
					},
					tx,
				);

				if (verified.kind !== 'ok' || !verified.isAvailable || verified.totalPrice === null) {
					throw new BookingUnavailableError();
				}

				const { guestUserId, customerId } = await ensureGuestUserAndCustomerForHost(tx, {
					email: input.guest.email,
					first_name: input.guest.first_name,
					last_name: input.guest.last_name,
					phone: input.guest.phone,
					hostUserId: verified.hostUserId,
				});

				let totalPrice = verified.totalPrice;
				let serviceCatalog: { id: string; price: Prisma.Decimal; quantitable_item: boolean }[] = [];

				if (serviceLines.length > 0) {
					const serviceIds = [...new Set(serviceLines.map((line) => line.service_id))];
					const links = await tx.propertyService.findMany({
						where: {
							property_id: verified.propertyId,
							service_id: { in: serviceIds },
						},
						select: { service_id: true },
					});
					if (links.length !== serviceIds.length) {
						throw new Error('INVALID_SERVICE');
					}
					serviceCatalog = await tx.service.findMany({
						where: { id: { in: serviceIds } },
						select: { id: true, price: true, quantitable_item: true },
					});
					if (serviceCatalog.length !== serviceIds.length) {
						throw new Error('INVALID_SERVICE');
					}
					const priceById = new Map(serviceCatalog.map((svc) => [svc.id, Number(svc.price)]));
					const quantitableById = new Map(serviceCatalog.map((svc) => [svc.id, svc.quantitable_item]));

					for (const line of serviceLines) {
						const unitPrice = priceById.get(line.service_id);
						if (unitPrice === undefined) continue;
						if (!quantitableById.get(line.service_id) && line.quantity !== 1) {
							throw new Error('INVALID_SERVICE_QUANTITY');
						}
						totalPrice += unitPrice * line.quantity;
					}
				}

				const created = await tx.booking.create({
					data: {
						property_id: verified.propertyId,
						host_user_id: verified.hostUserId,
						guest_user_id: guestUserId,
						customer_id: customerId,
						check_in: input.check_in,
						check_out: input.check_out,
						guests: input.guests,
						total_price: totalPrice,
						status,
					},
				});

				if (serviceLines.length > 0) {
					const priceById = new Map(serviceCatalog.map((svc) => [svc.id, svc.price]));

					await Promise.all(
						serviceLines.map((line) => {
							const unitPrice = priceById.get(line.service_id);
							if (!unitPrice) return Promise.resolve();
							return tx.serviceOrder.create({
								data: {
									user_id: guestUserId,
									service_id: line.service_id,
									booking_id: created.id,
									customer_id: customerId,
									quantity: line.quantity,
									unit_price: unitPrice,
								},
							});
						}),
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

	const serviceLines = (body.services ?? [])
		.map((line) => ({
			service_id: line.service_id?.trim() ?? '',
			quantity: line.quantity ?? 1,
		}))
		.filter((line) => line.service_id.length > 0);

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
			return { message: 'Property not available', status: 400, body: { error: 'Property not available' } };
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
