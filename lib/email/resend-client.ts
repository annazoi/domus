import { Resend } from 'resend';
import { environments } from '@/config/environments';

let resendClient: Resend | null = null;

export function getResendClient() {
	if (!environments.RESEND_API_KEY) {
		throw new Error('RESEND_API_KEY is not configured.');
	}
	if (!resendClient) {
		resendClient = new Resend(environments.RESEND_API_KEY);
	}
	return resendClient;
}

export function getEmailFromAddress() {
	const raw = environments.RESEND_FROM_EMAIL?.trim();
	if (!raw) return 'Domus <onboarding@resend.dev>';
	if (raw.includes('<')) return raw;
	return `Domus <${raw}>`;
}

export function isEmailConfigured() {
	return Boolean(environments.RESEND_API_KEY?.trim());
}
