import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { propertyStore } from '@/store/property';

interface BookingPayload {
	propertyId: string;
	guestName: string;
	startDate: string;
	endDate: string;
}

export async function GET(request: Request) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const url = new URL(request.url);
	const hostFilter = url.searchParams.get('host_id');
	if (hostFilter && hostFilter !== 'me') return Response.json({ message: 'Forbidden' }, { status: 403 });

	const bookings = propertyStore.getBookings(hostId);
	const state = propertyStore.getState();
	const enriched = bookings.map((booking) => ({
		...booking,
		propertyTitle: state.properties.find((property) => property.id === booking.propertyId)?.title ?? 'Unknown property',
	}));
	return Response.json(enriched);
}

export async function POST(request: Request) {
	const body = (await request.json()) as BookingPayload;
	const booking = propertyStore.createBooking(body.propertyId, body.guestName, body.startDate, body.endDate);
	if (!booking) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json(booking, { status: 201 });
}
