import { prisma } from '@/lib/prisma';

export async function findHostProperty(id: string, hostId: string) {
	return prisma.property.findFirst({
		where: { id, user_id: hostId },
		include: { images: { orderBy: { order: 'asc' } } },
	});
}
