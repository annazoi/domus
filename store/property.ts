import { getStaticAmenities } from '@/config/constants/dropdowns/amenities.options';
import type { Amenity, AvailabilityDay, Booking, Property, PropertyImage, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';

type PropertyStore = {
	properties: Property[];
	amenities: Amenity[];
	availability: AvailabilityDay[];
	bookings: Booking[];
	images: PropertyImage[];
};

declare global {
	var __propertyStore: PropertyStore | undefined;
}

const createInitialStore = (): PropertyStore => ({
	properties: [],
	amenities: getStaticAmenities() as Amenity[],
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
			.filter((property) => property.hostId === hostId)
			.map((property) => ({
				...property,
				images: store.images
					.filter((image) => image.propertyId === property.id)
					.sort((a, b) => a.order - b.order),
			}));
	},

	getProperty(hostId: string, propertyId: string) {
		const property = store.properties.find((item) => item.id === propertyId && item.hostId === hostId);
		if (!property) return null;

		return {
			...property,
			images: store.images.filter((image) => image.propertyId === property.id).sort((a, b) => a.order - b.order),
		};
	},

	createProperty(hostId: string, input: UpsertPropertyInput) {
		const now = new Date().toISOString();
		const property: Property = {
			id: crypto.randomUUID(),
			hostId,
			slug: input.title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
			...input,
			lat: input.lat ?? null,
			lng: input.lng ?? null,
			amenityIds: [],
			createdAt: now,
			updatedAt: now,
			images: [],
		};
		store.properties.unshift(property);
		return property;
	},

	updateProperty(hostId: string, propertyId: string, input: UpsertPropertyInput) {
		const index = store.properties.findIndex((item) => item.id === propertyId && item.hostId === hostId);
		if (index === -1) return null;

		const existing = store.properties[index];
		const updated: Property = {
			...existing,
			...input,
			lat: input.lat ?? null,
			lng: input.lng ?? null,
			slug: input.title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
			updatedAt: new Date().toISOString(),
			images: [],
		};
		store.properties[index] = updated;
		return updated;
	},

	deleteProperty(hostId: string, propertyId: string) {
		const before = store.properties.length;
		store.properties = store.properties.filter((property) => !(property.id === propertyId && property.hostId === hostId));
		if (before === store.properties.length) return false;

		store.images = store.images.filter((image) => image.propertyId !== propertyId);
		store.availability = store.availability.filter((day) => day.propertyId !== propertyId);
		store.bookings = store.bookings.filter((booking) => booking.propertyId !== propertyId);
		return true;
	},

	addImages(hostId: string, propertyId: string, urls: string[]) {
		const property = this.getProperty(hostId, propertyId);
		if (!property) return null;
		const currentImages = store.images.filter((image) => image.propertyId === propertyId).sort((a, b) => a.order - b.order);
		const startOrder = currentImages.length;

		const created = urls.map((url, index) => ({
			id: crypto.randomUUID(),
			propertyId,
			url,
			isCover: currentImages.length === 0 && index === 0,
			order: startOrder + index,
		}));

		store.images.push(...created);
		return created;
	},

	deleteImage(hostId: string, imageId: string) {
		const image = store.images.find((item) => item.id === imageId);
		if (!image) return false;
		const property = store.properties.find((item) => item.id === image.propertyId && item.hostId === hostId);
		if (!property) return false;

		store.images = store.images.filter((item) => item.id !== imageId);
		const sorted = store.images.filter((item) => item.propertyId === image.propertyId).sort((a, b) => a.order - b.order);
		sorted.forEach((item, index) => {
			item.order = index;
		});
		if (!sorted.some((item) => item.isCover) && sorted[0]) {
			sorted[0].isCover = true;
		}
		return true;
	},

	reorderImages(hostId: string, propertyId: string, imageIds: string[], coverImageId?: string) {
		const property = this.getProperty(hostId, propertyId);
		if (!property) return null;
		const imageMap = new Map(store.images.filter((image) => image.propertyId === propertyId).map((image) => [image.id, image]));
		imageIds.forEach((id, index) => {
			const image = imageMap.get(id);
			if (image) image.order = index;
		});
		if (coverImageId) {
			store.images
				.filter((image) => image.propertyId === propertyId)
				.forEach((image) => {
					image.isCover = image.id === coverImageId;
				});
		}
		return store.images.filter((image) => image.propertyId === propertyId).sort((a, b) => a.order - b.order);
	},

	setAmenities(hostId: string, propertyId: string, amenityIds: string[]) {
		const property = store.properties.find((item) => item.id === propertyId && item.hostId === hostId);
		if (!property) return null;
		property.amenityIds = amenityIds.filter((id) => store.amenities.some((amenity) => amenity.id === id));
		property.updatedAt = new Date().toISOString();
		return property;
	},

	upsertAvailability(hostId: string, propertyId: string, date: string, isAvailable: boolean, customPrice: number | null) {
		const property = this.getProperty(hostId, propertyId);
		if (!property) return { error: 'FORBIDDEN' as const };

		const isBooked = store.bookings.some(
			(booking) =>
				booking.propertyId === propertyId &&
				booking.status !== 'cancelled' &&
				date >= booking.startDate &&
				date <= booking.endDate,
		);
		if (isBooked) return { error: 'BOOKED' as const };

		const existing = store.availability.find((item) => item.propertyId === propertyId && item.date === date);
		if (existing) {
			existing.isAvailable = isAvailable;
			existing.customPrice = customPrice;
			return { value: existing };
		}
		const created: AvailabilityDay = {
			id: crypto.randomUUID(),
			propertyId,
			date,
			isAvailable,
			customPrice,
		};
		store.availability.push(created);
		return { value: created };
	},

	getAvailability(hostId: string, propertyId: string) {
		const property = this.getProperty(hostId, propertyId);
		if (!property) return null;
		return store.availability.filter((item) => item.propertyId === propertyId);
	},

	getBookings(hostId: string) {
		return store.bookings.filter((booking) => booking.hostId === hostId);
	},

	createBooking(propertyId: string, guestName: string, startDate: string, endDate: string) {
		const property = store.properties.find((item) => item.id === propertyId);
		if (!property) return null;

		const booking: Booking = {
			id: crypto.randomUUID(),
			propertyId,
			hostId: property.hostId,
			guestName,
			startDate,
			endDate,
			status: 'pending',
		};
		store.bookings.unshift(booking);
		return booking;
	},
};
