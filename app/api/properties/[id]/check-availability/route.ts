import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { toUtcDay } from '@/features/property-availability/utils/date';
import { checkAvailabilityInternal } from '@/app/api/booking/check-availability.service';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const url = new URL(request.url);
	const checkInRaw = url.searchParams.get('check_in');
	const checkOutRaw = url.searchParams.get('check_out');
	const guestsRaw = url.searchParams.get('guests');

	if (!checkInRaw || !checkOutRaw || !guestsRaw) {
		return Response.json({ message: 'check_in, check_out and guests are required.' }, { status: 400 });
	}

	const checkIn = toUtcDay(checkInRaw);
	const checkOut = toUtcDay(checkOutRaw);
	const guests = Number.parseInt(guestsRaw, 10);

	const result = await checkAvailabilityInternal({
		property_id: id,
		check_in: checkIn.toJSDate(),
		check_out: checkOut.toJSDate(),
		guests,
		hostId: getHostIdFromRequest(request),
	});

	if (result.kind === 'invalid_input') {
		return Response.json({ message: 'Invalid query params.' }, { status: 400 });
	}
	if (result.kind === 'not_found') {
		return Response.json({ message: 'Property not found' }, { status: 404 });
	}
	if (result.kind === 'guests_exceed_capacity') {
		return Response.json({ message: 'Guests exceed max guests for this property.' }, { status: 400 });
	}

	return Response.json({
		isAvailable: result.isAvailable,
		totalPrice: result.totalPrice,
	});
}
