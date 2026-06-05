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

export const PRICING_UNIT_DESCRIPTIONS: Record<PricingUnit, string> = {
	PER_STAY: 'Charged once for the entire booking.',
	PER_NIGHT: 'Multiplied by the number of nights.',
	PER_GUEST: 'Multiplied by the number of guests.',
	PER_GUEST_PER_NIGHT: 'Multiplied by guests × nights.',
};

export const PRICING_UNIT_OPTIONS = Object.entries(PRICING_UNIT_LABELS).map(([value, label]) => ({
	value: value as PricingUnit,
	label,
}));
