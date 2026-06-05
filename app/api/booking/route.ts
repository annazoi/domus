import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { Prisma } from '@prisma/client';
import { BookingStatus } from '@prisma/client';
import {
	createBookingErrorResponse,
	createBookingRecord,
	parseCreateBookingBody,
} from '@/app/api/booking/create-booking.service';

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
	}

	const parsed = parseCreateBookingBody(body as Parameters<typeof parseCreateBookingBody>[0]);
	if (!parsed.ok) {
		return Response.json({ message: parsed.message }, { status: 400 });
	}

	try {
		const result = await createBookingRecord(parsed.input, {
			status: BookingStatus.PENDING,
			authenticatedUserId: getUserIdFromRequest(request),
		});

		if (!result.ok) {
			const err = createBookingErrorResponse(result.error);
			return Response.json(err.body ?? { message: err.message }, { status: err.status });
		}

		return Response.json({
			success: true,
			booking_id: result.booking.id,
			totalPrice: Number(result.booking.total_price),
		});
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
			return Response.json({ error: 'Could not save booking. Conflict on customer record.' }, { status: 409 });
		}
		throw e;
	}
}
