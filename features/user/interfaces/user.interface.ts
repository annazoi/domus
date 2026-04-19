// import type { Account } from '@/features/account/interfaces/account.interfaces';
// import type { Pagination } from '@/features/services/interfaces/services.interfaces';

export interface User {
	id: string;
	first_name: string;
	last_name: string;
	uuid: string;
	email: string;
	phone?: string;
	vat_number: string | null;
	// accounts: Account[];
	role?: RoleType;
	created_at: string;
	updated_at: string;
}

export interface CreateUserDto {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
}

export interface UpdateUserDto {
	first_name?: string;
	last_name?: string;
	email?: string;
	phone?: string;
	vat_number?: string | null;
}

export interface UsersResponse {
	data: User[];
	// pagination: Pagination;
}

export interface LoggedInUser {
	user_uuid: string | null;
	email: string | null;
	first_name: string | null;
	last_name: string | null;
	vat_number: string | null;
	isLoggedIn?: boolean | null;
}

export const RoleTypes = {
	USER: 'USER',
	// ADMIN: 'ADMIN',
	// SUPPORT: 'SUPPORT',
} as const;

export type RoleType = (typeof RoleTypes)[keyof typeof RoleTypes];
