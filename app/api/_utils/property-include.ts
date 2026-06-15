import { Prisma } from '@prisma/client';

export const propertyDetailInclude = {
	user: {
		select: {
			id: true,
			first_name: true,
			last_name: true,
			host_name: true,
			bio: true,
			avatar: { select: { url: true } },
		},
	},
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
