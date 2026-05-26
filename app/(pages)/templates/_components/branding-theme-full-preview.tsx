'use client';

import { cn } from '@/components/ui';
import type { PropertyBrandingTheme } from '@/app/(pages)/templates/_constants/property-branding-theme';
import { PropertyBrandingTheme as Theme } from '@/app/(pages)/templates/_constants/property-branding-theme';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { getBrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { ArchitecturaPreview } from './branding-architectura-preview';
import { CanvasPreview } from './branding-canvas-preview';
import { MizuPreview } from './branding-mizu-preview';

export type BrandingThemeFullPreviewProps = {
	theme: PropertyBrandingTheme;
	data?: BrandingPreviewDemo;
	className?: string;
	listingPreview?: boolean;
};

export function BrandingThemeFullPreview({
	theme,
	data: dataProp,
	className,
	listingPreview,
}: BrandingThemeFullPreviewProps) {
	const data = dataProp ?? getBrandingPreviewDemo(theme);

	return (
		<div className={cn('min-h-0', className)}>
			{theme === Theme.ARCHITECTURA ? (
				<ArchitecturaPreview data={data} listingPreview={listingPreview} />
			) : theme === Theme.MIZU ? (
				<MizuPreview data={data} listingPreview={listingPreview} />
			) : (
				<CanvasPreview data={data} listingPreview={listingPreview} />
			)}
		</div>
	);
}
