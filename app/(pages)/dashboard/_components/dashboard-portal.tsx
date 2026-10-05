'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useDashboardThemeStore } from '@/store/dashboard-theme';

const subscribe = () => () => {};

/**
 * Renders dashboard overlays (modals, pickers) on document.body so they cover the whole viewport.
 * Page content lives inside an animated (transformed) wrapper, which would otherwise trap
 * `position: fixed` and stack the overlay below the sticky header and section tabs.
 * The wrapper keeps the dashboard theme variables available to the portaled UI.
 */
export function DashboardPortal({ children }: { children: ReactNode }) {
	const mounted = useSyncExternalStore(subscribe, () => true, () => false);
	const theme = useDashboardThemeStore((state) => state.theme);

	if (!mounted) return null;

	return createPortal(
		<div className="dashboard-root" data-theme={theme}>
			{children}
		</div>,
		document.body,
	);
}
