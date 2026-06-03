import { environments } from '@/config/environments';

export function getAppUrl(request?: Request) {
	const configured = environments.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
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
