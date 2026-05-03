import type { PropertyBrandingTheme } from '@/features/property/constants/property-branding-theme';
import { PropertyBrandingTheme as Theme } from '@/features/property/constants/property-branding-theme';

/** Demo-only content for theme previews; replace with property data when wiring the public site. */
export type BrandingPreviewDemo = {
	wordmark: string;
	nav: { label: string; current?: boolean }[];
	hero: { series: string; title: string; location: string; imageSrc: string };
	concept: { eyebrow: string; title: string; paragraphs: [string, string] };
	gallery: {
		large: { src: string; caption: string };
		stack: [{ src: string }, { src: string }];
		full: { src: string; pullQuote: { title: string; text: string } };
	};
	amenities: { id: 'pool' | 'fire' | 'utensils' | 'spa' | 'wine' | 'wifi'; label: string }[];
	location: {
		eyebrow: string;
		coords: string;
		mapImage: string;
		/** Google Maps embed URL — listing preview only */
		mapEmbedSrc?: string;
		columns: [{ title: string; text: string }, { title: string; text: string }];
	};
	booking: {
		eyebrow: string;
		price: string;
		per: string;
		rating: string;
		arrival: string;
		departure: string;
		guests: string;
		lines: [{ label: string; value: string }, { label: string; value: string }];
		totalLabel: string;
		total: string;
		cta: string;
		disclaimer: string;
	};
	host: { label: string; name: string; imageSrc: string; inquire: string };
	footer: { wordmark: string; tagline: string; links: { label: string }[]; copyright: string };
};

const architecturaImages = {
	hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp2VfFToFrG_fCNbyapw0yOJz8Vpjs-RRbYWxrJhAeMJ2egkxwSmtiiK7ebEGrbioUpKlT7CHixekf3Q1bNdU_WweMlrAsevwy7X10areHjZ6QQos-xPjZT20elcgJ9zn4fcx7DamyVb9-rXyvCCDXCit3UIR1WBXvDcdUNaTtnVYETXto6M-28DlXvlax89biLKoDP62_8MlFW1Lc8751X72npFiFKrGwtkkTJNoQ4ehKdD3cVMMYNEGmYMvtT2J6b_wdBGlRc6R3',
	galleryLarge:
		'https://lh3.googleusercontent.com/aida-public/AB6AXuArXMPwWnTzmz8VkUjYdRVlh0icyxTRLSevTFM5cdBeyTYBf7-dMZslXj47RDFrYhYOw5mV-OlBcLvYYWgPKqWpRcYRWd0kKYWsyagrx0ki4pEC1RqQ8WRFL5jBjekP_jHDsRqbJ6VT_nGeH0vfi7BkEKYTMfcqSn5J-ioTBoKJdXbsUBY2zsohbSSRpJ2n0IVSv9SgdLy4RN6ZdJz4b2Y0C9yyXgRfh0M_2Kg3mggyLOSeGYWZTUhua6wqRMgyTFYCNVvIgaBwAyOn',
	galleryA:
		'https://lh3.googleusercontent.com/aida-public/AB6AXuAXmkFI9twUnlBTdhPqRFyFLEi2NLV_i9kCNlwnQ9_AqxUKW1L9kqcbHXZmdg2VEUE0ZqPKH1cCBfd7rk4gtavXKeILq3VH7vi0SnAwO6dcxJYc3CMk5_a2-wcEeFJmfQglOPA6QGZr6TFOJvSrPOzzocibjznNvXYxF22QHqmI_oAuB353yhDZtrcE8L7zGwJRHVpP-sheUfkGmRgutKC2rIlKIoyCuOkan9n_WljTW8tX9p4JvcxmFa_qhft89yXGUMhmEkBO-rsk',
	galleryB:
		'https://lh3.googleusercontent.com/aida-public/AB6AXuAsKMupa0KYpkF21Z6LAsPrzg6bRewzeJDiBmfJkqBmYnk1lZ-lXUWNjzvPWBkvXUexOscrDrRJF6e01QeSZuj4GfUkDzrW58QwCZcdAX7-2Fml4S2Hwuwz__7pMbFn_KzLCjQbb9yb7MiHK9LBhOQ1YUflPM5Fg7s0hCP4boXLfpcxUw8MvxZ-AwgoLhhR92h52kccscibzcNnqwe7Dc4IBYfEKivGJWtzh9rkGOQsQ-u5bCOzYJbqS0e5Jc7PgTOCWyYSUS86uoSS',
	full: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8LTwJoTUkHJMqrZAhKgNUm1uy9Bcae_AU8r04r0OS7oFF48duD3qJ9wWKaguC7P4nIm3gBXERoiLY4Sq5TV-lEUiPuH_Q0RDQ2JpHJbLKBcO7SeSqQyjZWFbc_vjFcuH52KIBA-JC4lKwHlkKC_GYMiFjWSm3zVxWI6iDR7BP2aSU-I_NAuH-4WRt45p_IFZtlmHTPE59nH73HXTIYdO0f3JmUX2UjjmuZhIDK6jUmXZg9d_HvF2gk6UMk6zyDmR4H3R5xDbGPjdE',
	map: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuiqPYC5vuaVvTmV98EYnG-4SAXMBi4lmvnbddSEa5ilI8kCde9wtsiZyy8XGq8zR5ymJIowEAHKJDjsxBu4nu7uQtTwzM2z3hjCVBKfw9pQ0p_8eU2DM47_FgQzRkmvhvtAYh0Pkypac0vCE-J66tzV04CWu3_AK2KEOqHv6WbIQlPNlCifn1TCpao7qOf2Rpg7niQO-03330Olsws1IVL0hyflyVCKDnvx_8jQTd2VBKHKJOVx0id3Hy-OxNqRTJlAu6iS5DR9w0',
	host: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0q1RGUQsQ4kaLNIpo9ejhAYIHL6D68fUUJ50ibeF4XR6O5p2GQUh3QKaPNcj5ZDSGIYi1lw8xgADq17Ls2yuIaFZ16VXya47vwKSubxEJraRjzLui3MJ9ZqEvIgCUEoZCWRUoYlocElpXrTUF39nGW9SoN8GUPNDtLK2dLKiNaudpzxKzSDZ0pkZUlv-AdOTul7dJIjmhtWlIdmRL5af668rv2t05Xt3ZqgH67dL06QDdK91uycm_bOXRkN-oWf5A6cUXuBp_Lf28',
} as const;

