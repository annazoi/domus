import { BookingStatus } from '@prisma/client';
import { getStripeClient, PaymentContext } from '@/lib/integrations/stripe/config';
import {
	computePlatformFeeAmount,
	eurosToCents,
	STRIPE_CURRENCY,
} from '@/lib/integrations/stripe/fees';
import { StripeCheckoutError } from '@/lib/integrations/stripe/errors';
import { upsertPendingBookingPayment } from '@/lib/integrations/stripe/payment-records';
import { PriceLineType, type PriceSnapshot } from '@/lib/pricing/price-snapshot';
import { prisma } from '@/lib/prisma';

function parseSnapshot(value: unknown): PriceSnapshot | null {
	if (!value || typeof value !== 'object') return null;
	const snapshot = value as Partial<PriceSnapshot>;
	if (!Array.isArray(snapshot.lines) || typeof snapshot.total_cents !== 'number') return null;
	return snapshot as PriceSnapshot;
}

function buildLineItems(
	snapshot: PriceSnapshot,
	fallbackName: string,
	serviceImagesById?: Map<string, string>,
) {
	const items = snapshot.lines
		.filter((line) => line.amount > 0)
		.map((line) => {
			const imageUrl =
				line.type === PriceLineType.EXTRA_SERVICE && line.reference_uuid
					? serviceImagesById?.get(line.reference_uuid)
					: undefined;

			return {
				quantity: line.quantity > 0 ? line.quantity : 1,
				price_data: {
					currency: snapshot.currency || STRIPE_CURRENCY,
					unit_amount: eurosToCents(line.quantity > 0 ? line.unit_amount : line.amount),
					product_data: {
						name: line.label,
						...(imageUrl ? { images: [imageUrl] } : {}),
					},
				},
			};
		});

	if (items.length === 0) {
		items.push({
			quantity: 1,
			price_data: {
				currency: snapshot.currency || STRIPE_CURRENCY,
				unit_amount: snapshot.total_cents,
				product_data: { name: fallbackName },
			},
		});
	}

	return items;
}

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

	const snapshot = parseSnapshot(booking.price_snapshot);
	const amountCents = snapshot ? snapshot.total_cents : eurosToCents(Number(booking.total_price));
	if (amountCents <= 0) {
		throw new StripeCheckoutError('Invalid booking amount.', 'INVALID_AMOUNT');
	}

	const effectiveSnapshot: PriceSnapshot =
		snapshot ?? {
			currency: STRIPE_CURRENCY,
			nights: booking.nights ?? 0,
			lines: [
				{
					type: PriceLineType.ACCOMMODATION,
					label: booking.property.title,
					unit_amount: Number(booking.total_price),
					quantity: 1,
					amount: Number(booking.total_price),
				},
			],
			subtotal_accommodation: Number(booking.total_price),
			subtotal_extras: 0,
			fees: 0,
			discount_amount: 0,
			total: Number(booking.total_price),
			total_cents: amountCents,
		};

	const stripe = getStripeClient();
	const platformFeeAmount = computePlatformFeeAmount(amountCents);

	const extraServiceIds = effectiveSnapshot.lines
		.filter((line) => line.type === PriceLineType.EXTRA_SERVICE && line.reference_uuid)
		.map((line) => line.reference_uuid as string);

	const serviceImagesById = new Map<string, string>();
	if (extraServiceIds.length > 0) {
		const services = await prisma.service.findMany({
			where: { id: { in: extraServiceIds } },
			select: {
				id: true,
				images: {
					orderBy: { order: 'asc' },
					take: 1,
					select: { document: { select: { url: true } } },
				},
			},
		});
		for (const service of services) {
			const url = service.images[0]?.document?.url;
			if (url) serviceImagesById.set(service.id, url);
		}
	}

	const paymentMetadata: Record<string, string> = {
		booking_id: booking.id,
		host_user_id: booking.host_user_id,
		guest_user_id: booking.guest_user_id,
		property_id: booking.property_id,
		context: PaymentContext.BOOKING_PAYMENT,
		check_in: booking.check_in.toISOString().slice(0, 10),
		check_out: booking.check_out.toISOString().slice(0, 10),
		total_cents: String(amountCents),
		...(extraServiceIds.length > 0 ? { extra_service_ids: extraServiceIds.join(',') } : {}),
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
		line_items: buildLineItems(effectiveSnapshot, booking.property.title, serviceImagesById),
		payment_intent_data: {
			application_fee_amount: platformFeeAmount,
			transfer_data: {
				destination: booking.host.stripe_account_id,
			},
			metadata: paymentMetadata,
		},
	});

	if (session.amount_total !== amountCents) {
		try {
			await stripe.checkout.sessions.expire(session.id);
		} catch {
		}
		throw new StripeCheckoutError(
			'Checkout total does not match the quoted price. Please refresh your quote.',
			'INVALID_AMOUNT',
		);
	}

	if (!session.url) {
		throw new Error('Stripe did not return a checkout URL.');
	}

	await prisma.booking.update({
		where: { id: booking.id },
		data: { stripe_session_id: session.id },
	});

	await upsertPendingBookingPayment({
		bookingId: booking.id,
		guestUserId: booking.guest_user_id,
		hostUserId: booking.host_user_id,
		amount: Number(booking.total_price),
		currency: effectiveSnapshot.currency || STRIPE_CURRENCY,
		stripeSessionId: session.id,
		stripePaymentUrl: session.url,
	});

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

export async function getBalanceTransaction(balanceTransactionId: string) {
	return getStripeClient().balanceTransactions.retrieve(balanceTransactionId);
}

export async function refundPayment(chargeId: string) {
	return getStripeClient().refunds.create({ charge: chargeId });
}
