import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { messagingService } from '@/app/api/conversations/messaging.service';
import { MessagingEvent } from '@/features/messaging/constants/messaging-events';

let io: Server | null = null;

export function getSocketServer() {
	return io;
}

export function initSocketServer(httpServer: HttpServer) {
	io = new Server(httpServer, {
		path: '/socket.io',
		cors: { origin: true, credentials: true },
	});

	io.use((socket, next) => {
		const userId = socket.handshake.auth?.userId as string | undefined;
		if (!userId) {
			next(new Error('Unauthorized'));
			return;
		}
		socket.data.userId = userId;
		next();
	});

	io.on('connection', (socket) => {
		const userId = socket.data.userId as string;

		socket.on(MessagingEvent.JOIN, async (conversationId: string) => {
			const conversation = await messagingService.getConversationForUser(conversationId, userId);
			if (!conversation) {
				socket.emit(MessagingEvent.ERROR, { message: 'Conversation not found.' });
				return;
			}
			await socket.join(roomFor(conversationId));
		});

		socket.on(MessagingEvent.LEAVE, (conversationId: string) => {
			void socket.leave(roomFor(conversationId));
		});

		socket.on(MessagingEvent.SEND, async (payload: { conversation_id: string; body: string }) => {
			const result = await messagingService.sendMessage(
				payload.conversation_id,
				userId,
				payload.body ?? '',
			);

			if ('error' in result) {
				socket.emit(MessagingEvent.ERROR, {
					message:
						result.error === 'not_found'
							? 'Conversation not found.'
							: 'Message body is required.',
				});
				return;
			}

			io?.to(roomFor(payload.conversation_id)).emit(MessagingEvent.NEW, result);
		});
	});

	return io;
}

function roomFor(conversationId: string) {
	return `conversation:${conversationId}`;
}
