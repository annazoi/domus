import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { uploadFiles } from '@/app/api/services/cloudinary/cloudinary.service';
import { buildImageDocumentCreateInput } from '@/app/api/services/documents/documents.service';
import { prisma } from '@/lib/prisma';

interface ImagePayload {
	reorder_ids?: string[];
	cover_image_id?: string;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const property = await prisma.property.findFirst({
		where: { id, user_id: hostId },
		select: { id: true },
	});
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	const contentType = request.headers.get('content-type') ?? '';
	if (!contentType.includes('multipart/form-data')) {
		const body = (await request.json()) as ImagePayload;
		if (!body.reorder_ids?.length) {
			return Response.json({ message: 'Invalid payload' }, { status: 400 });
		}

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
			include: { document: true },
		});
		return Response.json(reordered);
	}

	const formData = await request.formData();
	const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);
	if (!files.length) {
		return Response.json({ message: 'At least one image is required' }, { status: 400 });
	}

	const uploadedFiles = await uploadFiles(files);
	const existingCount = await prisma.propertyImage.count({ where: { property_id: id } });
	const created = await prisma.$transaction(async (tx) => {
		const inserted = [];
		for (const [index, file] of uploadedFiles.entries()) {
			const nextOrder = existingCount + index;
			const document = await tx.document.create({
				data: buildImageDocumentCreateInput(hostId, file, nextOrder),
			});

			const image = await tx.propertyImage.create({
				data: {
					property_id: id,
					user_id: hostId,
					document_id: document.id,
					order: nextOrder,
					is_cover: existingCount === 0 && index === 0,
				},
				include: { document: true },
			});
			inserted.push(image);
		}
		return inserted;
	});
	return Response.json(created, { status: 201 });
}
