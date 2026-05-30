export type Service = {
	id: string;
	name: string;
	description: string | null;
	price: number;
	quantifiable_item: boolean;
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
	quantifiable_item?: boolean;
};
