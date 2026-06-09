import { PricingUnit } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
import { checkAvailabilityInternal } from '@/app/api/booking/check-availability.service';
import { prisma } from '@/lib/prisma';
import {
	PriceLineType,
	roundMoney,
	toCents,
	type PriceLine,
	type PriceSnapshot,
} from '@/lib/pricing/price-snapshot';
import { STRIPE_CURRENCY } from '@/lib/integrations/stripe/fees';

export type BookingExtraInput = {
	service_id: string;
	quantity: number;
};

export type BookingPricingInput = {
	property_id: string;
	check_in: Date;
	check_out: Date;
	guests: number;
	extras?: BookingExtraInput[];
	hostId?: string | null;
};

export type BookingPriceError =
	| 'invalid_input'
	| 'not_found'
	| 'guests_exceed_capacity'
	| 'unavailable'
	| 'invalid_service'
	| 'invalid_service_quantity';

export type BookingPriceResult =
	| { kind: 'error'; error: BookingPriceError }
	| {
			kind: 'ok';
			propertyId: string;
			hostUserId: string;
			propertyTitle: string;
			extras: { service_id: string; quantity: number; unit_price: number }[];
			snapshot: PriceSnapshot;
	  };

type DbClient = Pick<
	PrismaClient,
	'property' | 'propertyAvailability' | 'booking' | 'service' | 'propertyService'
>;

function nightsBetween(checkIn: Date, checkOut: Date) {
	const start = DateTime.fromJSDate(checkIn, { zone: 'utc' }).startOf('day');
	const end = DateTime.fromJSDate(checkOut, { zone: 'utc' }).startOf('day');
	return Math.trunc(end.diff(start, 'days').days);
}

function extraQuantityMultiplier(unit: PricingUnit, nights: number, guests: number) {
	switch (unit) {
		case PricingUnit.PER_NIGHT:
			return nights;
		case PricingUnit.PER_GUEST:
			return guests;
		case PricingUnit.PER_GUEST_PER_NIGHT:
			return nights * guests;
		case PricingUnit.PER_STAY:
		default:
			return 1;
	}
}

export async function calculateBookingPrice(
	input: BookingPricingInput,
	db: DbClient = prisma,
): Promise<BookingPriceResult> {
	const availability = await checkAvailabilityInternal(
		{
			property_id: input.property_id,
			check_in: input.check_in,
			check_out: input.check_out,
			guests: input.guests,
			hostId: input.hostId,
		},
		db,
	);

	if (availability.kind === 'invalid_input') return { kind: 'error', error: 'invalid_input' };
	if (availability.kind === 'not_found') return { kind: 'error', error: 'not_found' };
	if (availability.kind === 'guests_exceed_capacity') {
		return { kind: 'error', error: 'guests_exceed_capacity' };
	}
	if (!availability.isAvailable || availability.totalPrice === null) {
		return { kind: 'error', error: 'unavailable' };
	}

	const property = await db.property.findUnique({
		where: { id: availability.propertyId },
		select: { title: true },
	});

	const nights = nightsBetween(input.check_in, input.check_out);
	const subtotalAccommodation = roundMoney(availability.totalPrice);

	const lines: PriceLine[] = [
		{
			type: PriceLineType.ACCOMMODATION,
			label: `${property?.title ?? 'Accommodation'} · ${nights} night${nights === 1 ? '' : 's'}`,
			reference_uuid: availability.propertyId,
			unit_amount: subtotalAccommodation,
			quantity: 1,
			amount: subtotalAccommodation,
		},
	];

	const requestedExtras = (input.extras ?? []).filter((extra) => extra.service_id.length > 0);
	const resolvedExtras: { service_id: string; quantity: number; unit_price: number }[] = [];
	let subtotalExtras = 0;

	if (requestedExtras.length > 0) {
		const serviceIds = [...new Set(requestedExtras.map((extra) => extra.service_id))];

		const links = await db.propertyService.findMany({
			where: { property_id: availability.propertyId, service_id: { in: serviceIds } },
			select: { service_id: true },
		});
		const linkedIds = new Set(links.map((link) => link.service_id));

		const services = await db.service.findMany({
			where: { id: { in: serviceIds }, active: true },
			select: {
				id: true,
				name: true,
				price: true,
				quantitable_item: true,
				pricing_unit: true,
				max_quantity: true,
			},
		});
		const serviceById = new Map(services.map((service) => [service.id, service]));

		for (const id of serviceIds) {
			if (!linkedIds.has(id) || !serviceById.has(id)) {
				return { kind: 'error', error: 'invalid_service' };
			}
		}

		for (const extra of requestedExtras) {
			const service = serviceById.get(extra.service_id);
			if (!service) return { kind: 'error', error: 'invalid_service' };

			const guestQuantity = extra.quantity;
			if (!service.quantitable_item && guestQuantity !== 1) {
				return { kind: 'error', error: 'invalid_service_quantity' };
			}
			if (service.max_quantity != null && guestQuantity > service.max_quantity) {
				return { kind: 'error', error: 'invalid_service_quantity' };
			}
			if (!Number.isInteger(guestQuantity) || guestQuantity <= 0) {
				return { kind: 'error', error: 'invalid_service_quantity' };
			}

			const unitPrice = roundMoney(Number(service.price));
			const multiplier = extraQuantityMultiplier(service.pricing_unit, nights, input.guests) * guestQuantity;
			const amount = roundMoney(unitPrice * multiplier);

			lines.push({
				type: PriceLineType.EXTRA_SERVICE,
				label: service.name,
				reference_uuid: service.id,
				unit_amount: unitPrice,
				quantity: multiplier,
				amount,
			});

			subtotalExtras = roundMoney(subtotalExtras + amount);
			resolvedExtras.push({ service_id: service.id, quantity: guestQuantity, unit_price: unitPrice });
		}
	}

	const fees = 0;
	const discountAmount = 0;
	const total = roundMoney(subtotalAccommodation + subtotalExtras + fees - discountAmount);

	const snapshot: PriceSnapshot = {
		currency: STRIPE_CURRENCY,
		nights,
		lines,
		subtotal_accommodation: subtotalAccommodation,
		subtotal_extras: subtotalExtras,
		fees,
		discount_amount: discountAmount,
		total,
		total_cents: toCents(total),
	};

	return {
		kind: 'ok',
		propertyId: availability.propertyId,
		hostUserId: availability.hostUserId,
		propertyTitle: property?.title ?? 'Accommodation',
		extras: resolvedExtras,
		snapshot,
	};
}
