import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { VideoUrlSource } from '@/lib/media/video-url';
import type { PropertyImage } from '../interfaces/property-image.interfaces';

export const uploadPropertyImages = async (
	id: string,
	input: {
		files: File[];
		descriptions?: string[];
		urlEntries?: { url: string; description: string; source?: VideoUrlSource }[];
	},
) => {
	const formData = new FormData();
	input.files.forEach((file) => formData.append('files', file));
	if (input.descriptions?.length) {
		formData.append('descriptions', JSON.stringify(input.descriptions));
	}
	if (input.urlEntries?.length) {
		formData.append('url_entries', JSON.stringify(input.urlEntries));
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

export const deleteImage = async (propertyId: string, imageId: string) => {
	await axiosInstance.delete(ApiRoutes.property_images.byPropertyImage(propertyId, imageId));
};
