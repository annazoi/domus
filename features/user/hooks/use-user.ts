import { useMutation, useQuery } from '@tanstack/react-query';
import { createUser, getMe, getUser, removeManyUsers, removeUser } from '../services/user.services';
// import { toast } from '@/hooks/use-toast';
// import type { AccountQuery } from '@/features/account/interfaces/account.interfaces';

export const useCreateUser = () => {
	return useMutation({
		mutationFn: createUser,
	});
};

export const useGetUser = (uuid: string, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ['user', uuid],
		queryFn: () => getUser(uuid),
		enabled: options?.enabled !== false && !!uuid,
	});
};

export const useGetMe = () => {
	return useQuery({
		queryKey: ['me'],
		queryFn: getMe,
	});
};

// export const useGetUsers = (query: AccountQuery) => {
// 	return useQuery({
// 		queryKey: ['users', query],
// 		queryFn: () => getUsers(query),
// 	});
// };

export const useRemoveUser = () => {
	return useMutation({
		mutationFn: removeUser,
	});
};

export const useRemoveManyUsers = () => {
	return useMutation({
		mutationFn: removeManyUsers,
	});
};
