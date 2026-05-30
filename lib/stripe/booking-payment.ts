import { BookingStatus, Reason } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
import { eachDayInRange } from '@/features/property-availability/utils/date';
import { prisma } from '@/lib/prisma';

type DbClient = Pick<
	PrismaClient,
	'propertyAvailability' | 'booking'
>;

function toUtcDayFromJsDate(d: Date) {
	return DateTime.fromJSDate(d, { zone: 'utc' }).startOf('day');
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

export async function confirmPaidBooking(
	bookingId: string,
	data: {
		stripeSessionId: string;
		paymentIntentId: string | null;
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

	await prisma.$transaction(async (tx) => {
		await tx.booking.update({
			where: { id: bookingId },
			data: {
				status: BookingStatus.CONFIRMED,
				stripe_session_id: data.stripeSessionId,
				...(data.paymentIntentId ? { payment_intent_id: data.paymentIntentId } : {}),
			},
		});

		await reserveBookingAvailability(booking, tx);
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
