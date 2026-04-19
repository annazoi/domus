import axiosInstance from '@/config/api/axios';
import type { PropertyImage } from '../interfaces/property-image.interfaces';

export const uploadPropertyImages = async (id: string, files: File[]) => {
	const formData = new FormData();
	files.forEach((file) => formData.append('files', file));

	const response = await axiosInstance.post<PropertyImage[]>(`/properties/${id}/images`, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};

export const reorderPropertyImages = async (id: string, reorder_ids: string[], cover_image_id?: string) => {
	const response = await axiosInstance.post<PropertyImage[]>(
		`/properties/${id}/images`,
		{ reorder_ids, cover_image_id },
	);
	return response.data;
};

export const deleteImage = async (imageId: string) => {
	await axiosInstance.delete(`/images/${imageId}`);
};
