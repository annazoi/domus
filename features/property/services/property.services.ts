import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { Property, UpsertPropertyInput } from '../interfaces/property.interface';

const inFlightPropertyUpdates = new Map<string, Promise<Property>>();

export const listProperties = async () => {
	const response = await axiosInstance.get<Property[]>(ApiRoutes.properties.listMine);
	return response.data;
};

export const getPropertyById = async (id: string) => {
	const response = await axiosInstance.get<Property>(ApiRoutes.properties.property(id));
	return response.data;
};

export const createProperty = async (input: UpsertPropertyInput) => {
	const response = await axiosInstance.post<Property>(ApiRoutes.properties.prefix, input);
	return response.data;
};

export const updateProperty = async (id: string, input: UpsertPropertyInput) => {
	const existingRequest = inFlightPropertyUpdates.get(id);
	if (existingRequest) return existingRequest;

	const request = axiosInstance
		.put<Property>(ApiRoutes.properties.property(id), input)
		.then((response) => response.data)
		.finally(() => {
			inFlightPropertyUpdates.delete(id);
		});

	inFlightPropertyUpdates.set(id, request);
	return request;
};

export const deleteProperty = async (id: string) => {
	await axiosInstance.delete(ApiRoutes.properties.property(id));
};

