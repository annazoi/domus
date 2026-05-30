import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createStripeConnectAccount, getStripeConnectStatus } from '../services/stripe.services';

export const stripeConnectQueryKey = ['stripe', 'connect', 'status'] as const;

export function useStripeConnectStatus() {
	return useQuery({
		queryKey: stripeConnectQueryKey,
		queryFn: getStripeConnectStatus,
	});
}

export function useStripeConnectOnboarding() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createStripeConnectAccount,
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: stripeConnectQueryKey });
			if (data.url) {
				window.location.assign(data.url);
			}
		},
	});
}
