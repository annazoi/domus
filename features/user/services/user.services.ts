import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { CreateUserDto, UpdateUserDto, User, UsersResponse } from '../interfaces/user.interface';
// import type { AccountQuery } from '@/features/account/interfaces/account.interfaces';

export const createUser = async (user: CreateUserDto): Promise<User> => {
	try {
		const response = await axiosInstance.post(ApiRoutes.auth.register, user);
		return response.data;
	} catch (error) {
		throw new Error('Failed to create user. Please try again.');
	}
};

export const getUser = async (uuid: string): Promise<User> => {
	try {
		const response = await axiosInstance.get(ApiRoutes.users.user(uuid));
		return response.data;
	} catch (error) {
		throw new Error('Failed to get user. Please try again.');
	}
};

export const getMe = async (): Promise<User> => {
	try {
		const response = await axiosInstance.get(ApiRoutes.users.me);
		return response.data;
	} catch (error) {
		throw new Error('Failed to get me. Please try again.');
	}
};

export const updateUser = async (uuid: string, user: UpdateUserDto): Promise<User> => {
	try {
		const response = await axiosInstance.put(ApiRoutes.users.user(uuid), user);
		return response.data;
	} catch (error) {
		throw new Error('Failed to update user. Please try again.');
	}
};

// export const getUsers = async (query: AccountQuery): Promise<UsersResponse> => {
// 	try {
// 		const response = await axiosInstance.get(ApiRoutes.users.prefix, { params: query });
// 		return response.data;
// 	} catch (error) {
// 		throw new Error('Failed to get users. Please try again.');
// 	}
// };

export const removeUser = async (uuid: string): Promise<void> => {
	try {
		const response = await axiosInstance.delete(ApiRoutes.users.user(uuid));
		return response.data;
	} catch (error) {
		throw new Error('Failed to remove user. Please try again.');
	}
};

export const removeManyUsers = async (uuids: string[]): Promise<void> => {
	try {
		const response = await axiosInstance.delete(ApiRoutes.users.prefix, { data: { uuids } });
		return response.data;
	} catch (error) {
		throw new Error('Failed to remove many users. Please try again.');
	}
};
