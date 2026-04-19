import axiosInstance from '@/config/api/axios';
import type { Property } from '@/features/property/interfaces/property.interface';

export const savePropertyAmenities = async (id: string, amenity_ids: string[]) => {
	const response = await axiosInstance.post<Property>(`/properties/${id}/amenities`, { amenity_ids });
	return response.data;
};
