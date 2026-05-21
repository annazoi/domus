export interface Booking {
	id: string;
	property_id: string;
	host_id: string;
	guest_name: string;
	start_date: string;
	end_date: string;
	status: 'pending' | 'confirmed' | 'cancelled';
	property_title: string;
}

export interface HostBookingDetail extends Booking {
	guest_user_id: string;
	guests: number;
	total_price: number;
	check_in_iso: string;
	check_out_iso: string;
	created_at: string;
	updated_at: string;
	property: {
		slug: string;
		address: string;
		city: string;
		country: string;
		room_type: string;
		property_type: string;
	};
	guest: {
		first_name: string;
		last_name: string;
		email: string;
		phone: string | null;
	};
	customer: {
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
}
