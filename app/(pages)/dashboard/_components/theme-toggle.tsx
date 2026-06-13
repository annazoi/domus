'use client';

import { motion } from 'framer-motion';
import { MoonStar, SunMedium } from 'lucide-react';
import { cn } from '@/components/ui';
import { DashboardTheme, useDashboardThemeStore } from '@/store/dashboard-theme';

type ThemeToggleProps = {
	compact?: boolean;
	className?: string;
};

const spring = { type: 'spring' as const, stiffness: 520, damping: 34 };

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
	const theme = useDashboardThemeStore((state) => state.theme);
	const toggleTheme = useDashboardThemeStore((state) => state.toggleTheme);
	const isDark = theme === DashboardTheme.DARK;

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className={cn(
				'group relative inline-flex shrink-0 items-center rounded-full p-1 transition-shadow duration-300',
				isDark
					? 'bg-[#0f0d0b] shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-18px_rgb(0_0_0/0.85)]'
					: 'bg-[#ebe4d9] shadow-[inset_0_1px_0_rgb(255_255_255/0.65),0_0_0_1px_rgb(61_50_41/0.08),0_10px_24px_-18px_rgb(61_50_41/0.35)]',
				compact ? 'h-9 w-[4.25rem]' : 'h-10 w-[5.5rem]',
				className,
			)}
			aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
			aria-pressed={isDark}
		>
			<motion.span
				layout
				transition={spring}
				className={cn(
					'absolute top-1 bottom-1 w-[calc((100%-0.5rem)/2)] rounded-full',
					isDark
						? 'left-1/2 bg-gradient-to-br from-[#3d342c] via-[#2a231d] to-[#171411] shadow-[0_0_18px_-4px_rgb(201_169_120/0.55),inset_0_1px_0_rgb(255_255_255/0.08)]'
						: 'left-1 bg-gradient-to-br from-white via-[#fffdf9] to-[#f3ece2] shadow-[0_8px_18px_-10px_rgb(61_50_41/0.55),inset_0_1px_0_rgb(255_255_255/0.9)]',
				)}
			/>
			<span className="absolute inset-1 z-10 grid grid-cols-2">
				<span
					className={cn(
						'flex items-center justify-center transition-colors duration-200 cursor-pointer',
						!isDark ? 'text-camel' : 'text-[#6f6458]',
					)}
				>
					<SunMedium className={cn('shrink-0', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} strokeWidth={1.75} aria-hidden />
				</span>
				<span
					className={cn(
						'flex items-center justify-center transition-colors duration-200 cursor-pointer',
						isDark ? 'text-[#d9bc94]' : 'text-[#9a8a78]',
					)}
				>
					<MoonStar className={cn('shrink-0', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} strokeWidth={1.75} aria-hidden />
				</span>
			</span>
			{!compact ? (
				<span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.18em] text-dashboard-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100">
					{isDark ? 'Nocturne' : 'Daylight'}
				</span>
			) : null}
		</button>
	);
}
