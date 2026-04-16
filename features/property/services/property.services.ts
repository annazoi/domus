import axiosInstance from '@/config/api/axios';
import { getStaticAmenities } from '@/config/constants/dropdowns/amenities.options';
import { getAuthStoreState } from '@/store/auth';
import type { Amenity, AvailabilityDay, Booking, Property, PropertyImage, UpsertPropertyInput } from '../interfaces/property.interface';

const authHeaders = () => {
	const userId = getAuthStoreState().user_uuid;
	if (!userId) throw new Error('User not authenticated');
	return { 'x-user-id': userId };
};

export const listProperties = async () => {
	const response = await axiosInstance.get<Property[]>('/properties?host_id=me', { headers: authHeaders() });
	return response.data;
};

export const getPropertyById = async (id: string) => {
	const response = await axiosInstance.get<Property>(`/properties/${id}`, { headers: authHeaders() });
	return response.data;
};

export const createProperty = async (input: UpsertPropertyInput) => {
	const response = await axiosInstance.post<Property>('/properties', input, { headers: authHeaders() });
	return response.data;
};

export const updateProperty = async (id: string, input: UpsertPropertyInput) => {
	const response = await axiosInstance.put<Property>(`/properties/${id}`, input, { headers: authHeaders() });
	return response.data;
};

export const deleteProperty = async (id: string) => {
	await axiosInstance.delete(`/properties/${id}`, { headers: authHeaders() });
};

export const uploadPropertyImages = async (id: string, urls: string[]) => {
	const response = await axiosInstance.post<PropertyImage[]>(
		`/properties/${id}/images`,
		{ urls },
		{ headers: authHeaders() },
	);
	return response.data;
};

export const reorderPropertyImages = async (id: string, reorderIds: string[], coverImageId?: string) => {
	const response = await axiosInstance.post<PropertyImage[]>(
		`/properties/${id}/images`,
		{ reorderIds, coverImageId },
		{ headers: authHeaders() },
	);
	return response.data;
};

export const deleteImage = async (imageId: string) => {
	await axiosInstance.delete(`/images/${imageId}`, { headers: authHeaders() });
};

/**
 * Loads amenities from the API. Falls back to `getStaticAmenities()` from config when the request fails
 * (offline, 401, etc.) so the form always matches the canonical dropdown list.
 */
export const getAmenities = async (): Promise<Amenity[]> => {
	try {
		const response = await axiosInstance.get<Amenity[]>('/amenities', { headers: authHeaders() });
		return response.data;
	} catch {
		return getStaticAmenities() as Amenity[];
	}
};

export const savePropertyAmenities = async (id: string, amenityIds: string[]) => {
	const response = await axiosInstance.post<Property>(
		`/properties/${id}/amenities`,
		{ amenityIds },
		{ headers: authHeaders() },
	);
	return response.data;
};

export const listAvailability = async (propertyId: string) => {
	const response = await axiosInstance.get<AvailabilityDay[]>(`/availability?property_id=${propertyId}`, {
		headers: authHeaders(),
	});
	return response.data;
};

export const upsertAvailability = async (
	propertyId: string,
	date: string,
	isAvailable: boolean,
	customPrice: number | null,
) => {
	const response = await axiosInstance.post<AvailabilityDay>(
		'/availability',
		{ propertyId, date, isAvailable, customPrice },
		{ headers: authHeaders() },
	);
	return response.data;
};

export const listBookings = async () => {
	const response = await axiosInstance.get<(Booking & { propertyTitle: string })[]>('/bookings?host_id=me', {
		headers: authHeaders(),
	});
	return response.data;
};
