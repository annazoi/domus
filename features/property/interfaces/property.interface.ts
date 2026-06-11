import type { PropertyImage } from '@/features/property-images/interfaces/property-image.interfaces';
import type { PropertyBrandingTheme } from '@/app/(pages)/templates/_constants/property-branding-theme';

export interface PropertyAmenityEntry {
	value: string;
	description: string | null;
	selected?: boolean;
	quantity?: number | null;
	image_url?: string | null;
}

export interface PropertyApplianceEntry {
	id: string;
	title: string;
	description: string | null;
	order: number;
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
	welcome_message?: string;
	check_in_time: string;
	check_out_time: string;
	door_code?: string;
	safe_box_code?: string;
	house_rules_instructions?: string;
	privacy_policy?: string;
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
	logo_url?: string | null;
	logo_alt?: string | null;
	amenity_ids: string[];
	amenities: PropertyAmenityEntry[];
	appliances: PropertyApplianceEntry[];
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
	welcome_message?: string;
	check_in_time: string;
	check_out_time: string;
	door_code?: string;
	safe_box_code?: string;
	house_rules_instructions?: string;
	privacy_policy?: string;
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
