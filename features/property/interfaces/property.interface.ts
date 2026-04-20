import type { PropertyImage } from '@/features/property-images/interfaces/property-image.interfaces';

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
	isVisible: boolean;
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
	isVisible: boolean;
}
