import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createStripeConnectAccount,
	createStripeLoginLink,
	getStripeConnectAccount,
	getStripeOnboardingLink,
} from '../services/stripe.services';

export const stripeConnectQueryKey = ['stripe', 'accounts'] as const;

export function useStripeConnectStatus() {
	return useQuery({
		queryKey: stripeConnectQueryKey,
		queryFn: getStripeConnectAccount,
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

export function useStripeOnboardingLink() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: getStripeOnboardingLink,
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: stripeConnectQueryKey });
			if (data.url) {
				window.location.assign(data.url);
			}
		},
	});
}

export function useStripeLoginLink() {
	return useMutation({
		mutationFn: createStripeLoginLink,
		onSuccess: (data) => {
			if (data.url) {
				window.location.assign(data.url);
			}
		},
	});
}
