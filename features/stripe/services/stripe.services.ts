import axios from 'axios';
import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type {
	CreateStripeCheckoutPayload,
	StripeCheckoutResponse,
	StripeConnectOnboardingResponse,
	StripeConnectStatus,
	StripeLoginLinkResponse,
} from '../interfaces/stripe.interface';

function getApiErrorMessage(error: unknown, fallback: string) {
	if (axios.isAxiosError(error)) {
		const message = error.response?.data?.message;
		if (typeof message === 'string' && message.length > 0) return message;
	}
	if (error instanceof Error && error.message) return error.message;
	return fallback;
}

export const getStripeConnectAccount = async () => {
	const response = await axiosInstance.get<StripeConnectStatus>(ApiRoutes.stripe.accounts);
	return response.data;
};

export const createStripeConnectAccount = async () => {
	try {
		const response = await axiosInstance.post<StripeConnectOnboardingResponse>(ApiRoutes.stripe.accounts);
		const data = response.data;
		return {
			...data,
			url: data.url ?? data.onboarding_link ?? '',
		};
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not start Stripe onboarding.'));
	}
};

export const getStripeOnboardingLink = async () => {
	try {
		const response = await axiosInstance.get<StripeConnectOnboardingResponse>(ApiRoutes.stripe.onboardingLink);
		const data = response.data;
		return {
			...data,
			url: data.url ?? data.onboarding_link ?? '',
		};
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not refresh Stripe onboarding.'));
	}
};

export const createStripeLoginLink = async () => {
	try {
		const response = await axiosInstance.get<StripeLoginLinkResponse>(ApiRoutes.stripe.loginLink);
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not open Stripe dashboard.'));
	}
};

export const disconnectStripeAccount = async () => {
	await axiosInstance.delete(ApiRoutes.stripe.accounts);
};

export const createStripeCheckout = async (payload: CreateStripeCheckoutPayload) => {
	try {
		const response = await axiosInstance.post<StripeCheckoutResponse>(ApiRoutes.stripe.checkout, payload);
		return response.data;
	} catch (error) {
		throw new Error(getApiErrorMessage(error, 'Could not start checkout.'));
	}
};
