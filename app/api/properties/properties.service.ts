import { RoomTypes } from '@/config/constants/dropdowns/room-type.options';
import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { buildPaginationMeta, type PaginatedResult } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { normalizeRichTextForDb } from '@/lib/rich-text/normalize-rich-text-for-db';
import { Prisma } from '@prisma/client';
import { propertyDetailInclude } from '../_utils/property-include';
import { parseTimeToUtcDate } from '../_utils/time-of-day';

export const PROPERTIES_SEARCH_MIN_LENGTH = 2;

function buildPropertySearchWhere(hostId: string, query?: string): Prisma.PropertyWhereInput {
	const base: Prisma.PropertyWhereInput = { user_id: hostId };
	const trimmed = query?.trim();
	if (!trimmed || trimmed.length < PROPERTIES_SEARCH_MIN_LENGTH) return base;

	const insensitive = { contains: trimmed, mode: 'insensitive' as const };

	return {
		...base,
		OR: [
			{ id: insensitive },
			{ title: insensitive },
			{ slug: insensitive },
			{ description: insensitive },
			{ short_description: insensitive },
			{ location_access: insensitive },
			{ welcome_message: insensitive },
			{ door_code: insensitive },
			{ safe_box_code: insensitive },
			{ house_rules_instructions: insensitive },
			{ city: insensitive },
			{ country: insensitive },
			{ address: insensitive },
			{ property_type: insensitive },
			{ room_type: insensitive },
		],
	};
}

const intOr = (value: unknown, fallback: number) => {
	const n = Number(value);
	return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

const propertyInclude = propertyDetailInclude;

type PropertyUpsertInput = {
	body: UpsertPropertyInput;
	hostId: string;
	slug: string;
};

const toPropertyData = ({ body, hostId, slug }: PropertyUpsertInput) => ({
	title: body.title.trim(),
	slug,
	description: normalizeRichTextForDb(body.description),
	short_description: normalizeRichTextForDb(body.short_description),
	location_access: normalizeRichTextForDb(body.location_access),
	welcome_message: normalizeRichTextForDb(body.welcome_message),
	property_type: (body.property_type ?? '').trim() || 'property',
	room_type: (body.room_type ?? '').trim() || RoomTypes.ENTIRE_PLACE,
	check_in_time: parseTimeToUtcDate(body.check_in_time, '15:00'),
	check_out_time: parseTimeToUtcDate(body.check_out_time, '11:00'),
	door_code: body.door_code?.trim() || null,
	safe_box_code: body.safe_box_code?.trim() || null,
	house_rules_instructions: normalizeRichTextForDb(body.house_rules_instructions),
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
	description: normalizeRichTextForDb(body.description),
	short_description: normalizeRichTextForDb(body.short_description),
	location_access: normalizeRichTextForDb(body.location_access),
	welcome_message: normalizeRichTextForDb(body.welcome_message),
	property_type: (body.property_type ?? '').trim() || 'property',
	room_type: (body.room_type ?? '').trim() || RoomTypes.ENTIRE_PLACE,
	check_in_time: parseTimeToUtcDate(body.check_in_time, '15:00'),
	check_out_time: parseTimeToUtcDate(body.check_out_time, '11:00'),
	door_code: body.door_code?.trim() || null,
	safe_box_code: body.safe_box_code?.trim() || null,
	house_rules_instructions: normalizeRichTextForDb(body.house_rules_instructions),
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

	async listByHostPaginated(hostId: string, page: number, pageSize: number, search?: string) {
		const where = buildPropertySearchWhere(hostId, search);

		const [total, rows] = await Promise.all([
			prisma.property.count({ where }),
			prisma.property.findMany({
				where,
				orderBy: { created_at: 'desc' },
				skip: (page - 1) * pageSize,
				take: pageSize,
				include: propertyInclude,
			}),
		]);

		return {
			items: rows,
			pagination: buildPaginationMeta(page, pageSize, total),
		} satisfies PaginatedResult<(typeof rows)[number]>;
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

	findPublishedByRef(ref: string) {
		return prisma.property.findFirst({
			where: {
				OR: [{ id: ref }, { slug: ref }],
				isPublished: true,
			},
			include: propertyInclude,
		});
	},

	create(hostId: string, body: UpsertPropertyInput, slug: string) {
		return prisma.$transaction(async (tx) => {
			await tx.user.update({
				where: { id: hostId },
				data: { is_host: true },
			});
			return tx.property.create({
				data: toPropertyData({ body, hostId, slug }),
				include: propertyInclude,
			});
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
