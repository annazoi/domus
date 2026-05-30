import { BookingStatus, Prisma, Reason } from '@prisma/client';
import { checkAvailabilityInternal } from '@/app/api/booking/check-availability.service';
import { ensureGuestUserAndCustomerForHost } from '@/app/api/booking/ensure-guest-and-customer';
import { eachDayInRange, toUtcDay } from '@/features/property-availability/utils/date';
import { prisma } from '@/lib/prisma';

class BookingUnavailableError extends Error {
	override name = 'BookingUnavailableError';
}

interface BookingServiceLine {
	service_id?: string;
	quantity?: number;
}

interface CreateBookingBody {
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
	services?: BookingServiceLine[];
}

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export async function POST(request: Request) {
	let body: CreateBookingBody;
	try {
		body = (await request.json()) as CreateBookingBody;
	} catch {
		return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
	}

	const property_id = body.property_id?.trim();
	const checkInDay = body.check_in ? toUtcDay(body.check_in) : null;
	const checkOutDay = body.check_out ? toUtcDay(body.check_out) : null;
	const guestsRaw = body.guests;

	const first_name = body.guest?.first_name?.trim() ?? '';
	const last_name = body.guest?.last_name?.trim() ?? '';
	const email = body.guest?.email?.trim().toLowerCase() ?? '';
	const phone = body.guest?.phone?.trim() || null;

	if (!property_id || !checkInDay || !checkOutDay || guestsRaw === undefined || guestsRaw === null) {
		return Response.json({ message: 'property_id, check_in and check_out are required.' }, { status: 400 });
	}
	if (!checkInDay.isValid || !checkOutDay.isValid || typeof guestsRaw !== 'number' || !Number.isInteger(guestsRaw) || guestsRaw <= 0) {
		return Response.json({ message: 'Invalid check_in, check_out or guests.' }, { status: 400 });
	}
	if (!first_name || !last_name) {
		return Response.json({ message: 'guest.first_name and guest.last_name are required.' }, { status: 400 });
	}
	if (!email || !isValidEmail(email)) {
		return Response.json({ message: 'A valid guest.email is required.' }, { status: 400 });
	}

	const guests = guestsRaw;

	const serviceLines = (body.services ?? [])
		.map((line) => ({
			service_id: line.service_id?.trim() ?? '',
			quantity: line.quantity ?? 1,
		}))
		.filter((line) => line.service_id.length > 0);

	for (const line of serviceLines) {
		if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
			return Response.json({ message: 'Invalid service quantity.' }, { status: 400 });
		}
	}

	const check_in = checkInDay.toJSDate();
	const check_out = checkOutDay.toJSDate();

	const preTx = await checkAvailabilityInternal({
		property_id,
		check_in,
		check_out,
		guests,
	});

	if (preTx.kind === 'invalid_input') {
		return Response.json({ message: 'Invalid check_in, check_out or guests.' }, { status: 400 });
	}
	if (preTx.kind === 'not_found') {
		return Response.json({ message: 'Property not found' }, { status: 404 });
	}
	if (preTx.kind === 'guests_exceed_capacity') {
		return Response.json({ message: 'Guests exceed max guests for this property.' }, { status: 400 });
	}
	if (!preTx.isAvailable || preTx.totalPrice === null) {
		return Response.json({ error: 'Property not available' }, { status: 400 });
	}

	try {
		const booking = await prisma.$transaction(
			async (tx) => {
				const verified = await checkAvailabilityInternal(
					{
						property_id,
						check_in,
						check_out,
						guests,
					},
					tx,
				);

				if (verified.kind !== 'ok' || !verified.isAvailable || verified.totalPrice === null) {
					throw new BookingUnavailableError();
				}

				const { guestUserId, customerId } = await ensureGuestUserAndCustomerForHost(tx, {
					email,
					first_name,
					last_name,
					phone,
					hostUserId: verified.hostUserId,
				});

				let totalPrice = verified.totalPrice;
				let serviceCatalog: Awaited<ReturnType<typeof tx.service.findMany>> = [];

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
						check_in,
						check_out,
						guests,
						total_price: totalPrice,
						status: BookingStatus.CONFIRMED,
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

				const days = eachDayInRange(checkInDay, checkOutDay);
				await Promise.all(
					days.map((day) =>
						tx.propertyAvailability.upsert({
							where: {
								property_id_date: {
									property_id: verified.propertyId,
									date: day.toJSDate(),
								},
							},
							update: {
								user_id: verified.hostUserId,
								is_available: false,
								reason: Reason.BOOKED,
							},
							create: {
								property_id: verified.propertyId,
								user_id: verified.hostUserId,
								date: day.toJSDate(),
								price: 0,
								is_available: false,
								reason: Reason.BOOKED,
							},
						}),
					),
				);

				return created;
			},
			{
				isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
			},
		);

		return Response.json({
			success: true,
			booking_id: booking.id,
			totalPrice: Number(booking.total_price),
		});
	} catch (e) {
		if (e instanceof Error && e.message === 'INVALID_SERVICE') {
			return Response.json({ message: 'One or more selected services are invalid.' }, { status: 400 });
		}
		if (e instanceof Error && e.message === 'INVALID_SERVICE_QUANTITY') {
			return Response.json({ message: 'Quantity is not allowed for one or more selected services.' }, { status: 400 });
		}
		if (e instanceof BookingUnavailableError) {
			return Response.json({ error: 'Property not available' }, { status: 400 });
		}
		if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2034') {
			return Response.json({ error: 'Property not available' }, { status: 400 });
		}
		if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
			return Response.json({ error: 'Could not save booking. Conflict on customer record.' }, { status: 409 });
		}
		throw e;
	}
}
