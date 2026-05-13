import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { bookingsService } from './bookings.service';

interface BookingPayload {
	property_id: string;
	guest_name: string;
	start_date: string;
	end_date: string;
}

export async function GET(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const url = new URL(request.url);
	const guestFilter = url.searchParams.get('guest_id');
	const hostFilter = url.searchParams.get('host_id');

	if (guestFilter === 'me') {
		if (hostFilter && hostFilter !== 'me') return Response.json({ message: 'Forbidden' }, { status: 403 });
		const bookings = await bookingsService.listGuestBookings(userId);
		return Response.json(bookings);
	}

	if (hostFilter && hostFilter !== 'me') return Response.json({ message: 'Forbidden' }, { status: 403 });

	const bookings = await bookingsService.listHostBookings(userId);
	return Response.json(bookings);
}

export async function POST(request: Request) {
	const hostId = getUserIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const body = (await request.json()) as BookingPayload;
	const booking = await bookingsService.createBookingBlock({
		hostId,
		propertyId: body.property_id,
		startDate: body.start_date,
		endDate: body.end_date,
	});
	if (!booking) return Response.json({ message: 'Property not found' }, { status: 404 });
	if ('error' in booking) return Response.json({ message: 'Invalid start_date or end_date.' }, { status: 400 });
	return Response.json(booking, { status: 201 });
}
