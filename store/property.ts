import { getStaticAmenities } from '@/config/constants/dropdowns/amenities.options';
import type { Booking } from '@/features/bookings/interfaces/booking.interface';
import type { AvailabilityDay } from '@/features/property-availability/interfaces/property-availability.interface';
import type { PropertyImage } from '@/features/property-images/interfaces/property-image.interfaces';
import type { Property, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import type { LucideIcon } from 'lucide-react';

type StoreAmenity = {
	id: string;
	label: string;
	icon: LucideIcon;
};

type PropertyStore = {
	properties: Property[];
	amenities: StoreAmenity[];
	availability: AvailabilityDay[];
	bookings: Booking[];
	images: PropertyImage[];
};

declare global {
	var __propertyStore: PropertyStore | undefined;
}

const createInitialStore = (): PropertyStore => ({
	properties: [],
	amenities: getStaticAmenities(),
	availability: [],
	bookings: [],
	images: [],
});

const store = globalThis.__propertyStore ?? createInitialStore();
globalThis.__propertyStore = store;

export const propertyStore = {
	getState: () => store,

	getProperties(hostId: string) {
		return store.properties
			.filter((property) => property.host_id === hostId)
			.map((property) => ({
				...property,
				images: store.images
					.filter((image) => image.property_id === property.id)
					.sort((a, b) => a.order - b.order),
			}));
	},

	getProperty(hostId: string, propertyId: string) {
		const property = store.properties.find((item) => item.id === propertyId && item.host_id === hostId);
		if (!property) return null;

		return {
			...property,
			images: store.images.filter((image) => image.property_id === property.id).sort((a, b) => a.order - b.order),
		};
	},

	createProperty(hostId: string, input: UpsertPropertyInput) {
		const now = new Date().toISOString();
		const property: Property = {
			id: crypto.randomUUID(),
			host_id: hostId,
			...input,
			lat: input.lat ?? null,
			lng: input.lng ?? null,
			amenity_ids: [],
			amenities: [],
			created_at: now,
			updated_at: now,
			images: [],
		};
		store.properties.unshift(property);
		return property;
	},

	updateProperty(hostId: string, propertyId: string, input: UpsertPropertyInput) {
		const index = store.properties.findIndex((item) => item.id === propertyId && item.host_id === hostId);
		if (index === -1) return null;

		const existing = store.properties[index];
		const updated: Property = {
			...existing,
			...input,
			lat: input.lat ?? null,
			lng: input.lng ?? null,
			slug: input.title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
			updated_at: new Date().toISOString(),
			images: [],
		};
		store.properties[index] = updated;
		return updated;
	},

	deleteProperty(hostId: string, propertyId: string) {
		const before = store.properties.length;
		store.properties = store.properties.filter((property) => !(property.id === propertyId && property.host_id === hostId));
		if (before === store.properties.length) return false;

		store.images = store.images.filter((image) => image.property_id !== propertyId);
		store.availability = store.availability.filter((day) => day.property_id !== propertyId);
		store.bookings = store.bookings.filter((booking) => booking.property_id !== propertyId);
		return true;
	},

	addImages(hostId: string, propertyId: string, urls: string[]) {
		const property = this.getProperty(hostId, propertyId);
		if (!property) return null;
		const currentImages = store.images.filter((image) => image.property_id === propertyId).sort((a, b) => a.order - b.order);
		const startOrder = currentImages.length;

		const created = urls.map((url, index) => ({
			id: crypto.randomUUID(),
			user_id: hostId,
			property_id: propertyId,
			document_id: null,
			description: null,
			created_at: new Date().toISOString(),
			document: {
				id: crypto.randomUUID(),
				user_id: hostId,
				filename: `property-image-${startOrder + index + 1}.jpg`,
				mimetype: 'image/jpeg',
				size: 0,
				url,
				path: url,
				type: 'IMAGE' as const,
				order: startOrder + index,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				property_amenity_id: null,
			},
			is_cover: currentImages.length === 0 && index === 0,
			order: startOrder + index,
		}));

		store.images.push(...created);
		return created;
	},

	deleteImage(hostId: string, imageId: string) {
		const image = store.images.find((item) => item.id === imageId);
		if (!image) return false;
		const property = store.properties.find((item) => item.id === image.property_id && item.host_id === hostId);
		if (!property) return false;

		store.images = store.images.filter((item) => item.id !== imageId);
		const sorted = store.images.filter((item) => item.property_id === image.property_id).sort((a, b) => a.order - b.order);
		sorted.forEach((item, index) => {
			item.order = index;
		});
		if (!sorted.some((item) => item.is_cover) && sorted[0]) {
			sorted[0].is_cover = true;
		}
		return true;
	},

	reorderImages(hostId: string, propertyId: string, imageIds: string[], coverImageId?: string) {
		const property = this.getProperty(hostId, propertyId);
		if (!property) return null;
		const imageMap = new Map(store.images.filter((image) => image.property_id === propertyId).map((image) => [image.id, image]));
		imageIds.forEach((id, index) => {
			const image = imageMap.get(id);
			if (image) image.order = index;
		});
		if (coverImageId) {
			store.images
				.filter((image) => image.property_id === propertyId)
				.forEach((image) => {
					image.is_cover = image.id === coverImageId;
				});
		}
		return store.images.filter((image) => image.property_id === propertyId).sort((a, b) => a.order - b.order);
	},

	setAmenities(hostId: string, propertyId: string, amenityIds: string[]) {
		const property = store.properties.find((item) => item.id === propertyId && item.host_id === hostId);
		if (!property) return null;
		property.amenity_ids = amenityIds.filter((id) => store.amenities.some((amenity) => amenity.id === id));
		property.updated_at = new Date().toISOString();
		return property;
	},

	upsertAvailability(
		hostId: string,
		propertyId: string,
		date: string,
		is_available: boolean,
		price: number,
		reason: 'BLOCKED' | 'MAINTENANCE' | 'BOOKED' | null,
	) {
		const property = this.getProperty(hostId, propertyId);
		if (!property) return { error: 'FORBIDDEN' as const };

		const isBooked = store.bookings.some(
			(booking) =>
				booking.property_id === propertyId &&
				booking.status !== 'cancelled' &&
				date >= booking.start_date &&
				date <= booking.end_date,
		);
		if (isBooked) return { error: 'BOOKED' as const };

		const existing = store.availability.find((item) => item.property_id === propertyId && item.date === date);
		if (existing) {
			existing.is_available = is_available;
			existing.price = price;
			existing.reason = reason;
			return { value: existing };
		}
		const created: AvailabilityDay = {
			id: crypto.randomUUID(),
			property_id: propertyId,
			date,
			price,
			is_available,
			reason,
		};
		store.availability.push(created);
		return { value: created };
	},

	getAvailability(hostId: string, propertyId: string) {
		const property = this.getProperty(hostId, propertyId);
		if (!property) return null;
		return store.availability.filter((item) => item.property_id === propertyId);
	},

	getBookings(hostId: string) {
		return store.bookings.filter((booking) => booking.host_id === hostId);
	},

	createBooking(propertyId: string, guest_name: string, start_date: string, end_date: string) {
		const property = store.properties.find((item) => item.id === propertyId);
		if (!property) return null;

		const booking: Booking = {
			id: crypto.randomUUID(),
			property_id: propertyId,
			host_id: property.host_id,
			guest_name,
			start_date,
			end_date,
			status: 'pending',
		};
		store.bookings.unshift(booking);
		return booking;
	},
};
