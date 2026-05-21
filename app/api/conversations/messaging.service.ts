import { prisma } from '@/lib/prisma';
import type {
	ConversationRow,
	CreateConversationInput,
	MessageRow,
} from '@/features/messaging/interfaces/messaging.interface';

const conversationInclude = {
	property: { select: { title: true } },
	host: { select: { id: true, first_name: true, last_name: true } },
	guest: { select: { id: true, first_name: true, last_name: true } },
	messages: {
		orderBy: { created_at: 'desc' as const },
		take: 1,
		select: { body: true },
	},
} as const;

function formatName(first: string, last: string) {
	return `${first} ${last}`.trim();
}

function mapConversation(row: {
	id: string;
	property_id: string;
	updated_at: Date;
	host_user_id: string;
	guest_user_id: string;
	property: { title: string };
	host: { id: string; first_name: string; last_name: string };
	guest: { id: string; first_name: string; last_name: string };
	messages: { body: string }[];
}, viewerId: string): ConversationRow {
	const isHost = row.host_user_id === viewerId;
	const other = isHost ? row.guest : row.host;

	return {
		id: row.id,
		property_id: row.property_id,
		property_title: row.property.title,
		other_user_id: other.id,
		other_user_name: formatName(other.first_name, other.last_name),
		preview: row.messages[0]?.body ?? null,
		updated_at: row.updated_at.toISOString(),
	};
}

function mapMessage(
	row: { id: string; conversation_id: string; sender_id: string; body: string; created_at: Date },
	viewerId: string,
): MessageRow {
	return {
		id: row.id,
		conversation_id: row.conversation_id,
		sender_id: row.sender_id,
		body: row.body,
		created_at: row.created_at.toISOString(),
		is_mine: row.sender_id === viewerId,
	};
}

export const messagingService = {
	async listConversations(userId: string) {
		const rows = await prisma.conversation.findMany({
			where: {
				OR: [{ host_user_id: userId }, { guest_user_id: userId }],
			},
			orderBy: { updated_at: 'desc' },
			include: conversationInclude,
		});

		return rows.map((row) => mapConversation(row, userId));
	},

	async getConversationForUser(conversationId: string, userId: string) {
		const row = await prisma.conversation.findFirst({
			where: {
				id: conversationId,
				OR: [{ host_user_id: userId }, { guest_user_id: userId }],
			},
			include: conversationInclude,
		});

		if (!row) return null;
		return mapConversation(row, userId);
	},

	async listMessages(conversationId: string, userId: string, limit = 50) {
		const conversation = await prisma.conversation.findFirst({
			where: {
				id: conversationId,
				OR: [{ host_user_id: userId }, { guest_user_id: userId }],
			},
			select: { id: true },
		});

		if (!conversation) return null;

		const rows = await prisma.message.findMany({
			where: { conversation_id: conversationId },
			orderBy: { created_at: 'asc' },
			take: limit,
		});

		return rows.map((row) => mapMessage(row, userId));
	},

	async createConversation(userId: string, input: CreateConversationInput) {
		const property = await prisma.property.findUnique({
			where: { id: input.property_id },
			select: { id: true, user_id: true },
		});

		if (!property) return { error: 'property_not_found' as const };

		let hostUserId: string;
		let guestUserId: string;

		if (input.guest_user_id) {
			hostUserId = property.user_id;
			guestUserId = input.guest_user_id;
			if (userId !== hostUserId && userId !== guestUserId) {
				return { error: 'forbidden' as const };
			}
		} else if (input.host_user_id) {
			hostUserId = input.host_user_id;
			guestUserId = userId;
			if (userId !== guestUserId) {
				return { error: 'forbidden' as const };
			}
		} else {
			return { error: 'invalid' as const };
		}

		if (hostUserId === guestUserId) {
			return { error: 'invalid' as const };
		}

		const row = await prisma.conversation.upsert({
			where: {
				host_user_id_guest_user_id_property_id: {
					host_user_id: hostUserId,
					guest_user_id: guestUserId,
					property_id: property.id,
				},
			},
			create: {
				host_user_id: hostUserId,
				guest_user_id: guestUserId,
				property_id: property.id,
			},
			update: {},
			include: conversationInclude,
		});

		return mapConversation(row, userId);
	},

	async sendMessage(conversationId: string, senderId: string, body: string) {
		const trimmed = body.trim();
		if (!trimmed) return { error: 'empty' as const };

		const conversation = await prisma.conversation.findFirst({
			where: {
				id: conversationId,
				OR: [{ host_user_id: senderId }, { guest_user_id: senderId }],
			},
			select: { id: true },
		});

		if (!conversation) return { error: 'not_found' as const };

		const [message] = await prisma.$transaction([
			prisma.message.create({
				data: {
					conversation_id: conversationId,
					sender_id: senderId,
					body: trimmed,
				},
			}),
			prisma.conversation.update({
				where: { id: conversationId },
				data: { updated_at: new Date() },
			}),
		]);

		return mapMessage(message, senderId);
	},
};
