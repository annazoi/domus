import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { prisma } from '@/lib/prisma';

interface ImagePayload {
	urls?: string[];
	reorderIds?: string[];
	coverImageId?: string;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const body = (await request.json()) as ImagePayload;
	const property = await prisma.property.findFirst({
		where: { id, ownerId: hostId },
		select: { id: true },
	});
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	if (body.reorderIds?.length) {
		await prisma.$transaction(async (tx) => {
			for (const [index, imageId] of body.reorderIds!.entries()) {
				await tx.propertyImage.updateMany({
					where: { id: imageId, propertyId: id },
					data: { order: index },
				});
			}

			if (body.coverImageId) {
				await tx.propertyImage.updateMany({
					where: { propertyId: id },
					data: { isCover: false },
				});
				await tx.propertyImage.updateMany({
					where: { id: body.coverImageId, propertyId: id },
					data: { isCover: true },
				});
			}
		});

		const reordered = await prisma.propertyImage.findMany({
			where: { propertyId: id },
			orderBy: { order: 'asc' },
		});
		return Response.json(reordered);
	}

	if (!body.urls?.length) {
		return Response.json({ message: 'At least one image url is required' }, { status: 400 });
	}
	const existingCount = await prisma.propertyImage.count({ where: { propertyId: id } });
	const created = await prisma.$transaction(
		body.urls.map((url, index) =>
			prisma.propertyImage.create({
				data: {
					propertyId: id,
					url,
					order: existingCount + index,
					isCover: existingCount === 0 && index === 0,
				},
			}),
		),
	);
	return Response.json(created, { status: 201 });
}
