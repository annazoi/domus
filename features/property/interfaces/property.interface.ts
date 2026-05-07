import type { PropertyImage } from '@/features/property-images/interfaces/property-image.interfaces';
import type { PropertyBrandingTheme } from '@/app/(pages)/templates/_constants/property-branding-theme';

export interface PropertyAmenityEntry {
	value: string;
	description: string | null;
	selected?: boolean;
	quantity?: number | null;
	image_url?: string | null;
}

export interface Property {
	id: string;
	host_id: string;
	title: string;
	slug: string;
	description: string;
	short_description?: string;
	location_access?: string;
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
	branding_theme: PropertyBrandingTheme;
	amenity_ids: string[];
	amenities: PropertyAmenityEntry[];
	created_at: string;
	updated_at: string;
	images: PropertyImage[];
}

export interface UpsertPropertyInput {
	title: string;
	slug: string;
	description: string;
	short_description?: string;
	location_access?: string;
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
