import { prisma } from '@/lib/prisma';
import { uploadFiles } from '@/app/api/utils/cloudinary/cloudinary.service';
import {
	buildImageDocumentCreateInput,
	removeDocumentWithCloudinaryAsset,
} from '@/app/api/utils/documents/documents.service';

const userSelect = {
	id: true,
	email: true,
	first_name: true,
	last_name: true,
	phone: true,
	vat_number: true,
	bio: true,
	role: true,
	avatar_id: true,
	banner_id: true,
	created_at: true,
	updated_at: true,
	avatar: { select: { url: true } },
	banner: { select: { url: true } },
} as const;

type UserRow = {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	phone: string | null;
	vat_number: string | null;
	bio: string | null;
	role: string;
	avatar_id: string | null;
	banner_id: string | null;
	created_at: Date;
	updated_at: Date;
	avatar: { url: string } | null;
	banner: { url: string } | null;
};

function mapUser(user: UserRow) {
	return {
		id: user.id,
		uuid: user.id,
		email: user.email,
		first_name: user.first_name,
		last_name: user.last_name,
		phone: user.phone ?? undefined,
		vat_number: user.vat_number,
		bio: user.bio ?? undefined,
		role: user.role,
		avatar_url: user.avatar?.url ?? null,
		banner_url: user.banner?.url ?? null,
		created_at: user.created_at.toISOString(),
		updated_at: user.updated_at.toISOString(),
	};
}

export type UpdateUserInput = {
	first_name?: string;
	last_name?: string;
	email?: string;
	phone?: string | null;
	vat_number?: string | null;
	bio?: string | null;
};

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export const usersService = {
	async getById(id: string) {
		const user = await prisma.user.findUnique({
			where: { id },
			select: userSelect,
		});
		if (!user) return null;
		return mapUser(user);
	},

	async update(id: string, input: UpdateUserInput) {
		const first_name = input.first_name?.trim();
		const last_name = input.last_name?.trim();
		const email = input.email?.trim().toLowerCase();

		if (first_name !== undefined && !first_name) {
			return { error: 'required' as const };
		}
		if (last_name !== undefined && !last_name) {
			return { error: 'required' as const };
		}
		if (email !== undefined) {
			if (!email || !isValidEmail(email)) {
				return { error: 'email' as const };
			}
			const existing = await prisma.user.findFirst({
				where: { email, id: { not: id } },
				select: { id: true },
			});
			if (existing) {
				return { error: 'duplicate_email' as const };
			}
		}

		const phone =
			input.phone === undefined ? undefined : input.phone?.trim() ? input.phone.trim() : null;
		const vat_number =
			input.vat_number === undefined
				? undefined
				: input.vat_number?.trim()
					? input.vat_number.trim()
					: null;
		const bio = input.bio === undefined ? undefined : input.bio?.trim() ? input.bio.trim() : null;

		const user = await prisma.user.update({
			where: { id },
			data: {
				...(first_name !== undefined ? { first_name } : {}),
				...(last_name !== undefined ? { last_name } : {}),
				...(email !== undefined ? { email } : {}),
				...(phone !== undefined ? { phone } : {}),
				...(vat_number !== undefined ? { vat_number } : {}),
				...(bio !== undefined ? { bio } : {}),
			},
			select: userSelect,
		});

		return mapUser(user);
	},

	async uploadProfileImage(userId: string, field: 'avatar_id' | 'banner_id', file: File) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { avatar_id: true, banner_id: true },
		});
		if (!user) return null;

		const existingId = field === 'avatar_id' ? user.avatar_id : user.banner_id;
		if (existingId) {
			await removeDocumentWithCloudinaryAsset(existingId, userId);
		}

		const [uploaded] = await uploadFiles([file]);
		const document = await prisma.document.create({
			data: buildImageDocumentCreateInput(userId, uploaded, 0),
		});

		const updated = await prisma.user.update({
			where: { id: userId },
			data: { [field]: document.id },
			select: userSelect,
		});

		return mapUser(updated);
	},

	async removeProfileImage(userId: string, field: 'avatar_id' | 'banner_id') {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { avatar_id: true, banner_id: true },
		});
		if (!user) return null;

		const existingId = field === 'avatar_id' ? user.avatar_id : user.banner_id;
		if (existingId) {
			await removeDocumentWithCloudinaryAsset(existingId, userId);
			await prisma.user.update({
				where: { id: userId },
				data: { [field]: null },
			});
		}

		return this.getById(userId);
	},
};
