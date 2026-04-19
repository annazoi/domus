import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { Property } from '@/features/property/interfaces/property.interface';

export const savePropertyAmenities = async (id: string, amenity_ids: string[]) => {
	const response = await axiosInstance.post<Property>(ApiRoutes.property_amenities.byProperty(id), { amenity_ids });
	return response.data;
};
