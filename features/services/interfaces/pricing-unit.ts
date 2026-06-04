export const PricingUnit = {
	PER_STAY: 'PER_STAY',
	PER_NIGHT: 'PER_NIGHT',
	PER_GUEST: 'PER_GUEST',
	PER_GUEST_PER_NIGHT: 'PER_GUEST_PER_NIGHT',
} as const;

export type PricingUnit = (typeof PricingUnit)[keyof typeof PricingUnit];

export const PRICING_UNIT_LABELS: Record<PricingUnit, string> = {
	PER_STAY: 'Per stay',
	PER_NIGHT: 'Per night',
	PER_GUEST: 'Per guest',
	PER_GUEST_PER_NIGHT: 'Per guest / night',
};

export const PRICING_UNIT_OPTIONS = Object.entries(PRICING_UNIT_LABELS).map(([value, label]) => ({
	value: value as PricingUnit,
	label,
}));
