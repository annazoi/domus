// import type { Account } from '@/features/account/interfaces/account.interfaces';
// import type { Pagination } from '@/features/services/interfaces/services.interfaces';

export interface User {
	id: string;
	fullName: string;
	uuid: string;
	email: string;
	phone?: string;
	// accounts: Account[];
	role?: RoleType;
	created_at: string;
	updated_at: string;
}

export interface CreateUserDto {
	fullName: string;
	email: string;
}

export interface UpdateUserDto {
	fullName?: string;
	email?: string;
	phone?: string;
}

export interface UsersResponse {
	data: User[];
	// pagination: Pagination;
}

export interface LoggedInUser {
	user_uuid: string | null;
	email: string | null;
	fullName?: string | null;
	isLoggedIn?: boolean | null;
}

export const RoleTypes = {
	USER: 'USER',
	// ADMIN: 'ADMIN',
	// SUPPORT: 'SUPPORT',
} as const;

export type RoleType = (typeof RoleTypes)[keyof typeof RoleTypes];
