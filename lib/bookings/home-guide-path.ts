import { hostNameSlugFromParts } from '@/lib/slug/host-name-slug';

export function resolveHostGuideSlug(host: {
	host_name?: string | null;
	first_name: string;
	last_name: string;
}) {
	const stored = host.host_name?.trim().toLowerCase();
	if (stored) return stored;
	return hostNameSlugFromParts(host.first_name, host.last_name);
}

export function homeGuidePath(hostName: string, bookingId?: string) {
	const slug = hostName.trim().toLowerCase();
	if (!bookingId) return `/${slug}`;
	return `/${slug}?booking=${bookingId}`;
}

export function homeGuidePathFromHost(
	host: {
		host_name?: string | null;
		first_name: string;
		last_name: string;
	},
	bookingId: string,
) {
	return homeGuidePath(resolveHostGuideSlug(host), bookingId);
}
