import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createConversation, listConversations } from '../services/messaging.services';
import type { CreateConversationInput } from '../interfaces/messaging.interface';

export const useConversations = () => {
	return useQuery({
		queryKey: ['conversations'],
		queryFn: listConversations,
	});
};

export const useCreateConversation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateConversationInput) => createConversation(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['conversations'] });
		},
	});
};
