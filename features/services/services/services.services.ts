import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { HostService, Service, ServiceImage, ServiceInput } from '../interfaces/service.interface';

export const listServices = async (propertyId: string) => {
	const response = await axiosInstance.get<Service[]>(ApiRoutes.services.list(propertyId));
	return response.data;
};

export const listPropertyServices = async (propertyId: string) => {
	const response = await axiosInstance.get<Service[]>(ApiRoutes.services.byProperty(propertyId));
	return response.data;
};

export const syncPropertyServiceLinks = async (propertyId: string, serviceIds: string[]) => {
	const response = await axiosInstance.post<Service[]>(ApiRoutes.services.byProperty(propertyId), {
		service_ids: serviceIds,
	});
	return response.data;
};

export const listHostServices = async () => {
	const response = await axiosInstance.get<HostService[]>(ApiRoutes.services.listMine);
	return response.data;
};

export const createHostService = async (input: ServiceInput) => {
	const response = await axiosInstance.post<HostService>(ApiRoutes.services.listMine, input);
	return response.data;
};

export const updateHostService = async (id: string, input: ServiceInput) => {
	const response = await axiosInstance.patch<HostService>(ApiRoutes.services.service(id), input);
	return response.data;
};

export const deleteHostService = async (id: string) => {
	await axiosInstance.delete(ApiRoutes.services.service(id));
};

export const uploadServiceImages = async (serviceId: string, files: File[], descriptions?: string[]) => {
	const formData = new FormData();
	files.forEach((file) => formData.append('files', file));
	if (descriptions?.length) {
		formData.append('descriptions', JSON.stringify(descriptions));
	}

	const response = await axiosInstance.post<ServiceImage[]>(ApiRoutes.services.images(serviceId), formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};

export const deleteServiceImage = async (serviceId: string, imageId: string) => {
	await axiosInstance.delete(ApiRoutes.services.image(serviceId, imageId));
};
