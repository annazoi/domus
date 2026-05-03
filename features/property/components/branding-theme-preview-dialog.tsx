'use client';

import { X } from 'lucide-react';
import { Button, cn } from '@/components/ui';
import type { PropertyBrandingTheme } from '@/features/property/constants/property-branding-theme';
import { PROPERTY_BRANDING_THEME_OPTIONS } from '@/features/property/constants/property-branding-theme';
import type { BrandingPreviewDemo } from './branding-preview-demo';
import { BrandingThemeFullPreview } from './branding-theme-full-preview';

export type BrandingThemePreviewDialogProps = {
	open: boolean;
	theme: PropertyBrandingTheme;
	onClose: () => void;
	/** Optional override for demo data (e.g. property-driven copy later). */
	demoData?: BrandingPreviewDemo;
};

export function BrandingThemePreviewDialog({ open, theme, onClose, demoData }: BrandingThemePreviewDialogProps) {
	if (!open) return null;

	const label = PROPERTY_BRANDING_THEME_OPTIONS.find((o) => o.id === theme)?.label ?? 'Theme';

	return (
		<div
			className="fixed inset-0 z-[90] flex items-stretch justify-center p-0 sm:p-4 sm:py-8"
			role="presentation"
			onClick={onClose}
		>
			<div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" aria-hidden />
			<div
				role="dialog"
				aria-modal
				aria-labelledby="branding-preview-title"
				className={cn(
					'relative z-10 flex max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-none border border-black/10 bg-[#f4f2ee] shadow-2xl sm:max-h-[90dvh] sm:rounded-2xl',
				)}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex shrink-0 items-center justify-between gap-4 border-b border-black/[0.06] bg-white/90 px-4 py-3 backdrop-blur-sm sm:px-5">
					<div className="min-w-0">
						<p id="branding-preview-title" className="truncate font-[family-name:var(--font-serif)] text-lg text-[#1A1A1A]">
							{label} - full layout preview
						</p>
						<p className="truncate text-xs text-[#1A1A1A]/50">Demo content · Not your listing data yet</p>
					</div>
					<Button type="button" variant="ghostPill" className="shrink-0 gap-2" onClick={onClose} aria-label="Close preview">
						<X className="h-4 w-4" />
					</Button>
				</div>
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
					<BrandingThemeFullPreview theme={theme} data={demoData} />
				</div>
			</div>
		</div>
	);
}
