import axiosInstance from '@/config/api/axios';
import axios from 'axios';
import { ApiRoutes } from '@/config/api/routes';
import type { PaginatedResult } from '@/lib/pagination';
import type { PropertyBrandingTheme } from '../../../app/(pages)/templates/_constants/property-branding-theme';
import type { Property, UpsertPropertyInput } from '../interfaces/property.interface';

const inFlightPropertyUpdates = new Map<string, Promise<Property>>();

export const listProperties = async () => {
	const response = await axiosInstance.get<Property[]>(ApiRoutes.properties.listMine);
	return response.data;
};

export const PROPERTIES_SEARCH_MIN_LENGTH = 2;

export const listPropertiesPaginated = async (page: number, pageSize: number, search?: string) => {
	const response = await axiosInstance.get<PaginatedResult<Property>>(
		ApiRoutes.properties.listMinePaginated(page, pageSize, search),
	);
	return response.data;
};

export const getPropertyById = async (id: string) => {
	const response = await axiosInstance.get<Property>(ApiRoutes.properties.property(id));
	return response.data;
};

export const createProperty = async (input: UpsertPropertyInput) => {
	try {
		const response = await axiosInstance.post<Property>(ApiRoutes.properties.prefix, input);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error((error.response?.data as { message?: string } | undefined)?.message ?? error.message);
		}
		throw error;
	}
};

export const updateProperty = async (id: string, input: UpsertPropertyInput) => {
	const existingRequest = inFlightPropertyUpdates.get(id);
	if (existingRequest) return existingRequest;

	const request = axiosInstance
		.put<Property>(ApiRoutes.properties.property(id), input)
		.then((response) => response.data)
		.catch((error) => {
			if (axios.isAxiosError(error)) {
				throw new Error((error.response?.data as { message?: string } | undefined)?.message ?? error.message);
			}
			throw error;
		})
		.finally(() => {
			inFlightPropertyUpdates.delete(id);
		});

	inFlightPropertyUpdates.set(id, request);
	return request;
};

export const deleteProperty = async (id: string) => {
	await axiosInstance.delete(ApiRoutes.properties.property(id));
};

export type PatchPropertyBrandingInput = {
	branding_theme: PropertyBrandingTheme;
	logo_alt?: string | null;
};

export const patchPropertyBranding = async (id: string, input: PatchPropertyBrandingInput) => {
	try {
		const response = await axiosInstance.patch<Property>(ApiRoutes.properties.branding(id), input);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error((error.response?.data as { message?: string } | undefined)?.message ?? error.message);
		}
		throw error;
	}
};

export const uploadPropertyLogo = async (id: string, file: File, alt?: string) => {
	const formData = new FormData();
	formData.append('file', file);
	if (alt?.trim()) formData.append('alt', alt.trim());
	try {
		const response = await axiosInstance.post<Property>(ApiRoutes.properties.brandingLogo(id), formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error((error.response?.data as { message?: string } | undefined)?.message ?? error.message);
		}
		throw error;
	}
};

export const deletePropertyLogo = async (id: string) => {
	try {
		const response = await axiosInstance.delete<Property>(ApiRoutes.properties.brandingLogo(id));
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error((error.response?.data as { message?: string } | undefined)?.message ?? error.message);
		}
		throw error;
	}
};