export const BRANDING_PREVIEW_DEMO: Record<PropertyBrandingTheme, BrandingPreviewDemo> = {
	[Theme.ARCHITECTURA]: {
		wordmark: 'ARCHITECTURA',
		nav: [
			{ label: 'Studio' },
			{ label: 'Portfolios' },
			{ label: 'Materials', current: true },
			{ label: 'Analytics' },
		],
		hero: {
			series: 'The Mediterranean Series - Vol. 04',
			title: 'Case Study: House of Silence',
			location: 'Costa Brava, Spain',
			imageSrc: architecturaImages.hero,
		},
		concept: {
			eyebrow: '— Concept',
			title: 'A poetic dialogue between raw concrete and the infinite horizon.',
			paragraphs: [
				'Located on a rugged cliff overlooking the Mediterranean, the House of Silence is an exercise in restraint. Designed by the studio as a retreat for contemplation, the structure utilizes local stone and cast-in-place concrete to mirror the surrounding geology.',
				'Every aperture has been meticulously placed to curate the view, turning the landscape into a series of living canvases. The interior experience is defined by the luxury of space and the deliberate play of shadow across textured surfaces.',
			],
		},
		gallery: {
			large: {
				src: architecturaImages.galleryLarge,
				caption: 'Interior 01 - Materiality & Light',
			},
			stack: [{ src: architecturaImages.galleryA }, { src: architecturaImages.galleryB }],
			full: {
				src: architecturaImages.full,
				pullQuote: {
					title: 'The Horizon Pool',
					text: "The water's edge disappears into the sea, creating a seamless transition from the curated to the wild.",
				},
			},
		},
		amenities: [
			{ id: 'pool', label: 'Saltwater Infinity' },
			{ id: 'fire', label: 'Outdoor Hearth' },
			{ id: 'utensils', label: "Chef's Atelier" },
			{ id: 'spa', label: 'Private Wellness' },
			{ id: 'wine', label: 'Sommelier Cellar' },
			{ id: 'wifi', label: 'Studio Connectivity' },
		],
		location: {
			eyebrow: '— Location & Context',
			coords: '41.82° N, 3.12° E',
			mapImage: architecturaImages.map,
			columns: [
				{
					title: 'Distance',
					text: '90 minutes from Barcelona (BCN). Helicopter landing available on site.',
				},
				{
					title: 'Setting',
					text: 'Private coastal reserve with direct access to a secluded rocky cove.',
				},
			],
		},
		booking: {
			eyebrow: 'Reserve the space',
			price: '€2,450',
			per: '/ NIGHT',
			rating: '4.98',
			arrival: 'May 12, 2024',
			departure: 'May 19, 2024',
			guests: '2 Guests, 1 Suite',
			lines: [
				{ label: 'Accommodation (7 nights)', value: '€17,150' },
				{ label: 'Curated Concierge Fee', value: '€450' },
			],
			totalLabel: 'Total Contribution',
			total: '€17,600',
			cta: 'Request Residency',
			disclaimer: "You won't be charged yet",
		},
		host: {
			label: 'Curated By',
			name: 'Adrian Thorne',
			imageSrc: architecturaImages.host,
			inquire: 'Inquire',
		},
		footer: {
			wordmark: 'ARCHITECTURA.',
			tagline: 'BEYOND STRUCTURE.',
			links: [{ label: 'Ethics' }, { label: 'Archive' }, { label: 'Contact' }],
			copyright: '© 2024 ARCHITECTURA. ALL RIGHTS RESERVED.',
		},
	},
	[Theme.CANVAS]: {
		wordmark: 'DOMUS STUDIO',
		nav: [
			{ label: 'Stays' },
			{ label: 'Journal', current: true },
			{ label: 'Host' },
		],
		hero: {
			series: 'Featured residence',
			title: 'Cliffside retreat with ocean light',
			location: 'Big Sur, California',
			imageSrc:
				'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80',
		},
		concept: {
			eyebrow: '— Overview',
			title: 'Quiet luxury framed by redwoods and the Pacific.',
			paragraphs: [
				'Floor-to-ceiling glass pulls the horizon into the living space. Warm plaster walls and wide-plank oak keep the palette grounded.',
				'Mornings begin with coastal fog; afternoons open onto terraces cut into the hillside. Every room is oriented toward the view.',
			],
		},
		gallery: {
			large: {
				src: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80',
				caption: 'Living - Oak & glass',
			},
			stack: [
				{
					src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
				},
				{
					src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
				},
			],
			full: {
				src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80',
				pullQuote: {
					title: 'Sun deck',
					text: 'West-facing cedar deck with built-in seating and a linear fire feature.',
				},
			},
		},
		amenities: [
			{ id: 'wifi', label: 'Fiber Wi‑Fi' },
			{ id: 'spa', label: 'Soaking tub' },
			{ id: 'pool', label: 'Plunge pool' },
			{ id: 'fire', label: 'Indoor fireplace' },
			{ id: 'wine', label: 'Wine fridge' },
			{ id: 'utensils', label: 'Chef kitchen' },
		],
		location: {
			eyebrow: '— Area',
			coords: '36.27° N, 121.81° W',
			mapImage:
				'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
			columns: [
				{
					title: 'Access',
					text: '45 minutes from Monterey Regional (MRY); scenic coastal route.',
				},
				{
					title: 'Terrain',
					text: 'Elevated site above the marine layer with private trailhead access.',
				},
			],
		},
		booking: {
			eyebrow: 'Book this stay',
			price: '$890',
			per: '/ night',
			rating: '4.92',
			arrival: 'Jun 4, 2026',
			departure: 'Jun 11, 2026',
			guests: '4 Guests · Whole home',
			lines: [
				{ label: 'Stay (7 nights)', value: '$6,230' },
				{ label: 'Cleaning & service', value: '$185' },
			],
			totalLabel: 'Total',
			total: '$6,415',
			cta: 'Check availability',
			disclaimer: 'Taxes and fees calculated at checkout',
		},
		host: {
			label: 'Hosted by',
			name: 'Elena Voss',
			imageSrc: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
			inquire: 'Message',
		},
		footer: {
			wordmark: 'DOMUS.',
			tagline: 'CURATED STAYS.',
			links: [{ label: 'Terms' }, { label: 'Privacy' }, { label: 'Support' }],
			copyright: '© 2026 Domus. Demo preview.',
		},
	},
};

export function getBrandingPreviewDemo(theme: PropertyBrandingTheme): BrandingPreviewDemo {
	return BRANDING_PREVIEW_DEMO[theme];
}
