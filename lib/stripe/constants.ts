import { environments } from '@/config/environments';

export const STRIPE_PLATFORM_FEE_PERCENT = Number(environments.STRIPE_PLATFORM_FEE_PERCENT ?? 10);

export const STRIPE_CURRENCY = (environments.STRIPE_CURRENCY ?? 'eur').toLowerCase();

export const STRIPE_CONNECT_DEFAULT_COUNTRY = (environments.STRIPE_CONNECT_DEFAULT_COUNTRY ?? 'IE').toUpperCase();

export function computePlatformFeeAmount(amountCents: number) {
	return Math.round((amountCents * STRIPE_PLATFORM_FEE_PERCENT) / 100);
}

export function eurosToCents(amount: number) {
	return Math.round(amount * 100);
}
