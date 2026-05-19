export type Service = {
	id: string;
	name: string;
	description: string | null;
	price: number;
};

export type SelectedService = {
	service_id: string;
	quantity: number;
};
