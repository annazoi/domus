import '@/config/load-env';
import Stripe from 'stripe';
import { environments } from '@/config/environments';

export const STRIPE_WEBHOOK_EVENTS = new Set<string>([
	'checkout.session.completed',
	'account.updated',
	'payment_intent.succeeded',
	'payment_intent.payment_failed',
	'charge.succeeded',
	'charge.updated',
	'charge.refunded',
]);

export const PaymentContext = {
	BOOKING_PAYMENT: 'BOOKING_PAYMENT',
} as const;

export type PaymentContext = (typeof PaymentContext)[keyof typeof PaymentContext];

let stripeClient: Stripe | null = null;

export function getStripeClient() {
	if (!environments.STRIPE_SECRET_KEY) {
		throw new Error('STRIPE_SECRET_KEY is not configured.');
	}
	if (!stripeClient) {
		stripeClient = new Stripe(environments.STRIPE_SECRET_KEY, {
			apiVersion: '2026-05-27.dahlia',
			typescript: true,
		});
	}
	return stripeClient;
}

export function constructStripeEvent(payload: string, signature: string) {
	const webhookSecret = environments.STRIPE_WEBHOOK_SECRET;
	if (!webhookSecret) {
		throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
	}
	return getStripeClient().webhooks.constructEvent(payload, signature, webhookSecret);
}
