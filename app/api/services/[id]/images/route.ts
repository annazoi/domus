import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { uploadFiles } from '@/app/api/utils/cloudinary/cloudinary.service';
import {
	buildImageDocumentCreateInput,
	removeDocumentWithCloudinaryAsset,
} from '@/app/api/utils/documents/documents.service';
import { serviceImagesService } from './images.service';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const service = await serviceImagesService.findHostService(hostId, id);
	if (!service) return Response.json({ message: 'Service not found' }, { status: 404 });

	const images = await serviceImagesService.listByService(id);
	return Response.json(images);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const service = await serviceImagesService.findHostService(hostId, id);
	if (!service) return Response.json({ message: 'Service not found' }, { status: 404 });

	const contentType = request.headers.get('content-type') ?? '';
	if (!contentType.includes('multipart/form-data')) {
		return Response.json({ message: 'Invalid payload' }, { status: 400 });
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
	const existingCount = await serviceImagesService.countByService(id);
	const created = await serviceImagesService.createMany({
		hostId,
		serviceId: id,
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

	const image = await serviceImagesService.findHostServiceImage(hostId, id, imageId);
	if (!image) return Response.json({ message: 'Image not found' }, { status: 404 });

	if (image.document_id) {
		await removeDocumentWithCloudinaryAsset(image.document_id, hostId);
	}
	await serviceImagesService.deleteById(imageId);
	await serviceImagesService.normalizeOrder(image.service_id);

	return Response.json({ success: true });
}
