export type PropertyServiceInput = {
	id?: string;
	name: string;
	description?: string | null;
	price: number;
};

export type ServiceRow = {
	id: string;
	name: string;
	description: string | null;
	price: number;
};
