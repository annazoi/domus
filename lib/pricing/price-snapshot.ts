export const PriceLineType = {
	ACCOMMODATION: 'accommodation',
	EXTRA_SERVICE: 'extra_service',
	FEE: 'fee',
	DISCOUNT: 'discount',
} as const;

export type PriceLineType = (typeof PriceLineType)[keyof typeof PriceLineType];

export type PriceLine = {
	type: PriceLineType;
	label: string;
	reference_uuid?: string;
	unit_amount: number;
	quantity: number;
	amount: number;
};

export type PriceSnapshot = {
	currency: string;
	nights: number;
	lines: PriceLine[];
	subtotal_accommodation: number;
	subtotal_extras: number;
	fees: number;
	discount_amount: number;
	total: number;
	total_cents: number;
};

export function roundMoney(value: number) {
	return Math.round(value * 100) / 100;
}

export function toCents(value: number) {
	return Math.round(value * 100);
}
