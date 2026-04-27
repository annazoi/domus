import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PropertyAmenityEntry } from '@/features/property/interfaces/property.interface';
import { savePropertyAmenities } from '../services/property-amenities.services';

type SaveAmenitiesInput = {
	amenities: PropertyAmenityEntry[];
	imageFilesByValue?: Record<string, File | null>;
	clearImageValues?: string[];
};

export const useSavePropertyAmenities = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: SaveAmenitiesInput) => savePropertyAmenities(propertyId, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
		},
	});
};
