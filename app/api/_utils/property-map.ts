import type { Property as PropertyDTO } from '@/features/property/interfaces/property.interface';
import { formatUtcTimeOfDay } from '@/app/api/_utils/time-of-day';

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
	quantity: number | null;
	documents?: PropertyImageDocument[];
};

export type PropertyWithImages = {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	short_description: string | null;
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
	check_in_time: Date;
	check_out_time: Date;
	isPublished: boolean;
	created_at: Date;
	updated_at: Date;
	user_id: string;
	images: PropertyImageWithDocument[];
	amenities?: PropertyAmenityRow[];
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
	title: property.title,
	slug: property.slug,
	description: property.description ?? '',
	short_description: property.short_description ?? '',
	check_in_time: formatUtcTimeOfDay(property.check_in_time),
	check_out_time: formatUtcTimeOfDay(property.check_out_time),
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
	amenities: (property.amenities ?? []).map((a) => ({
		value: a.value,
		description: a.description ?? null,
		quantity: a.quantity ?? null,
		image_url: a.documents?.[0]?.url ?? null,
	})),
	amenity_ids: (property.amenities ?? []).map((a) => a.value),
	created_at: property.created_at.toISOString(),
	updated_at: property.updated_at.toISOString(),
	images: property.images.map(mapPropertyImage),
});
