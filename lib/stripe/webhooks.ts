import type Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe/client';
import {
	confirmPaidBooking,
	findBookingIdByPaymentIntent,
	storePaymentIntentReference,
} from '@/lib/stripe/booking-payment';
import { handleAccountUpdated } from '@/lib/stripe/connect';

function getBookingIdFromMetadata(metadata: Stripe.Metadata | null | undefined) {
	const bookingId = metadata?.booking_id?.trim();
	return bookingId && bookingId.length > 0 ? bookingId : null;
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
	const bookingId =
		getBookingIdFromMetadata(session.metadata) ??
		(typeof session.client_reference_id === 'string' ? session.client_reference_id : null);

	if (!bookingId) {
		throw new Error('Missing booking_id on checkout session.');
	}

	const paymentIntentId =
		typeof session.payment_intent === 'string'
			? session.payment_intent
			: session.payment_intent?.id ?? null;

	await confirmPaidBooking(bookingId, {
		stripeSessionId: session.id,
		paymentIntentId,
	});
}

export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
	const paymentIntentId = paymentIntent.id;
	const bookingId = getBookingIdFromMetadata(paymentIntent.metadata);

	if (bookingId) {
		await storePaymentIntentReference(bookingId, paymentIntentId);
		return;
	}

	const existingBookingId = await findBookingIdByPaymentIntent(paymentIntentId);
	if (existingBookingId) return;

	const stripe = getStripeClient();
	const sessions = await stripe.checkout.sessions.list({
		payment_intent: paymentIntentId,
		limit: 1,
	});

	const session = sessions.data[0];
	if (!session) return;

	const sessionBookingId =
		getBookingIdFromMetadata(session.metadata) ??
		(typeof session.client_reference_id === 'string' ? session.client_reference_id : null);

	if (sessionBookingId) {
		await storePaymentIntentReference(sessionBookingId, paymentIntentId);
	}
}

export async function dispatchStripeWebhookEvent(event: Stripe.Event) {
	switch (event.type) {
		case 'checkout.session.completed':
			await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
			break;
		case 'account.updated':
			await handleAccountUpdated(event.data.object as Stripe.Account);
			break;
		case 'payment_intent.succeeded':
			await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
			break;
		default:
			break;
	}
}

export function constructStripeEvent(payload: string, signature: string) {
	const stripe = getStripeClient();
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!webhookSecret) {
		throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
	}
	return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
