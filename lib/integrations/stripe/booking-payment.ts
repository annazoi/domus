import { BookingStatus, Reason } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
import { eachDayInRange } from '@/features/property-availability/utils/date';
import { sendBookingConfirmationEmails } from '@/lib/email/booking-confirmation-emails';
import { eurosToCents } from '@/lib/integrations/stripe/fees';
import type { PriceSnapshot } from '@/lib/pricing/price-snapshot';
import { prisma } from '@/lib/prisma';

type DbClient = Pick<PrismaClient, 'propertyAvailability' | 'booking'>;

export class BookingAmountMismatchError extends Error {
	override name = 'BookingAmountMismatchError';
}

function toUtcDayFromJsDate(d: Date) {
	return DateTime.fromJSDate(d, { zone: 'utc' }).startOf('day');
}

function expectedTotalCents(booking: { price_snapshot: unknown; total_price: { toString(): string } }) {
	const snapshot = booking.price_snapshot as Partial<PriceSnapshot> | null;
	if (snapshot && typeof snapshot.total_cents === 'number') {
		return snapshot.total_cents;
	}
	return eurosToCents(Number(booking.total_price));
}

export async function reserveBookingAvailability(
	booking: {
		id: string;
		property_id: string;
		host_user_id: string;
		check_in: Date;
		check_out: Date;
	},
	db: DbClient = prisma,
) {
	const checkInDay = toUtcDayFromJsDate(booking.check_in);
	const checkOutDay = toUtcDayFromJsDate(booking.check_out);
	const days = eachDayInRange(checkInDay, checkOutDay);

	await Promise.all(
		days.map((day) =>
			db.propertyAvailability.upsert({
				where: {
					property_id_date: {
						property_id: booking.property_id,
						date: day.toJSDate(),
					},
				},
				update: {
					user_id: booking.host_user_id,
					is_available: false,
					reason: Reason.BOOKED,
				},
				create: {
					property_id: booking.property_id,
					user_id: booking.host_user_id,
					date: day.toJSDate(),
					price: 0,
					is_available: false,
					reason: Reason.BOOKED,
				},
			}),
		),
	);
}

export async function releaseBookingAvailability(
	booking: { property_id: string; check_in: Date; check_out: Date },
	db: DbClient = prisma,
) {
	const checkInDay = toUtcDayFromJsDate(booking.check_in);
	const checkOutDay = toUtcDayFromJsDate(booking.check_out);

	await db.propertyAvailability.updateMany({
		where: {
			property_id: booking.property_id,
			date: { gte: checkInDay.toJSDate(), lt: checkOutDay.toJSDate() },
			reason: Reason.BOOKED,
		},
		data: { is_available: true, reason: null },
	});
}

export async function confirmPaidBooking(
	bookingId: string,
	data: {
		stripeSessionId?: string | null;
		paymentIntentId: string | null;
		paidAmountCents?: number | null;
	},
) {
	const booking = await prisma.booking.findUnique({
		where: { id: bookingId },
		select: {
			id: true,
			status: true,
			property_id: true,
			host_user_id: true,
			check_in: true,
			check_out: true,
			total_price: true,
			price_snapshot: true,
		},
	});

	if (!booking) {
		throw new Error('BOOKING_NOT_FOUND');
	}

	if (booking.status === BookingStatus.CONFIRMED) {
		return booking;
	}

	if (booking.status === BookingStatus.CANCELLED) {
		throw new Error('BOOKING_CANCELLED');
	}

	if (data.paidAmountCents != null) {
		const expected = expectedTotalCents(booking);
		if (data.paidAmountCents !== expected) {
			throw new BookingAmountMismatchError(
				`Paid amount ${data.paidAmountCents} does not match quoted total ${expected}.`,
			);
		}
	}

	await prisma.$transaction(async (tx) => {
		await tx.booking.update({
			where: { id: bookingId },
			data: {
				status: BookingStatus.CONFIRMED,
				...(data.stripeSessionId ? { stripe_session_id: data.stripeSessionId } : {}),
				...(data.paymentIntentId ? { payment_intent_id: data.paymentIntentId } : {}),
			},
		});

		await reserveBookingAvailability(booking, tx);
	});

	void sendBookingConfirmationEmails(bookingId).catch((error) => {
		console.error(`Failed to send booking confirmation emails for ${bookingId}:`, error);
	});

	return booking;
}

export async function storePaymentIntentReference(bookingId: string, paymentIntentId: string) {
	const booking = await prisma.booking.findUnique({
		where: { id: bookingId },
		select: { id: true, payment_intent_id: true },
	});

	if (!booking) return;

	if (booking.payment_intent_id === paymentIntentId) return;

	await prisma.booking.update({
		where: { id: bookingId },
		data: { payment_intent_id: paymentIntentId },
	});
}

export async function findBookingIdByPaymentIntent(paymentIntentId: string) {
	const booking = await prisma.booking.findFirst({
		where: { payment_intent_id: paymentIntentId },
		select: { id: true },
	});
	return booking?.id ?? null;
}

export async function findBookingIdByStripeSession(stripeSessionId: string) {
	const booking = await prisma.booking.findFirst({
		where: { stripe_session_id: stripeSessionId },
		select: { id: true },
	});
	return booking?.id ?? null;
}

export function getBookingIdFromMetadata(metadata: Record<string, string> | null | undefined) {
	const bookingId = metadata?.booking_id?.trim();
	return bookingId && bookingId.length > 0 ? bookingId : null;
}

export async function cancelBookingAndRelease(bookingId: string) {
	const booking = await prisma.booking.findUnique({
		where: { id: bookingId },
		select: { id: true, status: true, property_id: true, check_in: true, check_out: true },
	});

	if (!booking || booking.status === BookingStatus.CANCELLED) {
		return booking;
	}

	await prisma.$transaction(async (tx) => {
		await tx.booking.update({
			where: { id: bookingId },
			data: { status: BookingStatus.CANCELLED },
		});
		await releaseBookingAvailability(booking, tx);
	});

	return booking;
}
