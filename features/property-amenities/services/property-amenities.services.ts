import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { Property, PropertyAmenityEntry } from '@/features/property/interfaces/property.interface';

type SaveAmenitiesInput = {
	amenities: PropertyAmenityEntry[];
	imageFilesByValue?: Record<string, File | null>;
	clearImageValues?: string[];
};

export const savePropertyAmenities = async (id: string, input: SaveAmenitiesInput) => {
	const hasFiles = Object.values(input.imageFilesByValue ?? {}).some((file) => file instanceof File);
	const hasClear = Boolean(input.clearImageValues?.length);

	if (!hasFiles && !hasClear) {
		const response = await axiosInstance.post<Property>(ApiRoutes.property_amenities.byProperty(id), {
			amenities: input.amenities,
		});
		return response.data;
	}

	const formData = new FormData();
	formData.append('amenities', JSON.stringify(input.amenities));
	if (hasClear) {
		formData.append('clear_image_values', JSON.stringify(input.clearImageValues));
	}
	const imageEntries = Object.entries(input.imageFilesByValue ?? {}).filter(([, file]) => file instanceof File) as [
		string,
		File,
	][];
	imageEntries.forEach(([, file]) => formData.append('files', file));
	formData.append('image_values', JSON.stringify(imageEntries.map(([value]) => value)));

	const response = await axiosInstance.post<Property>(ApiRoutes.property_amenities.byProperty(id), formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};
