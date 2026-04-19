import axiosInstance from '@/config/api/axios';
import type { AvailabilityDay } from '../interfaces/property-availability.interface';

export const listAvailability = async (property_id: string) => {
	const response = await axiosInstance.get<AvailabilityDay[]>(`/availability?property_id=${property_id}`);
	return response.data;
};

export const upsertAvailability = async (
	property_id: string,
	date: string,
	is_available: boolean,
	custom_price: number | null,
) => {
	const response = await axiosInstance.post<AvailabilityDay>(
		'/availability',
		{ property_id, date, is_available, custom_price },
	);
	return response.data;
};
