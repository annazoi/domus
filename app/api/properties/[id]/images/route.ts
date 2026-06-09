import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { uploadFiles } from '@/app/api/utils/cloudinary/cloudinary.service';
import {
	buildImageDocumentCreateInput,
	buildUrlVideoDocumentCreateInput,
	removeDocumentWithCloudinaryAsset,
} from '@/app/api/utils/documents/documents.service';
import { isVideoUrlSource, type VideoUrlSource } from '@/lib/media/video-url';
import { propertyImagesService } from './images.service';

interface ImagePayload {
	reorder_ids?: string[];
	cover_image_id?: string;
}

type UrlEntry = { url: string; description: string; source?: VideoUrlSource };

const parseJsonArray = <T>(raw: FormDataEntryValue | null, fallback: T[]): T[] => {
	if (typeof raw !== 'string' || !raw.trim()) return fallback;
	try {
		const parsed = JSON.parse(raw) as unknown;
		return Array.isArray(parsed) ? (parsed as T[]) : fallback;
	} catch {
		return fallback;
	}
};

const isValidHttpUrl = (value: string) => {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
};

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
	const descriptions = parseJsonArray<string>(formData.get('descriptions'), []).map((d) =>
		typeof d === 'string' ? d : '',
	);
	const urlEntries = parseJsonArray<UrlEntry>(formData.get('url_entries'), [])
		.filter((entry) => entry && typeof entry.url === 'string' && isValidHttpUrl(entry.url.trim()))
		.map((entry) => ({
			url: entry.url.trim(),
			description: typeof entry.description === 'string' ? entry.description : '',
			source: isVideoUrlSource(entry.source ?? '') ? entry.source : undefined,
		}));

	if (!files.length && !urlEntries.length) {
		return Response.json({ message: 'At least one image or video is required' }, { status: 400 });
	}

	const existingCount = await propertyImagesService.countByProperty(id);
	const created = [];

	if (files.length) {
		const uploadedFiles = await uploadFiles(files);
		const fromFiles = await propertyImagesService.createMany({
			hostId,
			propertyId: id,
			existingCount,
			uploadedFiles,
			descriptions,
			buildImageDocumentCreateInput,
		});
		created.push(...fromFiles);
	}

	if (urlEntries.length) {
		const fromUrls = await propertyImagesService.createManyFromUrls({
			hostId,
			propertyId: id,
			existingCount: existingCount + files.length,
			urlEntries,
			buildUrlVideoDocumentCreateInput,
		});
		created.push(...fromUrls);
	}

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
