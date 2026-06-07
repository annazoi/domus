import type { LoggedInUser } from '@/features/user/interfaces/user.interface';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UserStore extends LoggedInUser {
	login(user: any): void;
	logout(): void;
	updateUser(user: any): void;
}

const initialValues: UserStore = {
	isLoggedIn: false,
	user_uuid: null,
	first_name: null,
	last_name: null,
	vat_number: null,
	email: null,
	// access_token: null,
	// expires_in: null,
	// avatar: null,
	// account: null,
	login: () => {},
	logout: () => {},
	updateUser: () => {},
};

const STORE_KEY = 'auth';

export const useAuthStore = create<UserStore>()(
	devtools(
		persist(
			(set) => ({
				...initialValues,
				login: (user: LoggedInUser) => {
					set((state) => ({
						...state,
						user_uuid: user.user_uuid,
						email: user.email,
						first_name: user.first_name,
						last_name: user.last_name,
						vat_number: user.vat_number,
						isLoggedIn: true,
					}));
				},
				logout: () => {
					set((state) => ({
						...state,
						isLoggedIn: false,
						user_uuid: null,
						first_name: null,
						last_name: null,
						vat_number: null,
						email: null,
					}));
					localStorage.removeItem(STORE_KEY);
					window.location.href = '/auth/sign-in';
				},
				updateUser: async (user: Partial<LoggedInUser>) => {
					set((state) => ({ ...state, ...user }));
				},
			}),
			{
				name: STORE_KEY,
			},
		),
	),
);

export const getAuthStoreState = () => useAuthStore.getState();

export const useAuthHydrated = () => {
	const [hydrated, setHydrated] = useState(() => {
		if (typeof window === 'undefined') return false;
		return useAuthStore.persist?.hasHydrated() ?? false;
	});

	useEffect(() => {
		if (hydrated) return;
		const persist = useAuthStore.persist;
		if (!persist) {
			setHydrated(true);
			return;
		}
		if (persist.hasHydrated()) {
			setHydrated(true);
			return;
		}
		return persist.onFinishHydration(() => setHydrated(true));
	}, [hydrated]);

	return hydrated;
};
