import { useMutation } from '@tanstack/react-query';
import {
	checkAvailability,
	type CheckAvailabilityParams,
	type CheckAvailabilityResponse,
} from '../services/check-availability-internal';

export const useCheckAvailability = () => {
	return useMutation<CheckAvailabilityResponse, Error, CheckAvailabilityParams>({
		mutationFn: checkAvailability,
	});
};
