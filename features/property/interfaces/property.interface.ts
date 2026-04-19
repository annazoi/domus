export type PropertyStatus = 'draft' | 'published';

export interface PropertyImage {
	id: string;
	property_id: string;
	url: string;
	is_cover: boolean;
	order: number;
}

export interface Amenity {
	id: string;
	label: string;
}

export interface AvailabilityDay {
	id: string;
	property_id: string;
	date: string;
	is_available: boolean;
	custom_price: number | null;
}

export interface Booking {
	id: string;
	property_id: string;
	host_id: string;
	guest_name: string;
	start_date: string;
	end_date: string;
	status: 'pending' | 'confirmed' | 'cancelled';
}

export interface Property {
	id: string;
	host_id: string;
	title: string;
	slug: string;
	description: string;
	property_type: string;
	room_type: string;
	max_guests: number;
	bedrooms: number;
	beds: number;
	bathrooms: number;
	country: string;
	city: string;
	address: string;
	lat: number | null;
	lng: number | null;
	cleaning_fee: number;
	status: PropertyStatus;
	amenity_ids: string[];
	created_at: string;
	updated_at: string;
	images: PropertyImage[];
}

export interface UpsertPropertyInput {
	title: string;
	description: string;
	property_type: string;
	room_type: string;
	max_guests: number;
	bedrooms: number;
	beds: number;
	bathrooms: number;
	country: string;
	city: string;
	address: string;
	lat?: number | null;
	lng?: number | null;
	cleaning_fee: number;
	status: PropertyStatus;
}
