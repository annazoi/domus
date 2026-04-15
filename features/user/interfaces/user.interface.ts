// import type { Account } from '@/features/account/interfaces/account.interfaces';
// import type { Pagination } from '@/features/services/interfaces/services.interfaces';

export interface User {
	id: string;
	uuid: string;
	email: string;
	phone: string;
	// accounts: Account[];
	role: RoleType;
	created_at: string;
	updated_at: string;
}

export interface CreateUserDto {
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
}

export interface UpdateUserDto {
	first_name?: string;
	last_name?: string;
	email?: string;
	phone?: string;
}

export interface UsersResponse {
	data: User[];
	// pagination: Pagination;
}

export interface LoggedInUser {
	user_uuid: string | null;
	account_uuid: string | null;
	email: string | null;
	role: RoleType | null;
	access_token: string | null;
	expires_in: number | null;
	avatar?: string | null;
	full_name?: string | null;
	isLoggedIn?: boolean | null;
	// account?: Account | null;
}

export const RoleTypes = {
	USER: 'USER',
	ADMIN: 'ADMIN',
	SUPER_ADMIN: 'SUPER_ADMIN',
	SUPPORT: 'SUPPORT',
} as const;

export type RoleType = (typeof RoleTypes)[keyof typeof RoleTypes];
