import { environments } from '@/config/environments';

function isLocalHost(hostOrUrl: string) {
	return /localhost|127\.0\.0\.1/i.test(hostOrUrl);
}

function resolveUrlFromRequest(request: Request) {
	const origin = request.headers.get('origin')?.replace(/\/$/, '');
	if (origin) return origin;

	const host = request.headers.get('host');
	if (!host) return null;

	const protocol = isLocalHost(host) ? 'http' : 'https';
	return `${protocol}://${host}`.replace(/\/$/, '');
}

export function getAppUrl(request?: Request) {
	const fromEnv = (environments.APP_URL || environments.NEXT_PUBLIC_API_URL)?.replace(/\/$/, '') || null;
	const fromRequest = request ? resolveUrlFromRequest(request) : null;

	if (fromRequest && isLocalHost(fromRequest)) {
		return fromRequest;
	}

	if (fromEnv && !isLocalHost(fromEnv)) {
		return fromEnv;
	}

	if (fromRequest) {
		return fromRequest;
	}

	return fromEnv || 'http://localhost:3000';
}

export function getHostBillingUrls(request?: Request) {
	const base = getAppUrl(request);
	return {
		returnUrl: `${base}/dashboard/payments?stripe=return`,
		refreshUrl: `${base}/dashboard/payments?stripe=refresh`,
	};
}
