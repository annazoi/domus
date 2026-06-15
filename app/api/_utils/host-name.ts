import { hostNameSlugFromParts } from '@/lib/slug/host-name-slug';
import { prisma } from '@/lib/prisma';

export function resolveHostNameSlug(firstName: string, lastName: string): string {
	return hostNameSlugFromParts(firstName, lastName);
}

export async function findHostNameOwnerId(hostName: string, excludeUserId?: string): Promise<string | null> {
	const normalized = hostName.trim().toLowerCase();
	if (!normalized) return null;

	const existing = await prisma.user.findFirst({
		where: {
			host_name: normalized,
			...(excludeUserId ? { id: { not: excludeUserId } } : {}),
		},
		select: { id: true },
	});

	return existing?.id ?? null;
}

export async function assertHostNameAvailable(
	firstName: string,
	lastName: string,
	excludeUserId?: string,
): Promise<{ ok: true; host_name: string } | { ok: false; reason: 'empty' | 'taken' }> {
	const host_name = resolveHostNameSlug(firstName, lastName);
	if (!host_name) {
		return { ok: false, reason: 'empty' };
	}

	const ownerId = await findHostNameOwnerId(host_name, excludeUserId);
	if (ownerId) {
		return { ok: false, reason: 'taken' };
	}

	return { ok: true, host_name };
}
