import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { prisma } from '@/lib/prisma';

interface ImagePayload {
	urls?: string[];
	reorder_ids?: string[];
	cover_image_id?: string;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const body = (await request.json()) as ImagePayload;
	const property = await prisma.property.findFirst({
		where: { id, user_id: hostId },
		select: { id: true },
	});
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	if (body.reorder_ids?.length) {
		await prisma.$transaction(async (tx) => {
			for (const [index, imageId] of body.reorder_ids!.entries()) {
				await tx.propertyImage.updateMany({
					where: { id: imageId, property_id: id },
					data: { order: index },
				});
			}

			if (body.cover_image_id) {
				await tx.propertyImage.updateMany({
					where: { property_id: id },
					data: { is_cover: false },
				});
				await tx.propertyImage.updateMany({
					where: { id: body.cover_image_id, property_id: id },
					data: { is_cover: true },
				});
			}
		});

		const reordered = await prisma.propertyImage.findMany({
			where: { property_id: id },
			orderBy: { order: 'asc' },
		});
		return Response.json(reordered);
	}

	if (!body.urls?.length) {
		return Response.json({ message: 'At least one image url is required' }, { status: 400 });
	}
	const existingCount = await prisma.propertyImage.count({ where: { property_id: id } });
	const created = await prisma.$transaction(
		body.urls.map((url, index) =>
			prisma.propertyImage.create({
				data: {
					property_id: id,
					user_id: hostId,
					url,
					order: existingCount + index,
					is_cover: existingCount === 0 && index === 0,
				},
			}),
		),
	);
	return Response.json(created, { status: 201 });
}
