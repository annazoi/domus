export interface Booking {
	id: string;
	property_id: string;
	host_id: string;
	guest_name: string;
	start_date: string;
	end_date: string;
	status: 'pending' | 'confirmed' | 'cancelled';
}
