import { DocumentType, Prisma } from '@prisma/client';
import { deleteFile, UploadedCloudinaryFile } from '@/app/api/utils/cloudinary/cloudinary.service';
import { prisma } from '@/lib/prisma';
import { videoUrlSourceDocumentPath, type VideoUrlSource } from '@/lib/media/video-url';
import { filenameFromUrl, mimetypeFromFilename } from './utils/documents.utils';

const documentTypeFromResource = (resourceType: string) =>
	resourceType === 'video' ? DocumentType.VIDEO : DocumentType.IMAGE;

export const buildImageDocumentCreateInput = (
	userId: string,
	asset: UploadedCloudinaryFile,
	order: number,
): Prisma.DocumentCreateInput => {
	const extension = asset.format.toLowerCase();
	const filename = `${asset.original_filename}.${extension}`;
	const mimetype = asset.resource_type === 'image'
		? mimetypeFromFilename(filename)
		: `${asset.resource_type}/${extension}`;

	return {
		user: { connect: { id: userId } },
		filename,
		mimetype,
		size: asset.size,
		url: asset.url,
		path: asset.public_id,
		type: documentTypeFromResource(asset.resource_type),
		order,
	};
};

export const buildUrlVideoDocumentCreateInput = (
	userId: string,
	url: string,
	order: number,
	source?: VideoUrlSource,
): Prisma.DocumentCreateInput => {
	const filename = filenameFromUrl(url);
	const mimetype = mimetypeFromFilename(filename);

	return {
		user: { connect: { id: userId } },
		filename,
		mimetype: mimetype.startsWith('video/') ? mimetype : 'video/mp4',
		size: 0,
		url,
		path: source ? videoUrlSourceDocumentPath(source) : '',
		type: DocumentType.VIDEO,
		order,
	};
};

export const removeDocumentWithCloudinaryAsset = async (documentId: string, userId: string) => {
	const document = await prisma.document.findFirst({
		where: { id: documentId, user_id: userId },
		select: { id: true, path: true, type: true },
	});

	if (!document) return false;

	if (document.path?.trim()) {
		const resourceType = document.type === DocumentType.VIDEO ? 'video' : 'image';
		await deleteFile(document.path, resourceType);
	}

	await prisma.document.delete({ where: { id: document.id } });
	return true;
};
