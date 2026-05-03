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
