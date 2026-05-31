import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe/client';
import { STRIPE_CONNECT_DEFAULT_COUNTRY } from '@/lib/stripe/constants';

export type StripeConnectStatus = {
	stripe_account_id: string | null;
	stripe_onboarding_completed: boolean;
	charges_enabled: boolean;
	payouts_enabled: boolean;
	details_submitted: boolean;
};

const disconnectedConnectStatus = (): StripeConnectStatus => ({
	stripe_account_id: null,
	stripe_onboarding_completed: false,
	charges_enabled: false,
	payouts_enabled: false,
	details_submitted: false,
});

function isStaleStripeAccountError(error: unknown): boolean {
	return (
		error instanceof Stripe.errors.StripeError &&
		(error.code === 'resource_missing' || error.code === 'account_invalid')
	);
}

async function clearStaleStripeAccount(userId: string) {
	await prisma.user.update({
		where: { id: userId },
		data: {
			stripe_account_id: null,
			stripe_onboarding_completed: false,
			charges_enabled: false,
			payouts_enabled: false,
		},
	});
}

export function mapAccountToStatus(account: Stripe.Account): Omit<StripeConnectStatus, 'stripe_account_id'> {
	const detailsSubmitted = account.details_submitted ?? false;
	const chargesEnabled = account.charges_enabled ?? false;
	const payoutsEnabled = account.payouts_enabled ?? false;

	return {
		stripe_onboarding_completed: detailsSubmitted && chargesEnabled && payoutsEnabled,
		charges_enabled: chargesEnabled,
		payouts_enabled: payoutsEnabled,
		details_submitted: detailsSubmitted,
	};
}

export async function syncUserStripeAccountStatus(userId: string, accountId: string) {
	const stripe = getStripeClient();
	const account = await stripe.accounts.retrieve(accountId);
	const status = mapAccountToStatus(account);

	await prisma.user.update({
		where: { id: userId },
		data: {
			stripe_account_id: account.id,
			stripe_onboarding_completed: status.stripe_onboarding_completed,
			charges_enabled: status.charges_enabled,
			payouts_enabled: status.payouts_enabled,
		},
	});

	return {
		stripe_account_id: account.id,
		...status,
	};
}

export async function getOrCreateExpressAccount(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			is_host: true,
			stripe_account_id: true,
		},
	});

	if (!user) {
		throw new Error('USER_NOT_FOUND');
	}
	if (!user.is_host) {
		throw new Error('NOT_A_HOST');
	}

	const stripe = getStripeClient();

	if (user.stripe_account_id) {
		try {
			await stripe.accounts.retrieve(user.stripe_account_id);
			return user.stripe_account_id;
		} catch (error) {
			if (!isStaleStripeAccountError(error)) {
				throw error;
			}
			await clearStaleStripeAccount(userId);
		}
	}

	const account = await stripe.accounts.create({
		type: 'express',
		country: STRIPE_CONNECT_DEFAULT_COUNTRY,
		email: user.email,
		capabilities: {
			card_payments: { requested: true },
			transfers: { requested: true },
		},
		metadata: {
			user_id: user.id,
		},
	});

	await prisma.user.update({
		where: { id: userId },
		data: { stripe_account_id: account.id },
	});

	return account.id;
}

export async function createOnboardingLink(userId: string, returnUrl: string, refreshUrl: string) {
	const accountId = await getOrCreateExpressAccount(userId);
	const stripe = getStripeClient();

	const accountLink = await stripe.accountLinks.create({
		account: accountId,
		type: 'account_onboarding',
		return_url: returnUrl,
		refresh_url: refreshUrl,
	});

	await syncUserStripeAccountStatus(userId, accountId);

	return {
		url: accountLink.url,
		stripe_account_id: accountId,
	};
}

export async function getConnectStatusForUser(userId: string): Promise<StripeConnectStatus> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			stripe_account_id: true,
			stripe_onboarding_completed: true,
			charges_enabled: true,
			payouts_enabled: true,
		},
	});

	if (!user) {
		throw new Error('USER_NOT_FOUND');
	}

	if (!user.stripe_account_id) {
		return disconnectedConnectStatus();
	}

	try {
		return await syncUserStripeAccountStatus(userId, user.stripe_account_id);
	} catch (error) {
		if (!isStaleStripeAccountError(error)) {
			throw error;
		}
		await clearStaleStripeAccount(userId);
		return disconnectedConnectStatus();
	}
}

export async function handleAccountUpdated(account: Stripe.Account) {
	const user = await prisma.user.findFirst({
		where: { stripe_account_id: account.id },
		select: { id: true },
	});

	if (!user) return;

	const status = mapAccountToStatus(account);
	await prisma.user.update({
		where: { id: user.id },
		data: {
			stripe_onboarding_completed: status.stripe_onboarding_completed,
			charges_enabled: status.charges_enabled,
			payouts_enabled: status.payouts_enabled,
		},
	});
}
