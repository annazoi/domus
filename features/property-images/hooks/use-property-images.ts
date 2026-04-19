import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PropertyImage } from '../interfaces/property-image.interfaces';
import { deleteImage, reorderPropertyImages, uploadPropertyImages } from '../services/property-images.services';

export const useUploadPropertyImages = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (files: File[]) => uploadPropertyImages(propertyId, files),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
		},
	});
};

export const useReorderPropertyImages = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: { reorder_ids: string[]; cover_image_id?: string }) =>
			reorderPropertyImages(propertyId, payload.reorder_ids, payload.cover_image_id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
		},
	});
};

export const useDeletePropertyImage = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (imageId: string) => deleteImage(imageId),
		onSuccess: (_result, imageId) => {
			void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
			queryClient.setQueryData<PropertyImage[]>(['property-images', propertyId], (previous = []) =>
				previous.filter((image) => image.id !== imageId),
			);
		},
	});
};
