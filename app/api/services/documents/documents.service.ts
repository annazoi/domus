import { DocumentType, Prisma } from '@prisma/client';
import { deleteFile, UploadedCloudinaryFile } from '@/app/api/services/cloudinary/cloudinary.service';
import { prisma } from '@/lib/prisma';
import { mimetypeFromFilename } from './utils/documents.utils';


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
		type: DocumentType.IMAGE,
		order,
	};
};

export const removeDocumentWithCloudinaryAsset = async (documentId: string, userId: string) => {
	const document = await prisma.document.findFirst({
		where: { id: documentId, user_id: userId },
		select: { id: true, path: true },
	});

	if (!document) return false;

	if (document.path?.trim()) {
		await deleteFile(document.path);
	}

	await prisma.document.delete({ where: { id: document.id } });
	return true;
};
