import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { findHostProperty } from '@/app/api/_utils/property-host';
import { mapProperty } from '@/app/api/_utils/property-map';
import { PropertyBrandingTheme } from '@/app/(pages)/templates/_constants/property-branding-theme';
import { prisma } from '@/lib/prisma';

const isBrandingTheme = (value: unknown): value is (typeof PropertyBrandingTheme)[keyof typeof PropertyBrandingTheme] =>
	typeof value === 'string' && (Object.values(PropertyBrandingTheme) as string[]).includes(value);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const existing = await findHostProperty(id, hostId);
	if (!existing) return Response.json({ message: 'Property not found' }, { status: 404 });

	const body = (await request.json()) as { branding_theme?: unknown };
	if (!isBrandingTheme(body.branding_theme)) {
		return Response.json({ message: 'Invalid branding theme.' }, { status: 400 });
	}

	const updated = await prisma.property.update({
		where: { id },
		data: { branding_theme: body.branding_theme },
		include: {
			images: { orderBy: { order: 'asc' }, include: { document: true } },
			amenities: {
				select: {
					value: true,
					description: true,
					selected: true,
					quantity: true,
					documents: { orderBy: { created_at: 'desc' }, take: 1 },
				},
			},
		},
	});

	return Response.json(mapProperty(updated));
}
