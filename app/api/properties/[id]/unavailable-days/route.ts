import { prisma } from '@/lib/prisma';
import { toApiDate } from '@/features/property-availability/utils/date';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const property = await prisma.property.findFirst({
		where: {
			OR: [{ id }, { slug: id }],
			isPublished: true,
		},
		select: { id: true },
	});

	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	const rows = await prisma.propertyAvailability.findMany({
		where: {
			property_id: property.id,
			is_available: false,
		},
		select: { date: true },
		orderBy: { date: 'asc' },
	});

	const unique = new Set<string>();
	for (const row of rows) {
		unique.add(toApiDate(row.date.toISOString()));
	}

	const unavailable_dates = [...unique].sort();

	return Response.json({ unavailable_dates });
}
