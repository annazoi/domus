import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { uploadFiles } from '@/app/api/services/cloudinary/cloudinary.service';
import {
	buildImageDocumentCreateInput,
	removeDocumentWithCloudinaryAsset,
} from '@/app/api/services/documents/documents.service';
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

	const descriptionsRaw = formData.get('descriptions');
	let descriptions: string[] = [];
	if (typeof descriptionsRaw === 'string' && descriptionsRaw.trim()) {
		try {
			const parsed = JSON.parse(descriptionsRaw) as unknown;
			if (Array.isArray(parsed)) {
				descriptions = parsed.map((d) => (typeof d === 'string' ? d : ''));
			}
		} catch {
			// ignore invalid JSON
		}
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

			const description = descriptions[index]?.trim() || null;
			const image = await tx.propertyImage.create({
				data: {
					property_id: id,
					user_id: hostId,
					document_id: document.id,
					order: nextOrder,
					is_cover: existingCount === 0 && index === 0,
					description,
				},
				include: { document: true },
			});
			inserted.push(image);
		}
		return inserted;
	});
	return Response.json(created, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const imageId = new URL(request.url).searchParams.get('image_id');
	if (!imageId) {
		return Response.json({ message: 'image_id is required.' }, { status: 400 });
	}

	const image = await prisma.propertyImage.findFirst({
		where: { id: imageId, property_id: id, property: { user_id: hostId } },
		select: { id: true, property_id: true, document_id: true },
	});
	if (!image) return Response.json({ message: 'Image not found' }, { status: 404 });

	if (image.document_id) {
		await removeDocumentWithCloudinaryAsset(image.document_id, hostId);
	}
	await prisma.propertyImage.delete({ where: { id: imageId } });
	const remaining = await prisma.propertyImage.findMany({
		where: { property_id: image.property_id },
		orderBy: { order: 'asc' },
	});
	const existingCoverId = remaining.find((candidate) => candidate.is_cover)?.id;
	const coverId = existingCoverId ?? remaining[0]?.id;
	await prisma.$transaction(
		remaining.map((item, index) =>
			prisma.propertyImage.update({
				where: { id: item.id },
				data: {
					order: index,
					is_cover: item.id === coverId,
				},
			}),
		),
	);

	return Response.json({ success: true });
}
