import { useQuery } from '@tanstack/react-query';
import { listMessages } from '../services/messaging.services';

export const useMessages = (conversationId: string | null) => {
	return useQuery({
		queryKey: ['messages', conversationId],
		queryFn: () => listMessages(conversationId!),
		enabled: !!conversationId,
	});
};
