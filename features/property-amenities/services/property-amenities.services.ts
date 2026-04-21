import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { Property, PropertyAmenityEntry } from '@/features/property/interfaces/property.interface';

export const savePropertyAmenities = async (id: string, amenities: PropertyAmenityEntry[]) => {
	const response = await axiosInstance.post<Property>(ApiRoutes.property_amenities.byProperty(id), { amenities });
	return response.data;
};
