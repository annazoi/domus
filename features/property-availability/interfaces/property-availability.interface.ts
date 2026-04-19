export interface AvailabilityDay {
	id: string;
	property_id: string;
	date: string;
	is_available: boolean;
	custom_price: number | null;
}
