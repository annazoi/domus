import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { uploadFiles } from '@/app/api/services/cloudinary/cloudinary.service';
import {
	buildImageDocumentCreateInput,
	removeDocumentWithCloudinaryAsset,
} from '@/app/api/services/documents/documents.service';
import { propertyImagesService } from './images.service';

interface ImagePayload {
	reorder_ids?: string[];
	cover_image_id?: string;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const property = await propertyImagesService.findHostProperty(hostId, id);
	if (!property) return Response.json({ message: 'Property not found' }, { status: 404 });

	const contentType = request.headers.get('content-type') ?? '';
	if (!contentType.includes('multipart/form-data')) {
		const body = (await request.json()) as ImagePayload;
		if (!body.reorder_ids?.length) {
			return Response.json({ message: 'Invalid payload' }, { status: 400 });
		}

		await propertyImagesService.reorder(id, body.reorder_ids, body.cover_image_id);
		const reordered = await propertyImagesService.listByProperty(id);
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
	const existingCount = await propertyImagesService.countByProperty(id);
	const created = await propertyImagesService.createMany({
		hostId,
		propertyId: id,
		existingCount,
		uploadedFiles,
		descriptions,
		buildImageDocumentCreateInput,
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

	const image = await propertyImagesService.findHostPropertyImage(hostId, id, imageId);
	if (!image) return Response.json({ message: 'Image not found' }, { status: 404 });

	if (image.document_id) {
		await removeDocumentWithCloudinaryAsset(image.document_id, hostId);
	}
	await propertyImagesService.deleteById(imageId);
	await propertyImagesService.normalizeOrderAndCover(image.property_id);

	return Response.json({ success: true });
}
