import { Prisma } from '@prisma/client';
import type { UploadedCloudinaryFile } from '@/app/api/utils/cloudinary/cloudinary.service';
import { prisma } from '@/lib/prisma';

export const serviceImagesService = {
	findHostService(hostId: string, serviceId: string) {
		return prisma.service.findFirst({
			where: { id: serviceId, host_user_id: hostId },
			select: { id: true },
		});
	},

	listByService(serviceId: string) {
		return prisma.serviceImage.findMany({
			where: { service_id: serviceId },
			orderBy: { order: 'asc' },
			include: { document: true },
		});
	},

	async reorder(serviceId: string, reorderIds: string[]) {
		await prisma.$transaction(async (tx) => {
			for (const [index, imageId] of reorderIds.entries()) {
				await tx.serviceImage.updateMany({
					where: { id: imageId, service_id: serviceId },
					data: { order: index },
				});
			}
		});
	},

	countByService(serviceId: string) {
		return prisma.serviceImage.count({ where: { service_id: serviceId } });
	},

	createMany(input: {
		hostId: string;
		serviceId: string;
		existingCount: number;
		uploadedFiles: UploadedCloudinaryFile[];
		descriptions: string[];
		buildImageDocumentCreateInput: (
			hostId: string,
			file: UploadedCloudinaryFile,
			order: number,
		) => Prisma.DocumentCreateInput;
	}) {
		const { hostId, serviceId, existingCount, uploadedFiles, descriptions, buildImageDocumentCreateInput } = input;
		return prisma.$transaction(async (tx) => {
			const inserted = [];
			for (const [index, file] of uploadedFiles.entries()) {
				const nextOrder = existingCount + index;
				const document = await tx.document.create({
					data: buildImageDocumentCreateInput(hostId, file, nextOrder),
				});
				const description = descriptions[index]?.trim() || null;
				const image = await tx.serviceImage.create({
					data: {
						service_id: serviceId,
						user_id: hostId,
						document_id: document.id,
						order: nextOrder,
						description,
					},
					include: { document: true },
				});
				inserted.push(image);
			}
			return inserted;
		});
	},

	findHostServiceImage(hostId: string, serviceId: string, imageId: string) {
		return prisma.serviceImage.findFirst({
			where: { id: imageId, service_id: serviceId, service: { host_user_id: hostId } },
			select: { id: true, service_id: true, document_id: true },
		});
	},

	deleteById(imageId: string) {
		return prisma.serviceImage.delete({ where: { id: imageId } });
	},

	async normalizeOrder(serviceId: string) {
		const remaining = await prisma.serviceImage.findMany({
			where: { service_id: serviceId },
			orderBy: { order: 'asc' },
		});
		await prisma.$transaction(
			remaining.map((item, index) =>
				prisma.serviceImage.update({
					where: { id: item.id },
					data: { order: index },
				}),
			),
		);
	},
};
