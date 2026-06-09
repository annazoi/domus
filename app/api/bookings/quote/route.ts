import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { mergeServiceLines } from '@/app/api/booking/create-booking.service';
import { toUtcDay } from '@/features/property-availability/utils/date';
import { calculateBookingPrice, type BookingPriceError } from '@/lib/pricing/booking-pricing.service';

interface QuoteBody {
	property_id?: string;
	check_in?: string;
	check_out?: string;
	guests?: number;
	services?: { service_id?: string; quantity?: number }[];
	extra_service_ids?: string[];
}

const PRICE_ERROR_RESPONSE: Record<BookingPriceError, { message: string; status: number }> = {
	invalid_input: { message: 'Invalid check_in, check_out or guests.', status: 400 },
	not_found: { message: 'Property not found.', status: 404 },
	guests_exceed_capacity: { message: 'Guests exceed max guests for this property.', status: 400 },
	unavailable: { message: 'Property is not available for the selected dates.', status: 409 },
	invalid_service: { message: 'One or more selected services are invalid.', status: 400 },
	invalid_service_quantity: { message: 'Quantity is not allowed for one or more selected services.', status: 400 },
};

export async function POST(request: Request) {
	let body: QuoteBody;
	try {
		body = (await request.json()) as QuoteBody;
	} catch {
		return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
	}

	const propertyId = body.property_id?.trim();
	const checkInDay = body.check_in ? toUtcDay(body.check_in) : null;
	const checkOutDay = body.check_out ? toUtcDay(body.check_out) : null;
	const guests = body.guests;

	if (!propertyId || !checkInDay?.isValid || !checkOutDay?.isValid || typeof guests !== 'number') {
		return Response.json({ message: 'property_id, check_in, check_out and guests are required.' }, { status: 400 });
	}

	const extras = mergeServiceLines(body.services, body.extra_service_ids);

	const result = await calculateBookingPrice({
		property_id: propertyId,
		check_in: checkInDay.toJSDate(),
		check_out: checkOutDay.toJSDate(),
		guests,
		extras,
		hostId: getUserIdFromRequest(request),
	});

	if (result.kind === 'error') {
		const mapped = PRICE_ERROR_RESPONSE[result.error];
		const available = result.error !== 'unavailable';
		return Response.json(
			{ message: mapped.message, isAvailable: available ? undefined : false },
			{ status: mapped.status },
		);
	}

	return Response.json({
		isAvailable: true,
		property_id: result.propertyId,
		property_title: result.propertyTitle,
		snapshot: result.snapshot,
	});
}
