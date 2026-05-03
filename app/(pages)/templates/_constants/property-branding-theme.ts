/**
 * Mirrors `PropertyBrandingTheme` in prisma/schema.prisma - keep in sync.
 */
export const PropertyBrandingTheme = {
	CANVAS: 'CANVAS',
	ARCHITECTURA: 'ARCHITECTURA',
} as const;

export type PropertyBrandingTheme = (typeof PropertyBrandingTheme)[keyof typeof PropertyBrandingTheme];

export const PROPERTY_BRANDING_THEME_OPTIONS: ReadonlyArray<{
	id: PropertyBrandingTheme;
	label: string;
	description: string;
	preview: { bg: string; accent: string; headlineFont: string };
}> = [
	{
		id: PropertyBrandingTheme.CANVAS,
		label: 'Canvas',
		description: 'Neutral editorial layout with sage accents - matches the default studio preview.',
		preview: { bg: '#F7F5F2', accent: '#6B705C', headlineFont: 'serif' },
	},
	{
		id: PropertyBrandingTheme.ARCHITECTURA,
		label: 'Architectura',
		description:
			'Warm terracotta and cream palette, Noto Serif headlines and Manrope body - Mediterranean editorial.',
		preview: { bg: '#fbf9f6', accent: '#944528', headlineFont: 'serif' },
	},
];

/** URL segment under `/templates/...` — keep in sync with routes. */
export const BrandingTemplateSlug = {
	CANVAS: 'canvas',
	ARCHITECTURA: 'architectura',
} as const;

export type BrandingTemplateSlug = (typeof BrandingTemplateSlug)[keyof typeof BrandingTemplateSlug];

export const PROPERTY_BRANDING_THEME_TEMPLATE_SLUG: Record<PropertyBrandingTheme, BrandingTemplateSlug> = {
	[PropertyBrandingTheme.CANVAS]: BrandingTemplateSlug.CANVAS,
	[PropertyBrandingTheme.ARCHITECTURA]: BrandingTemplateSlug.ARCHITECTURA,
};

export function brandingThemeToTemplateSlug(theme: PropertyBrandingTheme): BrandingTemplateSlug {
	return PROPERTY_BRANDING_THEME_TEMPLATE_SLUG[theme];
}

export function brandingThemeFromTemplateSlug(slug: string): PropertyBrandingTheme | null {
	const s = slug.toLowerCase();
	if (s === BrandingTemplateSlug.CANVAS) return PropertyBrandingTheme.CANVAS;
	if (s === BrandingTemplateSlug.ARCHITECTURA) return PropertyBrandingTheme.ARCHITECTURA;
	return null;
}
