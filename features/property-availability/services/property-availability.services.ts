import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { AvailabilityDay, AvailabilityStatus } from '../interfaces/property-availability.interface';

export const listAvailability = async (property_id: string, start?: string, end?: string) => {
	const response = await axiosInstance.get<AvailabilityDay[]>(
		ApiRoutes.availability.listByProperty(property_id, start, end),
	);
	return response.data;
};

type UpsertAvailabilityPayload = {
	start: string;
	end: string;
	price: number;
	is_available: boolean;
	reason?: AvailabilityStatus | null;
};

type UpsertAvailabilityResponse = {
	rows: AvailabilityDay[];
};

export const upsertAvailability = async (property_id: string, payload: UpsertAvailabilityPayload) => {
	const response = await axiosInstance.post<UpsertAvailabilityResponse>(
		ApiRoutes.availability.byProperty(property_id),
		payload,
	);
	return response.data.rows;
};

export const clearAvailability = async (property_id: string) => {
	await axiosInstance.delete(ApiRoutes.availability.byProperty(property_id));
};
