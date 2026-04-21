import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PropertyAmenityEntry } from '@/features/property/interfaces/property.interface';
import { savePropertyAmenities } from '../services/property-amenities.services';

export const useSavePropertyAmenities = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (amenities: PropertyAmenityEntry[]) => savePropertyAmenities(propertyId, amenities),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
		},
	});
};
