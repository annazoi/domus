import type Stripe from 'stripe';
import { PaymentContext, getStripeClient, STRIPE_WEBHOOK_EVENTS } from '@/lib/integrations/stripe/config';
import {
	BookingAmountMismatchError,
	cancelBookingAndRelease,
	confirmPaidBooking,
	findBookingIdByPaymentIntent,
	getBookingIdFromMetadata,
	storePaymentIntentReference,
} from '@/lib/integrations/stripe/booking-payment';
import { centsToEuros } from '@/lib/integrations/stripe/fees';
import {
	applyChargeFeeBreakdown,
	linkPaymentIntent,
	markBookingPaymentFailed,
	markBookingPaymentRefunded,
	markBookingPaymentSucceeded,
} from '@/lib/integrations/stripe/payment-records';
import { handleAccountUpdated } from '@/lib/integrations/stripe/services/stripe-accounts.service';

function isBookingPayment(metadata: Stripe.Metadata | null | undefined) {
	return metadata?.context === PaymentContext.BOOKING_PAYMENT;
}

async function confirmBookingSafely(
	bookingId: string,
	data: { stripeSessionId?: string | null; paymentIntentId: string | null; paidAmountCents?: number | null },
) {
	try {
		await confirmPaidBooking(bookingId, data);
		return true;
	} catch (error) {
		if (error instanceof BookingAmountMismatchError) {
			console.error(`Booking ${bookingId} payment amount mismatch:`, error.message);
			await markBookingPaymentFailed({ bookingId });
			return false;
		}
		throw error;
	}
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

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
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

	if (paymentIntentId) {
		await linkPaymentIntent({ sessionId: session.id, bookingId, paymentIntentId });
	}

	await confirmBookingSafely(bookingId, {
		stripeSessionId: session.id,
		paymentIntentId,
		paidAmountCents: session.amount_total,
	});
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
	const bookingId = await resolveBookingIdFromPaymentIntent(paymentIntent);
	if (!bookingId) return;

	await storePaymentIntentReference(bookingId, paymentIntent.id);
	await linkPaymentIntent({ bookingId, paymentIntentId: paymentIntent.id });

	if (isBookingPayment(paymentIntent.metadata) && paymentIntent.status === 'succeeded') {
		await confirmBookingSafely(bookingId, {
			stripeSessionId: null,
			paymentIntentId: paymentIntent.id,
			paidAmountCents: paymentIntent.amount_received || paymentIntent.amount,
		});
	}
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
	const bookingId = await resolveBookingIdFromPaymentIntent(paymentIntent);
	if (!bookingId) return;

	await markBookingPaymentFailed({ paymentIntentId: paymentIntent.id, bookingId });
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

	await linkPaymentIntent({ bookingId, paymentIntentId });

	const sessions = await stripe.checkout.sessions.list({
		payment_intent: paymentIntentId,
		limit: 1,
	});

	const confirmed = await confirmBookingSafely(bookingId, {
		stripeSessionId: sessions.data[0]?.id ?? null,
		paymentIntentId,
		paidAmountCents: charge.amount,
	});

	if (confirmed) {
		await markBookingPaymentSucceeded({
			paymentIntentId,
			bookingId,
			chargeId: charge.id,
			receiptUrl: charge.receipt_url,
		});
	}
}

async function handleChargeUpdated(charge: Stripe.Charge) {
	const paymentIntentId =
		typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id ?? null;
	if (!paymentIntentId) return;

	const bookingId = await findBookingIdByPaymentIntent(paymentIntentId);
	if (!bookingId) return;

	const applicationFee = charge.application_fee_amount ?? 0;
	const transferId = typeof charge.transfer === 'string' ? charge.transfer : charge.transfer?.id ?? null;

	let stripeFeeCents = 0;
	let netCents = charge.amount - applicationFee;

	if (charge.balance_transaction) {
		const balanceTransactionId =
			typeof charge.balance_transaction === 'string'
				? charge.balance_transaction
				: charge.balance_transaction.id;
		try {
			const balanceTransaction = await getStripeClient().balanceTransactions.retrieve(balanceTransactionId);
			stripeFeeCents = balanceTransaction.fee;
			netCents = balanceTransaction.net;
		} catch (error) {
			console.error('Could not retrieve balance transaction:', error);
		}
	}

	const payoutCents = charge.amount - applicationFee;

	await applyChargeFeeBreakdown({
		paymentIntentId,
		chargeId: charge.id,
		stripeFeeAmount: centsToEuros(stripeFeeCents),
		netAmount: centsToEuros(netCents),
		payoutAmount: centsToEuros(payoutCents),
		transferId,
		receiptUrl: charge.receipt_url,
	});
}

async function handleChargeRefunded(charge: Stripe.Charge) {
	const paymentIntentId =
		typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id ?? null;

	if (!paymentIntentId) return;

	await markBookingPaymentRefunded({ paymentIntentId, chargeId: charge.id });

	const bookingId = await findBookingIdByPaymentIntent(paymentIntentId);
	if (!bookingId) return;

	await cancelBookingAndRelease(bookingId);
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
			await handleChargeUpdated(event.data.object as Stripe.Charge);
			break;
		case 'charge.refunded':
			await handleChargeRefunded(event.data.object as Stripe.Charge);
			break;
		default:
			break;
	}
}
