export type PriceLineType = 'accommodation' | 'extra_service' | 'fee' | 'discount';

export interface PriceLine {
	type: PriceLineType;
	label: string;
	reference_uuid?: string;
	unit_amount: number;
	quantity: number;
	amount: number;
}

export interface PriceSnapshot {
	currency: string;
	nights: number;
	lines: PriceLine[];
	subtotal_accommodation: number;
	subtotal_extras: number;
	fees: number;
	discount_amount: number;
	total: number;
	total_cents: number;
}

export interface BookingQuoteRequest {
	property_id: string;
	check_in: string;
	check_out: string;
	guests: number;
	extra_service_ids?: string[];
	services?: { service_id: string; quantity: number }[];
}

export interface BookingQuoteResponse {
	isAvailable: boolean;
	property_id: string;
	property_title: string;
	snapshot: PriceSnapshot;
}
