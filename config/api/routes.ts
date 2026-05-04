import type { PropertyAmenityQuery } from '@/features/property-amenities/interfaces/property-amenities.interfaces';

const toSearchParams = <T extends object>(query: T) =>
	new URLSearchParams(
		Object.entries(query as Record<string, unknown>)
			.filter(([, value]) => value !== undefined && value !== null)
			.map(([key, value]) => [key, String(value)]),
	).toString();

export const ApiRoutes = {
	auth: {
		login: '/auth/sign-in',
		register: '/auth/sign-up',
	},
	users: {
		prefix: '/users',
		user: (id: string) => `/users/${id}`,
		me: '/users/me',
	},
	properties: {
		prefix: '/properties',
		property: (id: string) => `/properties/${id}`,
		branding: (id: string) => `/properties/${id}/branding`,
		checkAvailability: (id: string, check_in: string, check_out: string, guests: number) =>
			`/properties/${id}/check-availability?${toSearchParams({ check_in, check_out, guests })}`,
		unavailableDays: (id: string) => `/properties/${id}/unavailable-days`,
		listMine: '/properties?host_id=me',
	},
	images: {
		prefix: '/images',
		image: (id: string) => `/images/${id}`,
	},
	availability: {
		byProperty: (propertyId: string) => `/properties/${propertyId}/availability`,
		listByProperty: (propertyId: string, start?: string, end?: string) => {
			const query = toSearchParams({ start, end });
			return `/properties/${propertyId}/availability${query ? `?${query}` : ''}`;
		},
	},
	bookings: {
		prefix: '/bookings',
		listMine: '/bookings?host_id=me',
	},
	property_images: {
		byProperty: (id: string) => `/properties/${id}/images`,
		byPropertyImage: (propertyId: string, imageId: string) =>
			`/properties/${propertyId}/images?${toSearchParams({ image_id: imageId })}`,
	},
	documents: {
		prefix: '/documents',
		document: (id: string) => `/documents/${id}`,
	},
	property_amenities: {
		prefix: '/property-amenities',
		property_amenity: (id: string) => `/property-amenities/${id}`,
		property_amenities: (query: PropertyAmenityQuery) => `/property-amenities?${toSearchParams(query)}`,
		byProperty: (id: string) => `/properties/${id}/amenities`,
	},
};
