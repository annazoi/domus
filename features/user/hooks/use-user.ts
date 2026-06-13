import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, deleteUserAvatar, deleteUserBanner, getMe, getUser, removeManyUsers, removeUser, updateUser, uploadUserAvatar, uploadUserBanner } from '../services/user.services';
import type { UpdateUserDto } from '../interfaces/user.interface';
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

export const useUpdateUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ uuid, input }: { uuid: string; input: UpdateUserDto }) => updateUser(uuid, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['me'] });
		},
	});
};

export const useUploadUserAvatar = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (file: File) => uploadUserAvatar(file),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['me'] });
		},
	});
};

export const useDeleteUserAvatar = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteUserAvatar,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['me'] });
		},
	});
};

export const useUploadUserBanner = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (file: File) => uploadUserBanner(file),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['me'] });
		},
	});
};

export const useDeleteUserBanner = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteUserBanner,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['me'] });
		},
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
