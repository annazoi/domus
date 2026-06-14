import type { StaticImageData } from 'next/image';
import templateHikariImage from '@/public/images/landing-template-hikari.png';
import templateKazeImage from '@/public/images/landing-template-kaze.png';
import templateMizuImage from '@/public/images/landing-template-mizu.png';

/**
 * Mirrors `PropertyBrandingTheme` in prisma/schema.prisma - keep in sync.
 */
export const PropertyBrandingTheme = {
	CANVAS: 'CANVAS',
	ARCHITECTURA: 'ARCHITECTURA',
	MIZU: 'MIZU',
} as const;

export type PropertyBrandingTheme = (typeof PropertyBrandingTheme)[keyof typeof PropertyBrandingTheme];

export type BrandingThemeOption = {
	id: PropertyBrandingTheme;
	label: string;
	description: string;
	tags: readonly string[];
	image: StaticImageData;
	imageAlt: string;
};

export const PROPERTY_BRANDING_THEME_OPTIONS: ReadonlyArray<BrandingThemeOption> = [
	{
		id: PropertyBrandingTheme.CANVAS,
		label: 'Hikari',
		description: 'Light, minimal layout with calm typography and generous whitespace.',
		tags: ['Villa', 'Minimal'],
		image: templateHikariImage,
		imageAlt: 'Luxury villa at golden hour',
	},
	{
		id: PropertyBrandingTheme.ARCHITECTURA,
		label: 'Kaze Pavilion',
		description: 'Clean rental listing with clear hierarchy, sticky booking, and polished trust signals.',
		tags: ['Rental', 'Modern'],
		image: templateKazeImage,
		imageAlt: 'Contemporary villa overlooking mountains',
	},
	{
		id: PropertyBrandingTheme.MIZU,
		label: 'Mizu House',
		description: 'Warm, inviting presentation with soft tones and gallery-forward photography.',
		tags: ['Villa', 'Warm'],
		image: templateMizuImage,
		imageAlt: 'Luxury villa interior at dusk',
	},
];

/** URL segment under `/templates/...` — keep in sync with routes. */
export const BrandingTemplateSlug = {
	CANVAS: 'hikari',
	ARCHITECTURA: 'kaze',
	MIZU: 'mizu',
} as const;

export type BrandingTemplateSlug = (typeof BrandingTemplateSlug)[keyof typeof BrandingTemplateSlug];

const LEGACY_TEMPLATE_SLUGS: Record<string, PropertyBrandingTheme> = {
	canvas: PropertyBrandingTheme.CANVAS,
	architectura: PropertyBrandingTheme.ARCHITECTURA,
};

export const PROPERTY_BRANDING_THEME_TEMPLATE_SLUG: Record<PropertyBrandingTheme, BrandingTemplateSlug> = {
	[PropertyBrandingTheme.CANVAS]: BrandingTemplateSlug.CANVAS,
	[PropertyBrandingTheme.ARCHITECTURA]: BrandingTemplateSlug.ARCHITECTURA,
	[PropertyBrandingTheme.MIZU]: BrandingTemplateSlug.MIZU,
};

export function brandingThemeToTemplateSlug(theme: PropertyBrandingTheme): BrandingTemplateSlug {
	return PROPERTY_BRANDING_THEME_TEMPLATE_SLUG[theme];
}

export function brandingThemeFromTemplateSlug(slug: string): PropertyBrandingTheme | null {
	const s = slug.toLowerCase();
	const legacy = LEGACY_TEMPLATE_SLUGS[s];
	if (legacy) return legacy;
	if (s === BrandingTemplateSlug.CANVAS) return PropertyBrandingTheme.CANVAS;
	if (s === BrandingTemplateSlug.ARCHITECTURA) return PropertyBrandingTheme.ARCHITECTURA;
	if (s === BrandingTemplateSlug.MIZU) return PropertyBrandingTheme.MIZU;
	return null;
}
