import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const DashboardTheme = {
	LIGHT: 'light',
	DARK: 'dark',
} as const;

export type DashboardTheme = (typeof DashboardTheme)[keyof typeof DashboardTheme];

interface DashboardThemeStore {
	theme: DashboardTheme;
	setTheme: (theme: DashboardTheme) => void;
	toggleTheme: () => void;
}

const STORE_KEY = 'dashboard-theme';

export const useDashboardThemeStore = create<DashboardThemeStore>()(
	persist(
		(set, get) => ({
			theme: DashboardTheme.LIGHT,
			setTheme: (theme) => set({ theme }),
			toggleTheme: () =>
				set({ theme: get().theme === DashboardTheme.DARK ? DashboardTheme.LIGHT : DashboardTheme.DARK }),
		}),
		{ name: STORE_KEY },
	),
);

export const useDashboardThemeHydrated = () => {
	const [hydrated, setHydrated] = useState(() => {
		if (typeof window === 'undefined') return false;
		return useDashboardThemeStore.persist?.hasHydrated() ?? false;
	});

	useEffect(() => {
		if (hydrated) return;
		const persistApi = useDashboardThemeStore.persist;
		if (!persistApi) {
			setHydrated(true);
			return;
		}
		if (persistApi.hasHydrated()) {
			setHydrated(true);
			return;
		}
		return persistApi.onFinishHydration(() => setHydrated(true));
	}, [hydrated]);

	return hydrated;
};
