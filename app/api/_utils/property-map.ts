import type { Property as PropertyDTO } from '@/features/property/interfaces/property.interface';
import type { PropertyBrandingTheme } from '@/app/(pages)/templates/_constants/property-branding-theme';
import { formatUtcTimeOfDay } from '@/app/api/_utils/time-of-day';
import { hostNameSlugFromParts } from '@/lib/slug/host-name-slug';

export type PropertyImageDocument = {
	id: string;
	user_id: string;
	filename: string;
	mimetype: string;
	size: number;
	url: string;
	path: string;
	type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
	order: number;
	created_at: Date;
	updated_at: Date;
	property_amenity_id: string | null;
	property_appliance_id: string | null;
};

export type PropertyImageWithDocument = {
	id: string;
	user_id: string;
	property_id: string;
	document_id: string | null;
	description: string | null;
	created_at: Date;
	document: PropertyImageDocument | null;
	is_cover: boolean;
	order: number;
};

export type PropertyAmenityRow = {
	value: string;
	description: string | null;
	selected: boolean;
	quantity: number | null;
	documents?: PropertyImageDocument[];
};

export type PropertyApplianceRow = {
	id: string;
	title: string;
	description: string | null;
	order: number;
	documents?: PropertyImageDocument[];
};

export type PropertyHostRow = {
	id: string;
	first_name: string;
	last_name: string;
	host_name: string | null;
	bio: string | null;
	avatar: { url: string } | null;
};

export type PropertyWithImages = {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	short_description: string | null;
	location_access: string | null;
	welcome_message: string | null;
	property_type: string;
	max_guests: number;
	bedrooms: number;
	beds: number;
	bathrooms: number;
	country: string;
	city: string;
	address: string;
	latitude: number;
	longitude: number;
	minimum_advance_reservation_hours: number | null;
	minimum_rental_period_nights: number | null;
	maximum_rental_period_nights: number | null;
	check_in_time: Date;
	check_out_time: Date;
	door_code: string | null;
	safe_box_code: string | null;
	wifi_password: string | null;
	house_rules_instructions: string | null;
	privacy_policy: string | null;
	isPublished: boolean;
	branding_theme: PropertyBrandingTheme;
	logo?: PropertyImageDocument | null;
	logo_alt?: string | null;
	created_at: Date;
	updated_at: Date;
	user_id: string;
	user?: PropertyHostRow;
	images: PropertyImageWithDocument[];
	amenities?: PropertyAmenityRow[];
	appliances?: PropertyApplianceRow[];
};

const mapPropertyImage = (image: PropertyImageWithDocument) => ({
	...image,
	created_at: image.created_at.toISOString(),
	document: image.document
		? {
				...image.document,
				created_at: image.document.created_at.toISOString(),
				updated_at: image.document.updated_at.toISOString(),
		  }
		: null,
});

export const mapProperty = (property: PropertyWithImages): PropertyDTO => ({
	id: property.id,
	host_id: property.user_id,
	host: property.user
		? {
				first_name: property.user.first_name,
				last_name: property.user.last_name,
				host_name:
					property.user.host_name?.trim() ||
					hostNameSlugFromParts(property.user.first_name, property.user.last_name),
				bio: property.user.bio,
				avatar_url: property.user.avatar?.url ?? null,
			}
		: null,
	title: property.title,
	slug: property.slug,
	description: property.description ?? '',
	short_description: property.short_description ?? '',
	location_access: property.location_access ?? '',
	welcome_message: property.welcome_message ?? '',
	check_in_time: formatUtcTimeOfDay(property.check_in_time),
	check_out_time: formatUtcTimeOfDay(property.check_out_time),
	door_code: property.door_code ?? '',
	safe_box_code: property.safe_box_code ?? '',
	wifi_password: property.wifi_password ?? '',
	house_rules_instructions: property.house_rules_instructions ?? '',
	privacy_policy: property.privacy_policy ?? '',
	property_type: property.property_type,
	room_type: '',
	max_guests: property.max_guests,
	bedrooms: property.bedrooms,
	beds: property.beds,
	bathrooms: property.bathrooms,
	country: property.country,
	city: property.city,
	address: property.address,
	lat: property.latitude,
	lng: property.longitude,
	isVisible: property.isPublished,
	minimum_advance_reservation_hours: property.minimum_advance_reservation_hours,
	minimum_rental_period_nights: property.minimum_rental_period_nights,
	maximum_rental_period_nights: property.maximum_rental_period_nights,
	branding_theme: property.branding_theme,
	logo_url: property.logo?.url ?? null,
	logo_alt: property.logo_alt?.trim() || null,
	amenities: (property.amenities ?? []).map((a) => ({
		value: a.value,
		description: a.description ?? null,
		selected: a.selected,
		quantity: a.quantity ?? null,
		image_url: a.documents?.[0]?.url ?? null,
	})),
	amenity_ids: (property.amenities ?? []).filter((a) => a.selected).map((a) => a.value),
	appliances: (property.appliances ?? []).map((appliance) => ({
		id: appliance.id,
		title: appliance.title,
		description: appliance.description ?? null,
		order: appliance.order,
		image_url: appliance.documents?.[0]?.url ?? null,
	})),
	created_at: property.created_at.toISOString(),
	updated_at: property.updated_at.toISOString(),
	images: property.images.map(mapPropertyImage),
});
