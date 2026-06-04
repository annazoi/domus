import { environments } from '@/config/environments';

export function getAppUrl(request?: Request) {
	const appUrl = process.env.APP_URL?.replace(/\/$/, '');
	const publicUrl = environments.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
	const configured = appUrl || publicUrl;
	if (configured && !configured.includes('localhost')) {
		return configured;
	}

	if (request) {
		const origin = request.headers.get('origin');
		if (origin) return origin.replace(/\/$/, '');
		const host = request.headers.get('host');
		if (host) {
			const protocol = host.includes('localhost') ? 'http' : 'https';
			return `${protocol}://${host}`;
		}
	}

	return configured || 'http://localhost:3000';
}

export function getHostBillingUrls(request?: Request) {
	const base = getAppUrl(request);
	return {
		returnUrl: `${base}/dashboard/payments?stripe=return`,
		refreshUrl: `${base}/dashboard/payments?stripe=refresh`,
	};
}
