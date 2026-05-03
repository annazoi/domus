'use client';

import { useParams } from 'next/navigation';
import { BrandingThemeFullPreview } from '@/app/(pages)/templates/_components/branding-theme-full-preview';
import { brandingThemeFromTemplateSlug } from '@/app/(pages)/templates/_constants/property-branding-theme';

export default function BrandingTemplateDemoPage() {
	const { templateId } = useParams<{ templateId: string }>();
	const theme = templateId ? brandingThemeFromTemplateSlug(templateId) : null;

	if (!theme) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center bg-neutral-100 text-sm text-neutral-600">
				Unknown template
			</div>
		);
	}

	return <BrandingThemeFullPreview theme={theme} />;
}
