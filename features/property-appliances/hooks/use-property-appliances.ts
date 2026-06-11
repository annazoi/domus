import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	savePropertyAppliances,
	type SaveApplianceItem,
} from '../services/property-appliances.services';

type SaveAppliancesInput = {
	appliances: SaveApplianceItem[];
	removedIds?: string[];
	clearImageKeys?: string[];
	imageFilesByKey?: Record<string, File | null>;
};

export const useSavePropertyAppliances = (propertyId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: SaveAppliancesInput) => savePropertyAppliances(propertyId, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
		},
	});
};
