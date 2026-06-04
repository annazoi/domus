import type { PricingUnit } from '@prisma/client';

export type ServiceInput = {
	name: string;
	description?: string | null;
	price: number;
	quantitable_item?: boolean;
	pricing_unit?: PricingUnit;
	active?: boolean;
	max_quantity?: number | null;
};

export type ServiceImageRow = {
	id: string;
	order: number;
	description: string | null;
	url: string | null;
};

export type ServiceRow = {
	id: string;
	name: string;
	description: string | null;
	price: number;
	quantitable_item: boolean;
	pricing_unit: PricingUnit;
	active: boolean;
	max_quantity: number | null;
	images: ServiceImageRow[];
};

export type HostServiceRow = ServiceRow & {
	property_count: number;
};

export type PropertyServiceLinksInput = {
	service_ids: string[];
};
