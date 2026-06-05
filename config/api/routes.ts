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
		search: (q: string) => `/users/search?${toSearchParams({ q })}`,
	},
	properties: {
		prefix: '/properties',
		property: (id: string) => `/properties/${id}`,
		branding: (id: string) => `/properties/${id}/branding`,
		checkAvailability: (id: string, check_in: string, check_out: string, guests: number) =>
			`/properties/${id}/check-availability?${toSearchParams({ check_in, check_out, guests })}`,
		unavailableDays: (id: string) => `/properties/${id}/unavailable-days`,
		listMine: '/properties?host_id=me',
		listMinePaginated: (page: number, limit: number) =>
			`/properties?host_id=me&page=${page}&limit=${limit}`,
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
		create: '/booking',
		quote: '/bookings/quote',
		listMine: '/bookings?host_id=me',
		listMinePaginated: (params: {
			page: number;
			limit: number;
			customer_id?: string;
			property_id?: string;
			date_from?: string;
			date_to?: string;
			q?: string;
			sort?: 'check_in' | 'created_at';
			exclude_cancelled?: boolean;
		}) =>
			`/bookings?host_id=me&${toSearchParams({
				page: params.page,
				limit: params.limit,
				customer_id: params.customer_id,
				property_id: params.property_id,
				date_from: params.date_from,
				date_to: params.date_to,
				q: params.q,
				sort: params.sort,
				exclude_cancelled: params.exclude_cancelled ? '1' : undefined,
			})}`,
		listMyTrips: '/bookings?guest_id=me',
		listMyTripsPaginated: (page: number, limit: number) =>
			`/bookings?guest_id=me&page=${page}&limit=${limit}`,
		booking: (id: string) => `/bookings/${id}`,
		cancel: (id: string) => `/bookings/${id}/cancel`,
	},
	services: {
		list: (propertyId: string) => `/services?property_id=${encodeURIComponent(propertyId)}`,
		listMine: '/services?host_id=me',
		listMinePaginated: (page: number, limit: number) =>
			`/services?host_id=me&page=${page}&limit=${limit}`,
		service: (id: string) => `/services/${id}`,
		byProperty: (propertyId: string) => `/properties/${propertyId}/services`,
		images: (id: string) => `/services/${id}/images`,
		image: (serviceId: string, imageId: string) =>
			`/services/${serviceId}/images?${toSearchParams({ image_id: imageId })}`,
	},
	customers: {
		prefix: '/customers',
		listMine: '/customers?host_id=me',
		listMinePaginated: (page: number, limit: number, q?: string) =>
			`/customers?host_id=me&${toSearchParams({ page, limit, q })}`,
		customer: (id: string) => `/customers/${id}`,
	},
	conversations: {
		prefix: '/conversations',
		messages: (id: string) => `/conversations/${id}/messages`,
	},
	stripe: {
		accounts: '/stripe/accounts',
		onboardingLink: '/stripe/accounts/onboarding-link',
		loginLink: '/stripe/accounts/login-link',
		connectCreateAccount: '/stripe/accounts',
		connectStatus: '/stripe/accounts',
		checkout: '/stripe/checkout',
		webhook: '/stripe/webhook',
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
