export interface StripeConnectStatus {
	stripe_account_id: string | null;
	stripe_onboarding_completed: boolean;
	charges_enabled: boolean;
	payouts_enabled: boolean;
	details_submitted: boolean;
}

export interface StripeConnectOnboardingResponse {
	url: string;
	stripe_account_id: string;
}

export interface StripeCheckoutResponse {
	checkout_url: string;
	session_id: string;
	booking_id: string;
}

export type CreateStripeCheckoutPayload = {
	booking_id?: string;
	property_id: string;
	check_in: string;
	check_out: string;
	guests: number;
	guest: {
		first_name: string;
		last_name: string;
		email: string;
		phone?: string;
	};
	services?: { service_id: string; quantity: number }[];
};
