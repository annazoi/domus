import { Prisma } from '@prisma/client';

export const propertyDetailInclude = {
	images: { orderBy: { order: 'asc' }, include: { document: true } },
	logo: true,
	amenities: {
		select: {
			value: true,
			description: true,
			selected: true,
			quantity: true,
			documents: { orderBy: { created_at: 'desc' }, take: 1 },
		},
	},
	appliances: {
		orderBy: { order: 'asc' },
		select: {
			id: true,
			title: true,
			description: true,
			order: true,
			documents: { orderBy: { created_at: 'desc' }, take: 1 },
		},
	},
} satisfies Prisma.PropertyInclude;
