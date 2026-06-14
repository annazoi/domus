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
		const message =
			result.reason === 'too_soon'
				? 'Check-in is too soon for this property.'
				: result.reason === 'stay_too_short'
					? 'Stay is shorter than the minimum rental period.'
					: result.reason === 'stay_too_long'
						? 'Stay is longer than the maximum rental period.'
						: 'Invalid query params.';
		return Response.json({ message }, { status: 400 });
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
