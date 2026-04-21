import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { PropertyImage } from '../interfaces/property-image.interfaces';

export const uploadPropertyImages = async (id: string, files: File[], descriptions?: string[]) => {
	const formData = new FormData();
	files.forEach((file) => formData.append('files', file));
	if (descriptions?.length) {
		formData.append('descriptions', JSON.stringify(descriptions));
	}

	const response = await axiosInstance.post<PropertyImage[]>(ApiRoutes.property_images.byProperty(id), formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};

export const reorderPropertyImages = async (id: string, reorder_ids: string[], cover_image_id?: string) => {
	const response = await axiosInstance.post<PropertyImage[]>(
		ApiRoutes.property_images.byProperty(id),
		{ reorder_ids, cover_image_id },
	);
	return response.data;
};

export const deleteImage = async (imageId: string) => {
	await axiosInstance.delete(ApiRoutes.images.image(imageId));
};
