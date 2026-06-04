import type { PricingUnit } from './pricing-unit';

export type ServiceImage = {
	id: string;
	order: number;
	description: string | null;
	url: string | null;
};

export type Service = {
	id: string;
	name: string;
	description: string | null;
	price: number;
	quantitable_item: boolean;
	pricing_unit: PricingUnit;
	active: boolean;
	max_quantity: number | null;
	images: ServiceImage[];
};

export type HostService = Service & {
	property_count: number;
};

export type SelectedService = {
	service_id: string;
	quantity: number;
};

export type ServiceInput = {
	name: string;
	description?: string | null;
	price: number;
	quantitable_item?: boolean;
	pricing_unit?: PricingUnit;
	active?: boolean;
	max_quantity?: number | null;
};
