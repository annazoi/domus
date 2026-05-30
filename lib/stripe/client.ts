import '@/config/load-env';
import Stripe from 'stripe';
import { environments } from '@/config/environments';

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
