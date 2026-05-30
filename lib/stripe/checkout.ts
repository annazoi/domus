import { BookingStatus } from '@prisma/client';
import { getStripeClient } from '@/lib/stripe/client';
import {
	computePlatformFeeAmount,
	eurosToCents,
	STRIPE_CURRENCY,
} from '@/lib/stripe/constants';
import { prisma } from '@/lib/prisma';

export class StripeCheckoutError extends Error {
	constructor(
		message: string,
		readonly code:
			| 'BOOKING_NOT_FOUND'
			| 'BOOKING_NOT_PAYABLE'
			| 'HOST_NOT_READY'
			| 'INVALID_AMOUNT',
	) {
		super(message);
		this.name = 'StripeCheckoutError';
	}
}

export async function createCheckoutSessionForBooking(params: {
	bookingId: string;
	successUrl: string;
	cancelUrl: string;
}) {
	const booking = await prisma.booking.findUnique({
		where: { id: params.bookingId },
		include: {
			property: { select: { title: true } },
			host: {
				select: {
					stripe_account_id: true,
					charges_enabled: true,
				},
			},
		},
	});

	if (!booking) {
		throw new StripeCheckoutError('Booking not found.', 'BOOKING_NOT_FOUND');
	}

	if (booking.status !== BookingStatus.PENDING) {
		throw new StripeCheckoutError('Booking is not awaiting payment.', 'BOOKING_NOT_PAYABLE');
	}

	if (!booking.host.stripe_account_id || !booking.host.charges_enabled) {
		throw new StripeCheckoutError('Host is not ready to accept payments.', 'HOST_NOT_READY');
	}

	const amountCents = eurosToCents(Number(booking.total_price));
	if (amountCents <= 0) {
		throw new StripeCheckoutError('Invalid booking amount.', 'INVALID_AMOUNT');
	}

	const stripe = getStripeClient();

	if (booking.stripe_session_id) {
		const existing = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
		if (existing.status === 'open' && existing.url) {
			return {
				checkout_url: existing.url,
				session_id: existing.id,
				booking_id: booking.id,
			};
		}
	}

	const applicationFeeAmount = computePlatformFeeAmount(amountCents);

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		success_url: params.successUrl,
		cancel_url: params.cancelUrl,
		client_reference_id: booking.id,
		metadata: {
			booking_id: booking.id,
			host_user_id: booking.host_user_id,
			property_id: booking.property_id,
		},
		line_items: [
			{
				quantity: 1,
				price_data: {
					currency: STRIPE_CURRENCY,
					unit_amount: amountCents,
					product_data: {
						name: booking.property.title,
						description: `Stay ${booking.check_in.toISOString().slice(0, 10)} – ${booking.check_out.toISOString().slice(0, 10)}`,
					},
				},
			},
		],
		payment_intent_data: {
			application_fee_amount: applicationFeeAmount,
			transfer_data: {
				destination: booking.host.stripe_account_id,
			},
			metadata: {
				booking_id: booking.id,
				host_user_id: booking.host_user_id,
				property_id: booking.property_id,
			},
		},
	});

	await prisma.booking.update({
		where: { id: booking.id },
		data: { stripe_session_id: session.id },
	});

	if (!session.url) {
		throw new Error('Stripe did not return a checkout URL.');
	}

	return {
		checkout_url: session.url,
		session_id: session.id,
		booking_id: booking.id,
	};
}
