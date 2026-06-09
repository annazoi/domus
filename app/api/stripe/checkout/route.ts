import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { BookingStatus } from '@prisma/client';
import { assignAuthenticatedGuestToBooking } from '@/app/api/booking/ensure-guest-and-customer';
import {
	createBookingErrorResponse,
	createBookingRecord,
	findReusablePendingBooking,
	parseCreateBookingBody,
} from '@/app/api/booking/create-booking.service';
import { createCheckoutSession, getAppUrl, stripeCheckoutErrorResponse } from '@/lib/integrations/stripe';
import { prisma } from '@/lib/prisma';

interface CheckoutBody {
	booking_id?: string;
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
}

export async function POST(request: Request) {
	let body: CheckoutBody;
	try {
		body = (await request.json()) as CheckoutBody;
	} catch {
		return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
	}

	const appUrl = getAppUrl(request);
	let bookingId = body.booking_id?.trim() ?? '';

	if (!bookingId) {
		const parsed = parseCreateBookingBody(body);
		if (!parsed.ok) {
			return Response.json({ message: parsed.message }, { status: 400 });
		}

		const authenticatedUserId = getUserIdFromRequest(request);
		const reusable = await findReusablePendingBooking(parsed.input, { authenticatedUserId });
		if (reusable) {
			bookingId = reusable.id;
			if (authenticatedUserId) {
				const property = await prisma.property.findFirst({
					where: {
						OR: [{ id: parsed.input.property_id }, { slug: parsed.input.property_id }],
					},
					select: { user_id: true },
				});
				if (property) {
					await assignAuthenticatedGuestToBooking(reusable.id, {
						email: parsed.input.guest.email,
						first_name: parsed.input.guest.first_name,
						last_name: parsed.input.guest.last_name,
						phone: parsed.input.guest.phone,
						hostUserId: property.user_id,
						authenticatedUserId,
					});
				}
			}
		} else {
			const created = await createBookingRecord(parsed.input, {
				status: BookingStatus.PENDING,
				authenticatedUserId,
			});
			if (!created.ok) {
				const err = createBookingErrorResponse(created.error);
				return Response.json(err.body ?? { message: err.message }, { status: err.status });
			}
			bookingId = created.booking.id;
		}
	} else {
		const existing = await prisma.booking.findUnique({
			where: { id: bookingId },
			select: { id: true, status: true },
		});
		if (!existing) {
			return Response.json({ message: 'Booking not found.' }, { status: 404 });
		}
		if (existing.status !== BookingStatus.PENDING) {
			return Response.json({ message: 'Booking is not awaiting payment.' }, { status: 400 });
		}
	}

	const successUrl = `${appUrl}/bookings/${bookingId}?paid=1`;
	const cancelParams = new URLSearchParams({ cancelled: '1' });
	if (body.property_id) cancelParams.set('property_id', body.property_id);
	if (body.check_in) cancelParams.set('check_in', body.check_in);
	if (body.check_out) cancelParams.set('check_out', body.check_out);
	if (body.guests !== undefined) cancelParams.set('guests', String(body.guests));
	if (body.guest?.first_name) cancelParams.set('first_name', body.guest.first_name);
	if (body.guest?.last_name) cancelParams.set('last_name', body.guest.last_name);
	if (body.guest?.email) cancelParams.set('email', body.guest.email);
	if (body.guest?.phone) cancelParams.set('phone', body.guest.phone);

	const cancelUrl = `${appUrl}/confirm-and-pay?${cancelParams.toString()}`;

	try {
		const session = await createCheckoutSession({
			bookingId,
			successUrl,
			cancelUrl,
			customerEmail: body.guest?.email?.trim(),
		});

		return Response.json({
			checkout_url: session.checkout_url,
			session_id: session.session_id,
			booking_id: session.booking_id,
		});
	} catch (error) {
		const err = stripeCheckoutErrorResponse(error);
		if (err) {
			return Response.json(err.body, { status: err.status });
		}
		throw error;
	}
}
