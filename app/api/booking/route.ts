import { BookingStatus, Prisma, Reason } from '@prisma/client';
import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { checkAvailabilityInternal } from '@/app/api/booking/check-availability.service';
import { eachDayInRange, toUtcDay } from '@/features/property-availability/utils/date';
import { prisma } from '@/lib/prisma';

class BookingUnavailableError extends Error {
	override name = 'BookingUnavailableError';
}

interface CreateBookingBody {
	property_id?: string;
	check_in?: string;
	check_out?: string;
	guests?: number;
}

export async function POST(request: Request) {
	const guestId = getUserIdFromRequest(request);
	if (!guestId) {
		return Response.json({ message: 'Unauthorized' }, { status: 401 });
	}

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

	if (!property_id || !checkInDay || !checkOutDay || guestsRaw === undefined || guestsRaw === null) {
		return Response.json({ message: 'property_id, check_in and check_out are required.' }, { status: 400 });
	}
	if (!checkInDay.isValid || !checkOutDay.isValid || typeof guestsRaw !== 'number' || !Number.isInteger(guestsRaw) || guestsRaw <= 0) {
		return Response.json({ message: 'Invalid check_in, check_out or guests.' }, { status: 400 });
	}

	const guests = guestsRaw;

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

				const created = await tx.booking.create({
					data: {
						property_id: verified.propertyId,
						guest_id: guestId,
						check_in,
						check_out,
						guests,
						total_price: verified.totalPrice,
						status: BookingStatus.CONFIRMED,
					},
				});

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
		if (e instanceof BookingUnavailableError) {
			return Response.json({ error: 'Property not available' }, { status: 400 });
		}
		if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2034') {
			return Response.json({ error: 'Property not available' }, { status: 400 });
		}
		throw e;
	}
}
