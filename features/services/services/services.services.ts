import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { Service } from '../interfaces/service.interface';

export const listServices = async (propertyId: string) => {
	const response = await axiosInstance.get<Service[]>(ApiRoutes.services.list(propertyId));
	return response.data;
};

export const listPropertyServices = async (propertyId: string) => {
	const response = await axiosInstance.get<Service[]>(ApiRoutes.services.byProperty(propertyId));
	return response.data;
};

export const savePropertyServices = async (
	propertyId: string,
	services: { id?: string; name: string; description?: string | null; price: number }[],
) => {
	const response = await axiosInstance.post<Service[]>(ApiRoutes.services.byProperty(propertyId), { services });
	return response.data;
};
