import { prisma } from '@/lib/prisma';

export function slugifyPropertySlug(raw: string): string {
	const s = raw
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
	return s.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export async function uniquePropertySlug(baseRaw: string, excludePropertyId?: string): Promise<string> {
	const base = slugifyPropertySlug(baseRaw) || 'listing';
	let candidate = base;
	let n = 0;
	for (;;) {
		const clash = await prisma.property.findFirst({
			where: {
				slug: candidate,
				...(excludePropertyId ? { NOT: { id: excludePropertyId } } : {}),
			},
			select: { id: true },
		});
		if (!clash) return candidate;
		n += 1;
		candidate = `${base}-${n}`;
	}
}
