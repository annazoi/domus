export type ServiceInput = {
	name: string;
	description?: string | null;
	price: number;
	quantitable_item?: boolean;
};

export type ServiceRow = {
	id: string;
	name: string;
	description: string | null;
	price: number;
	quantitable_item: boolean;
};

export type HostServiceRow = ServiceRow & {
	property_count: number;
};

export type PropertyServiceLinksInput = {
	service_ids: string[];
};
