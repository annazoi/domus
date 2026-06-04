import { PaymentStatus } from '@prisma/client';
import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { cancelBookingAndRelease, refundPayment } from '@/lib/integrations/stripe';
import { markBookingPaymentRefunded } from '@/lib/integrations/stripe/payment-records';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;

	const booking = await prisma.booking.findUnique({
		where: { id },
		select: {
			id: true,
			status: true,
			host_user_id: true,
			guest_user_id: true,
			payments: {
				where: { status: PaymentStatus.SUCCEEDED },
				select: { id: true, stripe_charge_id: true, stripe_payment_intent: true },
			},
		},
	});

	if (!booking) {
		return Response.json({ message: 'Booking not found.' }, { status: 404 });
	}

	if (booking.host_user_id !== userId && booking.guest_user_id !== userId) {
		return Response.json({ message: 'Forbidden' }, { status: 403 });
	}

	const succeededPayment = booking.payments.find((payment) => payment.stripe_charge_id);

	if (succeededPayment?.stripe_charge_id) {
		try {
			await refundPayment(succeededPayment.stripe_charge_id);
			await markBookingPaymentRefunded({
				paymentIntentId: succeededPayment.stripe_payment_intent,
				chargeId: succeededPayment.stripe_charge_id,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not refund payment.';
			return Response.json({ message }, { status: 502 });
		}
	}

	await cancelBookingAndRelease(booking.id);

	return Response.json({ id: booking.id, status: 'CANCELLED', refunded: Boolean(succeededPayment) });
}
