export function getAppUrl(request?: Request) {
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
