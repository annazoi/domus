import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const image = await prisma.propertyImage.findFirst({
		where: { id, property: { ownerId: hostId } },
		select: { id: true, propertyId: true },
	});
	if (!image) return Response.json({ message: 'Image not found' }, { status: 404 });

	await prisma.propertyImage.delete({ where: { id } });
	const remaining = await prisma.propertyImage.findMany({
		where: { propertyId: image.propertyId },
		orderBy: { order: 'asc' },
	});
	const existingCoverId = remaining.find((candidate) => candidate.isCover)?.id;
	const coverId = existingCoverId ?? remaining[0]?.id;
	await prisma.$transaction(
		remaining.map((item, index) =>
			prisma.propertyImage.update({
				where: { id: item.id },
				data: {
					order: index,
					isCover: item.id === coverId,
				},
			}),
		),
	);
	return Response.json({ success: true });
}
