import { useMutation, useQuery } from '@tanstack/react-query';
import { createUser, getMe, getUser, getUsers, removeManyUsers, removeUser } from '../services/user.services';
// import { toast } from '@/hooks/use-toast';
// import type { AccountQuery } from '@/features/account/interfaces/account.interfaces';

export const useCreateUser = () => {
	return useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			// toast({
			// 	title: 'User created',
			// 	description: 'User created successfully',
			// });
		},
		onError: (error) => {
			// toast({
			// 	title: 'Could not create user',
			// 	description: error.message,
			// 	variant: 'error',
			// });
		},
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
		onSuccess: () => {
			// toast({
			// 	title: 'User removed',
			// 	description: 'User removed successfully',
			// });
		},
		onError: (error) => {
			// toast({
			// 	title: 'Could not remove user',
			// 	description: error.message,
			// 	variant: 'error',
			// });
		},
	});
};

export const useRemoveManyUsers = () => {
	return useMutation({
		mutationFn: removeManyUsers,
		onSuccess: () => {
			// toast({
			// 	title: 'Users removed',
			// 	description: 'Users removed successfully',
			// });
		},
		onError: (error: any) => {
			// toast({
			// 	title: 'Could not remove many users',
			// 	description: error.message,
			// 	variant: 'error',
			// });
		},
	});
};
