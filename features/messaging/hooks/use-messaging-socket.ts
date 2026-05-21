'use client';

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getAuthStoreState } from '@/store/auth';
import { MessagingEvent } from '../constants/messaging-events';
import type { MessageRow } from '../interfaces/messaging.interface';

export function useMessagingSocket(
	conversationId: string | null,
	onMessage: (message: MessageRow) => void,
) {
	const socketRef = useRef<Socket | null>(null);
	const onMessageRef = useRef(onMessage);

	useEffect(() => {
		onMessageRef.current = onMessage;
	}, [onMessage]);

	useEffect(() => {
		const userId = getAuthStoreState().user_uuid;
		if (!userId) return;

		const socket = io({
			path: '/socket.io',
			auth: { userId },
		});

		socketRef.current = socket;

		socket.on(MessagingEvent.NEW, (message: MessageRow) => {
			onMessageRef.current(message);
		});

		return () => {
			socket.disconnect();
			socketRef.current = null;
		};
	}, []);

	useEffect(() => {
		const socket = socketRef.current;
		if (!socket || !conversationId) return;

		const join = () => {
			socket.emit(MessagingEvent.JOIN, conversationId);
		};

		if (socket.connected) {
			join();
		} else {
			socket.on('connect', join);
		}

		return () => {
			socket.off('connect', join);
			socket.emit(MessagingEvent.LEAVE, conversationId);
		};
	}, [conversationId]);

	const send = (body: string) => {
		if (!conversationId || !socketRef.current?.connected) return false;
		socketRef.current.emit(MessagingEvent.SEND, {
			conversation_id: conversationId,
			body,
		});
		return true;
	};

	return { send };
}
