import { PaymentStatus } from '@prisma/client';
import type { Prisma, PrismaClient } from '@prisma/client';
import { PaymentContext } from '@/lib/integrations/stripe/config';
import { prisma } from '@/lib/prisma';

type DbClient = Pick<PrismaClient, 'payment'>;

export async function upsertPendingBookingPayment(
	params: {
		bookingId: string;
		guestUserId: string;
		hostUserId: string;
		amount: number;
		currency: string;
		stripeSessionId: string;
		stripePaymentUrl: string | null;
		platformFeeAmount: number;
		stripeFeeEstimate: number;
		payoutEstimate: number;
	},
	db: DbClient = prisma,
) {
	return db.payment.upsert({
		where: { stripe_session_id: params.stripeSessionId },
		update: {
			amount: params.amount,
			currency: params.currency,
			stripe_payment_url: params.stripePaymentUrl,
			platform_fee_amount: params.platformFeeAmount,
			stripe_fee_amount: params.stripeFeeEstimate,
			payout_amount: params.payoutEstimate,
			net_amount: params.payoutEstimate,
		},
		create: {
			booking_id: params.bookingId,
			guest_user_id: params.guestUserId,
			host_user_id: params.hostUserId,
			amount: params.amount,
			currency: params.currency,
			status: PaymentStatus.PENDING,
			context: PaymentContext.BOOKING_PAYMENT,
			stripe_session_id: params.stripeSessionId,
			stripe_payment_url: params.stripePaymentUrl,
			platform_fee_amount: params.platformFeeAmount,
			stripe_fee_amount: params.stripeFeeEstimate,
			payout_amount: params.payoutEstimate,
			net_amount: params.payoutEstimate,
		},
	});
}

function paymentMatch(params: {
	paymentIntentId?: string | null;
	sessionId?: string | null;
	bookingId?: string | null;
}): Prisma.PaymentWhereInput {
	const or: Prisma.PaymentWhereInput[] = [];
	if (params.paymentIntentId) or.push({ stripe_payment_intent: params.paymentIntentId });
	if (params.sessionId) or.push({ stripe_session_id: params.sessionId });
	if (params.bookingId) or.push({ booking_id: params.bookingId });
	return or.length > 0 ? { OR: or } : { id: '__none__' };
}

export async function linkPaymentIntent(
	params: { sessionId?: string | null; bookingId?: string | null; paymentIntentId: string },
	db: DbClient = prisma,
) {
	await db.payment.updateMany({
		where: {
			...paymentMatch({ sessionId: params.sessionId, bookingId: params.bookingId }),
			stripe_payment_intent: null,
		},
		data: { stripe_payment_intent: params.paymentIntentId },
	});
}

export async function markBookingPaymentSucceeded(
	params: {
		paymentIntentId?: string | null;
		sessionId?: string | null;
		bookingId?: string | null;
		chargeId?: string | null;
		receiptUrl?: string | null;
	},
	db: DbClient = prisma,
) {
	await db.payment.updateMany({
		where: {
			...paymentMatch(params),
			status: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] },
		},
		data: {
			status: PaymentStatus.SUCCEEDED,
			...(params.paymentIntentId ? { stripe_payment_intent: params.paymentIntentId } : {}),
			...(params.chargeId ? { stripe_charge_id: params.chargeId } : {}),
			...(params.receiptUrl ? { stripe_receipt_url: params.receiptUrl } : {}),
		},
	});
}

export async function applyChargeFeeBreakdown(
	params: {
		paymentIntentId?: string | null;
		chargeId: string;
		stripeFeeAmount: number;
		netAmount: number;
		payoutAmount: number;
		transferId?: string | null;
		receiptUrl?: string | null;
	},
	db: DbClient = prisma,
) {
	await db.payment.updateMany({
		where: paymentMatch({ paymentIntentId: params.paymentIntentId }),
		data: {
			stripe_charge_id: params.chargeId,
			stripe_fee_amount: params.stripeFeeAmount,
			net_amount: params.netAmount,
			payout_amount: params.payoutAmount,
			...(params.transferId ? { stripe_transfer_id: params.transferId } : {}),
			...(params.receiptUrl ? { stripe_receipt_url: params.receiptUrl } : {}),
		},
	});
}

export async function markBookingPaymentRefunded(
	params: { paymentIntentId?: string | null; chargeId?: string | null },
	db: DbClient = prisma,
) {
	await db.payment.updateMany({
		where: {
			...paymentMatch({ paymentIntentId: params.paymentIntentId }),
			status: { not: PaymentStatus.REFUNDED },
		},
		data: {
			status: PaymentStatus.REFUNDED,
			...(params.chargeId ? { stripe_charge_id: params.chargeId } : {}),
		},
	});
}

export async function markBookingPaymentFailed(
	params: { paymentIntentId?: string | null; sessionId?: string | null; bookingId?: string | null },
	db: DbClient = prisma,
) {
	await db.payment.updateMany({
		where: {
			...paymentMatch(params),
			status: PaymentStatus.PENDING,
		},
		data: { status: PaymentStatus.FAILED },
	});
}

export async function findPaymentByPaymentIntent(paymentIntentId: string, db: DbClient = prisma) {
	return db.payment.findFirst({ where: { stripe_payment_intent: paymentIntentId } });
}
