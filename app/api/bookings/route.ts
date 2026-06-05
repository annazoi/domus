import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { parsePaginationParams } from '@/lib/pagination';
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
		const paginationParams = parsePaginationParams(url.searchParams);
		if (paginationParams) {
			const result = await bookingsService.listGuestBookingsPaginated(
				userId,
				paginationParams.page,
				paginationParams.pageSize,
			);
			return Response.json(result);
		}
		const bookings = await bookingsService.listGuestBookings(userId);
		return Response.json(bookings);
	}

	if (hostFilter && hostFilter !== 'me') return Response.json({ message: 'Forbidden' }, { status: 403 });

	const paginationParams = parsePaginationParams(url.searchParams);
	if (paginationParams) {
		const customerId = url.searchParams.get('customer_id')?.trim() || undefined;
		const propertyId = url.searchParams.get('property_id')?.trim() || undefined;
		const dateFrom = url.searchParams.get('date_from')?.trim() || undefined;
		const dateTo = url.searchParams.get('date_to')?.trim() || undefined;
		const search = url.searchParams.get('q')?.trim() || undefined;
		const sort = url.searchParams.get('sort') === 'created_at' ? 'created_at' : 'check_in';
		const excludeCancelled = url.searchParams.get('exclude_cancelled') === '1';
		const result = await bookingsService.listHostBookingsPaginated(
			userId,
			paginationParams.page,
			paginationParams.pageSize,
			{ customerId, propertyId, dateFrom, dateTo, search, orderBy: sort, excludeCancelled },
		);
		return Response.json(result);
	}

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
