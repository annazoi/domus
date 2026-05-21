import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../services/messaging.services';

export const useSearchUsers = (query: string, enabled: boolean) => {
	const trimmed = query.trim();
	return useQuery({
		queryKey: ['users', 'search', trimmed],
		queryFn: () => searchUsers(trimmed),
		enabled: enabled && trimmed.length >= 3,
	});
};
