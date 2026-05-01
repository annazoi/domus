import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteImage, reorderPropertyImages, uploadPropertyImages } from '../services/property-images.services';

export const useUploadPropertyImages = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { files: File[]; descriptions?: string[] }) =>
			uploadPropertyImages(propertyId, input.files, input.descriptions),
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
		mutationFn: (imageId: string) => deleteImage(propertyId, imageId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
		},
	});
};
