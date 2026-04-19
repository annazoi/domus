import { useMutation, useQueryClient } from '@tanstack/react-query';
import { savePropertyAmenities } from '../services/property-amenities.services';

export const useSavePropertyAmenities = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (amenity_ids: string[]) => savePropertyAmenities(propertyId, amenity_ids),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
		},
	});
};
