import { Prisma } from '@prisma/client';
import type { UploadedCloudinaryFile } from '@/app/api/utils/cloudinary/cloudinary.service';
import { prisma } from '@/lib/prisma';
import type { VideoUrlSource } from '@/lib/media/video-url';

export const propertyImagesService = {
	findHostProperty(hostId: string, propertyId: string) {
		return prisma.property.findFirst({
			where: { id: propertyId, user_id: hostId },
			select: { id: true },
		});
	},

	async reorder(propertyId: string, reorderIds: string[], coverImageId?: string) {
		await prisma.$transaction(async (tx) => {
			for (const [index, imageId] of reorderIds.entries()) {
				await tx.propertyImage.updateMany({
					where: { id: imageId, property_id: propertyId },
					data: { order: index },
				});
			}

			if (coverImageId) {
				await tx.propertyImage.updateMany({
					where: { property_id: propertyId },
					data: { is_cover: false },
				});
				await tx.propertyImage.updateMany({
					where: { id: coverImageId, property_id: propertyId },
					data: { is_cover: true },
				});
			}
		});
	},

	listByProperty(propertyId: string) {
		return prisma.propertyImage.findMany({
			where: { property_id: propertyId },
			orderBy: { order: 'asc' },
			include: { document: true },
		});
	},

	countByProperty(propertyId: string) {
		return prisma.propertyImage.count({ where: { property_id: propertyId } });
	},

	createMany(input: {
		hostId: string;
		propertyId: string;
		existingCount: number;
		uploadedFiles: UploadedCloudinaryFile[];
		descriptions: string[];
		buildImageDocumentCreateInput: (
			hostId: string,
			file: UploadedCloudinaryFile,
			order: number,
		) => Prisma.DocumentCreateInput;
	}) {
		const { hostId, propertyId, existingCount, uploadedFiles, descriptions, buildImageDocumentCreateInput } = input;
		return prisma.$transaction(async (tx) => {
			const inserted = [];
			for (const [index, file] of uploadedFiles.entries()) {
				const nextOrder = existingCount + index;
				const document = await tx.document.create({
					data: buildImageDocumentCreateInput(hostId, file, nextOrder),
				});
				const description = descriptions[index]?.trim() || null;
				const image = await tx.propertyImage.create({
					data: {
						property_id: propertyId,
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
	},

	createManyFromUrls(input: {
		hostId: string;
		propertyId: string;
		existingCount: number;
		urlEntries: { url: string; description: string; source?: VideoUrlSource }[];
		buildUrlVideoDocumentCreateInput: (
			hostId: string,
			url: string,
			order: number,
			source?: VideoUrlSource,
		) => Prisma.DocumentCreateInput;
	}) {
		const { hostId, propertyId, existingCount, urlEntries, buildUrlVideoDocumentCreateInput } = input;
		return prisma.$transaction(async (tx) => {
			const inserted = [];
			for (const [index, entry] of urlEntries.entries()) {
				const nextOrder = existingCount + index;
				const document = await tx.document.create({
					data: buildUrlVideoDocumentCreateInput(hostId, entry.url, nextOrder, entry.source),
				});
				const description = entry.description?.trim() || null;
				const image = await tx.propertyImage.create({
					data: {
						property_id: propertyId,
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
	},

	findHostPropertyImage(hostId: string, propertyId: string, imageId: string) {
		return prisma.propertyImage.findFirst({
			where: { id: imageId, property_id: propertyId, property: { user_id: hostId } },
			select: { id: true, property_id: true, document_id: true },
		});
	},

	deleteById(imageId: string) {
		return prisma.propertyImage.delete({ where: { id: imageId } });
	},

	async normalizeOrderAndCover(propertyId: string) {
		const remaining = await prisma.propertyImage.findMany({
			where: { property_id: propertyId },
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
	},
};
