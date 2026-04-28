import { prisma } from '@/lib/prisma';

export function slugifyPropertySlug(raw: string): string {
	const s = raw
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z-]/g, '');
	return s.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export async function hasPropertySlugConflict(input: {
	slug: string;
	hostId: string;
	excludePropertyId?: string;
}): Promise<boolean> {
	const clash = await prisma.property.findFirst({
		where: {
			user_id: input.hostId,
			slug: input.slug,
			...(input.excludePropertyId ? { NOT: { id: input.excludePropertyId } } : {}),
		},
		select: { id: true },
	});
	return Boolean(clash);
}
