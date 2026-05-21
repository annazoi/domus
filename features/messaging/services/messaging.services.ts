import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type {
	ConversationRow,
	CreateConversationInput,
	MessageRow,
	UserSearchResult,
} from '../interfaces/messaging.interface';

export const searchUsers = async (query: string) => {
	const response = await axiosInstance.get<UserSearchResult[]>(ApiRoutes.users.search(query));
	return response.data;
};

export const listConversations = async () => {
	const response = await axiosInstance.get<ConversationRow[]>(ApiRoutes.conversations.prefix);
	return response.data;
};

export const createConversation = async (input: CreateConversationInput) => {
	const response = await axiosInstance.post<ConversationRow>(ApiRoutes.conversations.prefix, input);
	return response.data;
};

export const listMessages = async (conversationId: string) => {
	const response = await axiosInstance.get<MessageRow[]>(
		ApiRoutes.conversations.messages(conversationId),
	);
	return response.data;
};

export const sendMessageRest = async (conversationId: string, body: string) => {
	const response = await axiosInstance.post<MessageRow>(
		ApiRoutes.conversations.messages(conversationId),
		{ body },
	);
	return response.data;
};
