export type PropertyStatus = 'draft' | 'published';

export interface PropertyDocument {
	id: string;
	user_id: string;
	filename: string;
	mimetype: string;
	size: number;
	url: string;
	path: string;
	type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
	order: number;
	created_at: string;
	updated_at: string;
	property_amenity_id: string | null;
}

export interface PropertyImage {
	id: string;
	user_id: string;
	property_id: string;
	document_id: string | null;
	description: string | null;
	created_at: string;
	document: PropertyDocument | null;
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
	short_description?: string;
	check_in_time: string;
	check_out_time: string;
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
	slug: string;
	description: string;
	short_description?: string;
	check_in_time: string;
	check_out_time: string;
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
