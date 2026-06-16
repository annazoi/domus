import { useQuery } from '@tanstack/react-query';
import { getPublicHost } from '../services/user.services';

export const publicHostQueryKey = {
	detail: (hostName: string) => ['public-host', hostName] as const,
};

export const usePublicHost = (hostName: string, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: publicHostQueryKey.detail(hostName),
		queryFn: () => getPublicHost(hostName),
		enabled: options?.enabled !== false && Boolean(hostName),
		retry: false,
		refetchOnMount: 'always',
	});
};
