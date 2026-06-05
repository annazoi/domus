import axios from 'axios';
import axiosInstance, { postMultipart } from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { PaginatedResult } from '@/lib/pagination';
import type { HostService, Service, ServiceImage, ServiceInput } from '../interfaces/service.interface';

function getApiErrorMessage(error: unknown, fallback: string) {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data;
		if (data && typeof data === 'object') {
			const message = (data as { message?: unknown }).message;
			if (typeof message === 'string' && message.length > 0) {
				if (message.includes('Unknown field') && message.includes('images')) {
					return 'Services are out of date. Run npm run prisma:generate and restart the dev server.';
				}
				return message;
			}
		}
		return fallback;
	}
	if (error instanceof Error && error.message) return error.message;
	return fallback;
}

export const listServices = async (propertyId: string) => {
	try {
		const response = await axiosInstance.get<Service[]>(ApiRoutes.services.list(propertyId));
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not load services.'));
	}
};

export const listPropertyServices = async (propertyId: string) => {
	try {
		const response = await axiosInstance.get<Service[]>(ApiRoutes.services.byProperty(propertyId));
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not load property services.'));
	}
};

export const syncPropertyServiceLinks = async (propertyId: string, serviceIds: string[]) => {
	try {
		const response = await axiosInstance.post<Service[]>(ApiRoutes.services.byProperty(propertyId), {
			service_ids: serviceIds,
		});
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not update property services.'));
	}
};

export const listHostServices = async () => {
	try {
		const response = await axiosInstance.get<HostService[]>(ApiRoutes.services.listMine);
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not load services.'));
	}
};

export const listHostServicesPaginated = async (page: number, pageSize: number) => {
	try {
		const response = await axiosInstance.get<PaginatedResult<HostService>>(
			ApiRoutes.services.listMinePaginated(page, pageSize),
		);
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not load services.'));
	}
};

export const createHostService = async (input: ServiceInput) => {
	try {
		const response = await axiosInstance.post<HostService>(ApiRoutes.services.listMine, input);
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not create service.'));
	}
};

export const updateHostService = async (id: string, input: ServiceInput) => {
	try {
		const response = await axiosInstance.patch<HostService>(ApiRoutes.services.service(id), input);
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not update service.'));
	}
};

export const deleteHostService = async (id: string) => {
	try {
		await axiosInstance.delete(ApiRoutes.services.service(id));
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not delete service.'));
	}
};

export const uploadServiceImages = async (serviceId: string, files: File[], descriptions?: string[]) => {
	const formData = new FormData();
	files.forEach((file) => formData.append('files', file));
	if (descriptions?.length) {
		formData.append('descriptions', JSON.stringify(descriptions));
	}

	try {
		const response = await postMultipart<ServiceImage[]>(ApiRoutes.services.images(serviceId), formData);
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not upload images.'));
	}
};

export const reorderServiceImages = async (serviceId: string, reorder_ids: string[]) => {
	try {
		const response = await axiosInstance.post<ServiceImage[]>(ApiRoutes.services.images(serviceId), {
			reorder_ids,
		});
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not reorder images.'));
	}
};

export const deleteServiceImage = async (serviceId: string, imageId: string) => {
	try {
		await axiosInstance.delete(ApiRoutes.services.image(serviceId, imageId));
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not delete image.'));
	}
};
