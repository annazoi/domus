import { BookingStatus } from '@prisma/client';
import { getStripeClient, PaymentContext } from '@/lib/integrations/stripe/config';
import {
	computePlatformFeeAmount,
	eurosToCents,
	STRIPE_CURRENCY,
} from '@/lib/integrations/stripe/fees';
import { StripeCheckoutError } from '@/lib/integrations/stripe/errors';
import { prisma } from '@/lib/prisma';

export async function createCheckoutSession(params: {
	bookingId: string;
	successUrl: string;
	cancelUrl: string;
	customerEmail?: string;
}) {
	const booking = await prisma.booking.findUnique({
		where: { id: params.bookingId },
		include: {
			property: { select: { title: true } },
			guest: { select: { email: true } },
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
	const platformFeeAmount = computePlatformFeeAmount(amountCents);
	const paymentMetadata = {
		booking_id: booking.id,
		host_user_id: booking.host_user_id,
		property_id: booking.property_id,
		context: PaymentContext.BOOKING_PAYMENT,
	};

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

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		success_url: params.successUrl,
		cancel_url: params.cancelUrl,
		client_reference_id: booking.id,
		customer_email: params.customerEmail ?? booking.guest.email,
		metadata: paymentMetadata,
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
			application_fee_amount: platformFeeAmount,
			transfer_data: {
				destination: booking.host.stripe_account_id,
			},
			metadata: paymentMetadata,
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

export async function getCheckoutSession(sessionId: string) {
	return getStripeClient().checkout.sessions.retrieve(sessionId);
}

export async function getPaymentIntent(paymentIntentId: string) {
	return getStripeClient().paymentIntents.retrieve(paymentIntentId);
}

export async function getCharge(chargeId: string) {
	return getStripeClient().charges.retrieve(chargeId);
}

export async function refundPayment(chargeId: string) {
	return getStripeClient().refunds.create({ charge: chargeId });
}
