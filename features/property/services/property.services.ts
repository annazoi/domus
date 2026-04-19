import axiosInstance from '@/config/api/axios';
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

export const patchPropertyBasicInfo = async (
	id: string,
	input: Pick<UpsertPropertyInput, 'title' | 'slug' | 'description' | 'short_description' | 'property_type' | 'status'>,
) => {
	const response = await axiosInstance.patch<Property>(`/properties/${id}/basic-info`, input, { headers: authHeaders() });
	return response.data;
};

export const patchPropertyCapacity = async (
	id: string,
	input: Pick<UpsertPropertyInput, 'max_guests' | 'bedrooms' | 'beds' | 'bathrooms'>,
) => {
	const response = await axiosInstance.patch<Property>(`/properties/${id}/capacity`, input, { headers: authHeaders() });
	return response.data;
};

export const patchPropertyLocation = async (
	id: string,
	input: Pick<UpsertPropertyInput, 'country' | 'city' | 'address' | 'lat' | 'lng'>,
) => {
	const response = await axiosInstance.patch<Property>(`/properties/${id}/location`, input, { headers: authHeaders() });
	return response.data;
};

export const patchPropertyPricing = async (id: string, input: Pick<UpsertPropertyInput, 'cleaning_fee' | 'status'>) => {
	const response = await axiosInstance.patch<Property>(`/properties/${id}/pricing`, input, { headers: authHeaders() });
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

export const uploadFilesToCloudinary = async (files: File[]) => {
	const formData = new FormData();
	files.forEach((file) => formData.append('files', file));

	const response = await fetch('/api/uploads/cloudinary', {
		method: 'POST',
		headers: authHeaders(),
		body: formData,
	});

	const payload = (await response.json()) as { urls?: string[]; message?: string };
	if (!response.ok) {
		throw new Error(payload.message ?? 'Could not upload files.');
	}

	return payload.urls ?? [];
};

export const reorderPropertyImages = async (id: string, reorder_ids: string[], cover_image_id?: string) => {
	const response = await axiosInstance.post<PropertyImage[]>(
		`/properties/${id}/images`,
		{ reorder_ids, cover_image_id },
		{ headers: authHeaders() },
	);
	return response.data;
};

export const deleteImage = async (imageId: string) => {
	await axiosInstance.delete(`/images/${imageId}`, { headers: authHeaders() });
};

export const savePropertyAmenities = async (id: string, amenity_ids: string[]) => {
	const response = await axiosInstance.post<Property>(
		`/properties/${id}/amenities`,
		{ amenity_ids },
		{ headers: authHeaders() },
	);
	return response.data;
};

export const listAvailability = async (property_id: string) => {
	const response = await axiosInstance.get<AvailabilityDay[]>(`/availability?property_id=${property_id}`, {
		headers: authHeaders(),
	});
	return response.data;
};

export const upsertAvailability = async (
	property_id: string,
	date: string,
	is_available: boolean,
	custom_price: number | null,
) => {
	const response = await axiosInstance.post<AvailabilityDay>(
		'/availability',
		{ property_id, date, is_available, custom_price },
		{ headers: authHeaders() },
	);
	return response.data;
};

export const listBookings = async () => {
	const response = await axiosInstance.get<(Booking & { property_title: string })[]>('/bookings?host_id=me', {
		headers: authHeaders(),
	});
	return response.data;
};
