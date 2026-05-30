import axios from 'axios';
import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type {
	CreateStripeCheckoutPayload,
	StripeCheckoutResponse,
	StripeConnectOnboardingResponse,
	StripeConnectStatus,
} from '../interfaces/stripe.interface';

function getApiErrorMessage(error: unknown, fallback: string) {
	if (axios.isAxiosError(error)) {
		const message = error.response?.data?.message;
		if (typeof message === 'string' && message.length > 0) return message;
	}
	if (error instanceof Error && error.message) return error.message;
	return fallback;
}

export const getStripeConnectStatus = async () => {
	const response = await axiosInstance.get<StripeConnectStatus>(ApiRoutes.stripe.connectStatus);
	return response.data;
};

export const createStripeConnectAccount = async () => {
	try {
		const response = await axiosInstance.post<StripeConnectOnboardingResponse>(
			ApiRoutes.stripe.connectCreateAccount,
		);
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not start Stripe onboarding.'));
	}
};

export const createStripeCheckout = async (payload: CreateStripeCheckoutPayload) => {
	try {
		const response = await axiosInstance.post<StripeCheckoutResponse>(ApiRoutes.stripe.checkout, payload);
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not start checkout.'));
	}
};
