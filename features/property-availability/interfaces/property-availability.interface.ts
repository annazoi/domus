export interface AvailabilityDay {
	id: string;
	property_id: string;
	date: string;
	price: number;
	is_available: boolean;
	reason: 'BLOCKED' | 'MAINTENANCE' | 'BOOKED' | null;
}
