import type Stripe from 'stripe';
import { PaymentContext, getStripeClient, STRIPE_WEBHOOK_EVENTS } from '@/lib/integrations/stripe/config';
import {
	confirmPaidBooking,
	findBookingIdByPaymentIntent,
	getBookingIdFromMetadata,
	storePaymentIntentReference,
} from '@/lib/integrations/stripe/booking-payment';
import { handleAccountUpdated } from '@/lib/integrations/stripe/services/stripe-accounts.service';

function isBookingPayment(metadata: Stripe.Metadata | null | undefined) {
	return metadata?.context === PaymentContext.BOOKING_PAYMENT;
}

async function resolveBookingIdFromPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
	const fromMetadata = getBookingIdFromMetadata(paymentIntent.metadata as Record<string, string>);
	if (fromMetadata) return fromMetadata;

	const existing = await findBookingIdByPaymentIntent(paymentIntent.id);
	if (existing) return existing;

	const stripe = getStripeClient();
	const sessions = await stripe.checkout.sessions.list({
		payment_intent: paymentIntent.id,
		limit: 1,
	});

	const session = sessions.data[0];
	if (!session) return null;

	return (
		getBookingIdFromMetadata(session.metadata as Record<string, string>) ??
		(typeof session.client_reference_id === 'string' ? session.client_reference_id : null)
	);
}

async function confirmBookingFromCheckoutSession(session: Stripe.Checkout.Session) {
	if (session.payment_status !== 'paid') {
		return;
	}

	const bookingId =
		getBookingIdFromMetadata(session.metadata as Record<string, string>) ??
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

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
	await confirmBookingFromCheckoutSession(session);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
	const bookingId = await resolveBookingIdFromPaymentIntent(paymentIntent);
	if (!bookingId) return;

	await storePaymentIntentReference(bookingId, paymentIntent.id);

	if (isBookingPayment(paymentIntent.metadata) && paymentIntent.status === 'succeeded') {
		const sessionId =
			typeof paymentIntent.metadata?.stripe_session_id === 'string'
				? paymentIntent.metadata.stripe_session_id
				: null;

		await confirmPaidBooking(bookingId, {
			stripeSessionId: sessionId,
			paymentIntentId: paymentIntent.id,
		});
	}
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
	const bookingId = await resolveBookingIdFromPaymentIntent(paymentIntent);
	if (!bookingId) return;
}

async function handleChargeSucceeded(charge: Stripe.Charge) {
	const paymentIntentId =
		typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id ?? null;

	if (!paymentIntentId) return;

	const stripe = getStripeClient();
	const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

	if (!isBookingPayment(paymentIntent.metadata)) {
		return;
	}

	const bookingId = await resolveBookingIdFromPaymentIntent(paymentIntent);
	if (!bookingId) return;

	const sessions = await stripe.checkout.sessions.list({
		payment_intent: paymentIntentId,
		limit: 1,
	});

	await confirmPaidBooking(bookingId, {
		stripeSessionId: sessions.data[0]?.id ?? null,
		paymentIntentId,
	});
}

async function handleChargeRefunded(charge: Stripe.Charge) {
	const paymentIntentId =
		typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id ?? null;

	if (!paymentIntentId) return;

	const bookingId = await findBookingIdByPaymentIntent(paymentIntentId);
	if (!bookingId) return;
}

export async function dispatchStripeWebhookEvent(event: Stripe.Event) {
	if (!STRIPE_WEBHOOK_EVENTS.has(event.type)) {
		return;
	}

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
		case 'payment_intent.payment_failed':
			await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
			break;
		case 'charge.succeeded':
			await handleChargeSucceeded(event.data.object as Stripe.Charge);
			break;
		case 'charge.updated':
			break;
		case 'charge.refunded':
			await handleChargeRefunded(event.data.object as Stripe.Charge);
			break;
		default:
			break;
	}
}
