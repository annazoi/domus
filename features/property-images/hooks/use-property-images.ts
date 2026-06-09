import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { VideoUrlSource } from '@/lib/media/video-url';
import { deleteImage, reorderPropertyImages, uploadPropertyImages } from '../services/property-images.services';

export const useUploadPropertyImages = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: {
			files: File[];
			descriptions?: string[];
			urlEntries?: { url: string; description: string; source?: VideoUrlSource }[];
		}) => uploadPropertyImages(propertyId, input),
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
