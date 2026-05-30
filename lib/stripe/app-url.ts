import { environments } from '@/config/environments';

export function getAppUrl(request?: Request) {
	if (environments.NEXT_PUBLIC_APP_URL) {
		return environments.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
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
	return 'http://localhost:3000';
}
