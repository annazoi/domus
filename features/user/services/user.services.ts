import axios from 'axios';
import axiosInstance, { postMultipart } from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { PublicHostProfile } from '../interfaces/public-host.interface';
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

export const getPublicHost = async (hostName: string): Promise<PublicHostProfile> => {
	try {
		const response = await axiosInstance.get(ApiRoutes.hosts.host(hostName));
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			throw new Error('Host not found');
		}
		throw new Error('Failed to load host profile. Please try again.');
	}
};

export const updateUser = async (uuid: string, user: UpdateUserDto): Promise<User> => {
	try {
		const response = await axiosInstance.put(ApiRoutes.users.user(uuid), user);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error((error.response?.data as { message?: string } | undefined)?.message ?? error.message);
		}
		throw new Error('Failed to update user. Please try again.');
	}
};

const uploadProfileImage = async (route: string, file: File): Promise<User> => {
	const formData = new FormData();
	formData.append('file', file);
	try {
		const response = await postMultipart<User>(route, formData);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error((error.response?.data as { message?: string } | undefined)?.message ?? error.message);
		}
		throw error;
	}
};

const deleteProfileImage = async (route: string): Promise<User> => {
	try {
		const response = await axiosInstance.delete<User>(route);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error((error.response?.data as { message?: string } | undefined)?.message ?? error.message);
		}
		throw error;
	}
};

export const uploadUserAvatar = (file: File) => uploadProfileImage(ApiRoutes.users.meAvatar, file);

export const deleteUserAvatar = () => deleteProfileImage(ApiRoutes.users.meAvatar);

export const uploadUserBanner = (file: File) => uploadProfileImage(ApiRoutes.users.meBanner, file);

export const deleteUserBanner = () => deleteProfileImage(ApiRoutes.users.meBanner);

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
