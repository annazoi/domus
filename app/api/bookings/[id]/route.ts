import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { bookingsService } from '../bookings.service';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const body = (await request.json()) as Parameters<typeof bookingsService.updateHostBooking>[2];

	const result = await bookingsService.updateHostBooking(userId, id, body);
	if (!result) return Response.json({ message: 'Booking not found' }, { status: 404 });
	if ('error' in result) {
		if (result.error === 'invalid_dates') {
			return Response.json({ message: 'Check-out must be after check-in.' }, { status: 400 });
		}
		if (result.error === 'invalid_guests') {
			return Response.json({ message: 'Guests must be at least 1.' }, { status: 400 });
		}
		if (result.error === 'invalid_price') {
			return Response.json({ message: 'Total price must be zero or greater.' }, { status: 400 });
		}
		if (result.error === 'invalid_status') {
			return Response.json({ message: 'Invalid booking status.' }, { status: 400 });
		}
		return Response.json({ message: 'First name, last name, and email are required.' }, { status: 400 });
	}

	return Response.json(result);
}
