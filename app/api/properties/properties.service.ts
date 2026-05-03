import { RoomTypes } from '@/config/constants/dropdowns/room-type.options';
import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { parseTimeToUtcDate } from '../_utils/time-of-day';

const intOr = (value: unknown, fallback: number) => {
	const n = Number(value);
	return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

const propertyInclude = {
	images: { orderBy: { order: 'asc' }, include: { document: true } },
	amenities: {
		select: {
			value: true,
			description: true,
			selected: true,
			quantity: true,
			documents: { orderBy: { created_at: 'desc' }, take: 1 },
		},
	},
} satisfies Prisma.PropertyInclude;

type PropertyUpsertInput = {
	body: UpsertPropertyInput;
	hostId: string;
	slug: string;
};

const toPropertyData = ({ body, hostId, slug }: PropertyUpsertInput) => ({
	title: body.title.trim(),
	slug,
	description: body.description?.trim() || null,
	short_description: body.short_description?.trim() || null,
	property_type: (body.property_type ?? '').trim() || 'property',
	room_type: (body.room_type ?? '').trim() || RoomTypes.ENTIRE_PLACE,
	check_in_time: parseTimeToUtcDate(body.check_in_time, '15:00'),
	check_out_time: parseTimeToUtcDate(body.check_out_time, '11:00'),
	max_guests: Math.max(1, intOr(body.max_guests, 1)),
	bedrooms: Math.max(0, intOr(body.bedrooms, 1)),
	beds: Math.max(0, intOr(body.beds, 1)),
	bathrooms: Math.max(0, intOr(body.bathrooms, 1)),
	country: (body.country ?? '').trim(),
	city: (body.city ?? '').trim(),
	address: (body.address ?? '').trim(),
	latitude: body.lat ?? 0,
	longitude: body.lng ?? 0,
	isPublished: body.isVisible ?? false,
	user_id: hostId,
});

const toPropertyUpdateData = ({ body, slug }: Omit<PropertyUpsertInput, 'hostId'>) => ({
	title: body.title.trim(),
	slug,
	description: body.description?.trim() || null,
	short_description: body.short_description?.trim() || null,
	property_type: (body.property_type ?? '').trim() || 'property',
	room_type: (body.room_type ?? '').trim() || RoomTypes.ENTIRE_PLACE,
	check_in_time: parseTimeToUtcDate(body.check_in_time, '15:00'),
	check_out_time: parseTimeToUtcDate(body.check_out_time, '11:00'),
	max_guests: Math.max(1, intOr(body.max_guests, 1)),
	bedrooms: Math.max(0, intOr(body.bedrooms, 1)),
	beds: Math.max(0, intOr(body.beds, 1)),
	bathrooms: Math.max(0, intOr(body.bathrooms, 1)),
	country: (body.country ?? '').trim(),
	city: (body.city ?? '').trim(),
	address: (body.address ?? '').trim(),
	latitude: body.lat ?? 0,
	longitude: body.lng ?? 0,
	isPublished: body.isVisible ?? false,
});

export const propertyService = {
	listByHost(hostId: string) {
		return prisma.property.findMany({
			where: { user_id: hostId },
			orderBy: { created_at: 'desc' },
			include: propertyInclude,
		});
	},

	findByHostAndId(hostId: string, propertyId: string) {
		return prisma.property.findFirst({
			where: { id: propertyId, user_id: hostId },
			include: propertyInclude,
		});
	},

	findByHostAndSlug(hostId: string, slug: string) {
		return prisma.property.findFirst({
			where: { slug, user_id: hostId },
			include: propertyInclude,
		});
	},

	create(hostId: string, body: UpsertPropertyInput, slug: string) {
		return prisma.property.create({
			data: toPropertyData({ body, hostId, slug }),
			include: propertyInclude,
		});
	},

	update(propertyId: string, body: UpsertPropertyInput, slug: string) {
		return prisma.property.update({
			where: { id: propertyId },
			data: toPropertyUpdateData({ body, slug }),
			include: propertyInclude,
		});
	},

	delete(hostId: string, propertyId: string) {
		return prisma.property.deleteMany({
			where: { id: propertyId, user_id: hostId },
		});
	},
};
