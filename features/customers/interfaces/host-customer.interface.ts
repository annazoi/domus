export interface HostCustomerRow {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone: string | null;
	vat_number: string | null;
	notes: string | null;
	address: string | null;
	city: string | null;
	state: string | null;
	zip: string | null;
	country: string | null;
	booking_count: number;
	total_spent: number;
}

export type UpdateHostCustomerInput = {
	first_name: string;
	last_name: string;
	email: string;
	phone: string | null;
	vat_number: string | null;
	notes: string | null;
	address: string | null;
	city: string | null;
	state: string | null;
	zip: string | null;
	country: string | null;
};
