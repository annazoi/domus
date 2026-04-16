export type PropertyStatus = 'draft' | 'published';

export interface PropertyImage {
	id: string;
	propertyId: string;
	url: string;
	isCover: boolean;
	order: number;
}

export interface Amenity {
	id: string;
	label: string;
}

export interface AvailabilityDay {
	id: string;
	propertyId: string;
	date: string;
	isAvailable: boolean;
	customPrice: number | null;
}

export interface Booking {
	id: string;
	propertyId: string;
	hostId: string;
	guestName: string;
	startDate: string;
	endDate: string;
	status: 'pending' | 'confirmed' | 'cancelled';
}

export interface Property {
	id: string;
	hostId: string;
	title: string;
	slug: string;
	description: string;
	propertyType: string;
	roomType: string;
	guests: number;
	bedrooms: number;
	beds: number;
	bathrooms: number;
	country: string;
	city: string;
	address: string;
	lat: number | null;
	lng: number | null;
	pricePerNight: number;
	cleaningFee: number;
	status: PropertyStatus;
	amenityIds: string[];
	createdAt: string;
	updatedAt: string;
	images: PropertyImage[];
}

export interface UpsertPropertyInput {
	title: string;
	description: string;
	propertyType: string;
	roomType: string;
	guests: number;
	bedrooms: number;
	beds: number;
	bathrooms: number;
	country: string;
	city: string;
	address: string;
	lat?: number | null;
	lng?: number | null;
	pricePerNight: number;
	cleaningFee: number;
	status: PropertyStatus;
}
