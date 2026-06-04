import { BookingStatus } from '@prisma/client';
import {
	createBookingErrorResponse,
	createBookingRecord,
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

		const created = await createBookingRecord(parsed.input, { status: BookingStatus.PENDING });
		if (!created.ok) {
			const err = createBookingErrorResponse(created.error);
			return Response.json(err.body ?? { message: err.message }, { status: err.status });
		}
		bookingId = created.booking.id;
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
	const cancelUrl = `${appUrl}/confirm-and-pay?${new URLSearchParams({
		...(body.property_id ? { property_id: body.property_id } : {}),
		...(body.check_in ? { check_in: body.check_in } : {}),
		...(body.check_out ? { check_out: body.check_out } : {}),
		...(body.guests !== undefined ? { guests: String(body.guests) } : {}),
		...(body.guest?.first_name ? { first_name: body.guest.first_name } : {}),
		...(body.guest?.last_name ? { last_name: body.guest.last_name } : {}),
		...(body.guest?.email ? { email: body.guest.email } : {}),
		...(body.guest?.phone ? { phone: body.guest.phone } : {}),
		cancelled: '1',
	}).toString()}`;

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
