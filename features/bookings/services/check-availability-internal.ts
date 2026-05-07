import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';

export type CheckAvailabilityParams = {
	property_id: string;
	check_in: string;
	check_out: string;
	guests: number;
};

export type CheckAvailabilityResponse = {
	isAvailable: boolean;
	totalPrice: number | null;
};

export const checkAvailability = async ({
	property_id,
	check_in,
	check_out,
	guests,
}: CheckAvailabilityParams) => {
	const response = await axiosInstance.get<CheckAvailabilityResponse>(
		ApiRoutes.properties.checkAvailability(property_id, check_in, check_out, guests),
	);
	return response.data;
};
