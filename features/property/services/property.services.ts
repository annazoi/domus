import axiosInstance from '@/config/api/axios';
import type { Property, UpsertPropertyInput } from '../interfaces/property.interface';

export const listProperties = async () => {
	const response = await axiosInstance.get<Property[]>('/properties?host_id=me');
	return response.data;
};

export const getPropertyById = async (id: string) => {
	const response = await axiosInstance.get<Property>(`/properties/${id}`);
	return response.data;
};

export const createProperty = async (input: UpsertPropertyInput) => {
	const response = await axiosInstance.post<Property>('/properties', input);
	return response.data;
};

export const updateProperty = async (id: string, input: UpsertPropertyInput) => {
	const response = await axiosInstance.put<Property>(`/properties/${id}`, input);
	return response.data;
};

export const patchPropertyBasicInfo = async (
	id: string,
	input: Pick<
		UpsertPropertyInput,
		'title' | 'slug' | 'description' | 'short_description' | 'property_type' | 'status' | 'check_in_time' | 'check_out_time'
	>,
) => {
	const response = await axiosInstance.patch<Property>(`/properties/${id}/basic-info`, input);
	return response.data;
};

export const patchPropertyCapacity = async (
	id: string,
	input: Pick<UpsertPropertyInput, 'max_guests' | 'bedrooms' | 'beds' | 'bathrooms'>,
) => {
	const response = await axiosInstance.patch<Property>(`/properties/${id}/capacity`, input);
	return response.data;
};

export const patchPropertyLocation = async (
	id: string,
	input: Pick<UpsertPropertyInput, 'country' | 'city' | 'address' | 'lat' | 'lng'>,
) => {
	const response = await axiosInstance.patch<Property>(`/properties/${id}/location`, input);
	return response.data;
};

export const patchPropertyPricing = async (id: string, input: Pick<UpsertPropertyInput, 'cleaning_fee' | 'status'>) => {
	const response = await axiosInstance.patch<Property>(`/properties/${id}/pricing`, input);
	return response.data;
};

export const deleteProperty = async (id: string) => {
	await axiosInstance.delete(`/properties/${id}`);
};

