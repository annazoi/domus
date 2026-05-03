import { amenityOptionByValue, Amenities, type AmenityId } from '@/config/constants/dropdowns/amenities.options';
import type { PropertyDocument } from '@/features/documents/interfaces/document.interface';
import type { PropertyImage } from '@/features/property-images/interfaces/property-image.interfaces';
import type { Property } from '@/features/property/interfaces/property.interface';
import {
	type PropertyBrandingTheme,
	PropertyBrandingTheme as Theme,
} from '@/app/(pages)/templates/_constants/property-branding-theme';

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
	amenities: { id: AmenityId; label: string }[];
	location: {
		eyebrow: string;
		coords: string;
		mapImage: string;
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

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** True when long copy adds no words beyond the teaser (avoids noisy duplicate snippets). */
function bodyOnlyEchoesShortTeaser(teaser: string, p1: string, p2: string): boolean {
	const t = teaser.toLowerCase().replace(/\s+/g, ' ').trim();
	const combined = `${p1} ${p2}`.toLowerCase().replace(/\s+/g, ' ').trim();
	if (!t || !combined) return false;
	const vocab = new Set(t.split(/\s+/).filter(Boolean));
	const words = combined.split(/\s+/).filter(Boolean);
	if (words.length === 0 || !words.every((w) => vocab.has(w))) return false;
	return combined.length <= t.length + 8;
}

const DEMO_IDS = {
	property: '00000000-0000-4000-a000-000000000001',
	host: '00000000-0000-4000-a000-000000000002',
	user: '00000000-0000-4000-a000-000000000003',
} as const;

const DEMO_IMG_URLS = [
	'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1600&q=80',
	'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80',
	'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
	'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80',
	'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80',
] as const;

function demoDocument(url: string, order: number): PropertyDocument {
	const t = new Date('2026-05-01T12:00:00.000Z').toISOString();
	return {
		id: `${DEMO_IDS.user}-doc-${order}`,
		user_id: DEMO_IDS.user,
		filename: `demo-${order}.jpg`,
		mimetype: 'image/jpeg',
		size: 1,
		url,
		path: `/demo/${order}`,
		type: 'IMAGE',
		order,
		created_at: t,
		updated_at: t,
		property_amenity_id: null,
	};
}

function demoImages(): PropertyImage[] {
	const cap = ['', 'Living — oak & glass', 'Terrace entrance', 'Primary suite', 'Sun deck & fire ring'];
	return DEMO_IMG_URLS.map((url, order) => ({
		id: `${DEMO_IDS.property}-img-${order}`,
		user_id: DEMO_IDS.user,
		property_id: DEMO_IDS.property,
		document_id: `${DEMO_IDS.user}-doc-${order}`,
		description: cap[order],
		created_at: new Date('2026-05-01T12:00:00.000Z').toISOString(),
		document: demoDocument(url, order),
		is_cover: order === 0,
		order,
	}));
}

/** Synthetic listing matching `Property` — drives `/templates` previews via {@link propertyToBrandingPreview}. */
export const DEMO_PROPERTY_FOR_BRANDING: Property = {
	id: DEMO_IDS.property,
	host_id: DEMO_IDS.host,
	title: 'Cliffside retreat with ocean light',
	slug: 'demo-cliffs',
	description:
		'<p>Floor-to-ceiling glass pulls the horizon into the living space. Warm plaster walls and wide-plank oak keep the palette grounded.</p><p>Mornings begin with coastal fog; afternoons open onto terraces cut into the hillside. Every room is oriented toward the view.</p>',
	short_description:
		'Quiet luxury framed by coastal redwoods and the Pacific — a whole-home stay with soaking tub, plunge pool, and chef’s kitchen.',
	check_in_time: '16:00',
	check_out_time: '11:00',
	property_type: 'single_family_home',
	room_type: 'entire_place',
	max_guests: 4,
	bedrooms: 2,
	beds: 2,
	bathrooms: 2,
	country: 'United States',
	city: 'Big Sur',
	address: 'Highway 1 (exact address shared after booking)',
	lat: 36.2704,
	lng: -121.8081,
	isVisible: true,
	branding_theme: Theme.CANVAS,
	amenity_ids: [
		Amenities.WIFI,
		Amenities.POOL,
		Amenities.KITCHEN,
		Amenities.INDOOR_FIREPLACE,
		Amenities.BATHTUB,
		Amenities.BBQ_GRILL,
	],
	amenities: [
		Amenities.WIFI,
		Amenities.POOL,
		Amenities.KITCHEN,
		Amenities.INDOOR_FIREPLACE,
		Amenities.BATHTUB,
		Amenities.BBQ_GRILL,
	].map((value) => ({ value, description: null, selected: true })),
	created_at: new Date('2026-05-01T12:00:00.000Z').toISOString(),
	updated_at: new Date('2026-05-03T12:00:00.000Z').toISOString(),
	images: demoImages(),
};

/** Listing preview: fields from `Property` only (no fictional rates). */
export function propertyToBrandingPreview(property: Property): BrandingPreviewDemo {
	const imgs = [...property.images].sort((a, b) => a.order - b.order);
	const urls = imgs.map((i) => i.document?.url).filter(Boolean) as string[];
	const img = (i: number) => urls[i] ?? '';

	const amenities = property.amenity_ids.map((value) => {
		const amenityId = value as AmenityId;
		const opt = amenityOptionByValue[amenityId];
		return {
			id: amenityId,
			label: opt?.label ?? value.replace(/_/g, ' '),
		};
	});

	const coords =
		property.lat != null && property.lng != null
			? `${property.lat.toFixed(4)}°, ${property.lng.toFixed(4)}°`
			: '';

	const mapEmbedSrc =
		property.lat != null && property.lng != null
			? `https://www.google.com/maps?q=${encodeURIComponent(`${property.lat},${property.lng}`)}&z=15&output=embed`
			: '';

	const strippedShort = stripHtml(property.short_description ?? '').trim();
	const strippedDesc = stripHtml(property.description ?? '').trim();
	const oneLineShort = strippedShort.replace(/\s+/g, ' ').trim();

	let descOneLine = '';
	if (strippedDesc && strippedDesc !== strippedShort) {
		descOneLine = strippedDesc.replace(/\s+/g, ' ').trim();
		if (strippedShort && bodyOnlyEchoesShortTeaser(strippedShort, descOneLine, '')) {
			descOneLine = '';
		}
	}
	const hasConceptBody = Boolean(descOneLine);
	const conceptTitle = oneLineShort.slice(0, 160) || (!hasConceptBody ? property.title : '');

	const addressLine = [property.address, property.city, property.country].filter(Boolean).join(', ');
	const roomLbl = property.room_type ? property.room_type.replace(/_/g, ' ') : '';

	const pullDesc = imgs[4]?.description?.trim() ?? '';

	return {
		wordmark: property.title,
		nav: [],
		hero: {
			series: [property.property_type.replace(/_/g, ' '), property.city].filter(Boolean).join(' · '),
			title: property.title,
			location: [property.city, property.country].filter(Boolean).join(', ') || property.country || property.city || '',
			imageSrc: img(0),
		},
		concept: {
			eyebrow: 'About',
			title: conceptTitle,
			paragraphs: [descOneLine, ''],
		},
		gallery: {
			large: { src: img(1), caption: imgs[1]?.description?.trim() ?? '' },
			stack: [{ src: img(2) }, { src: img(3) }],
			full: {
				src: img(4),
				pullQuote: {
					title: pullDesc.slice(0, 80),
					text: pullDesc,
				},
			},
		},
		amenities,
		location: {
			eyebrow: 'Location',
			coords,
			mapImage: '',
			mapEmbedSrc,
			columns: [
				{ title: 'Address', text: addressLine },
				{ title: 'Coordinates', text: coords || '—' },
			],
		},
		booking: {
			eyebrow: 'Stay details',
			price: '',
			per: '',
			rating: '',
			arrival: property.check_in_time,
			departure: property.check_out_time,
			guests: `${property.max_guests} guests · ${property.bedrooms} bd · ${property.beds} beds · ${property.bathrooms} bath${roomLbl ? ` · ${roomLbl}` : ''}`,
			lines: [
				{ label: '', value: '' },
				{ label: '', value: '' },
			],
			totalLabel: '',
			total: '',
			cta: 'Check availability',
			disclaimer: '',
		},
		host: { label: '', name: '', imageSrc: '', inquire: '' },
		footer: {
			wordmark: property.title,
			tagline: property.slug ? `/${property.slug}` : '',
			links: [],
			copyright: `Listing updated ${new Date(property.updated_at).toLocaleDateString()}`,
		},
	};
}

/** Layout-only fields for `/templates/*` (not on `Property`). */
function decorateFullTemplateDemo(theme: PropertyBrandingTheme, d: BrandingPreviewDemo): BrandingPreviewDemo {
	const arch = theme === Theme.ARCHITECTURA;
	return {
		...d,
		nav: arch
			? [{ label: 'Studio' }, { label: 'Stays', current: true }, { label: 'Contact' }]
			: [{ label: 'Stays' }, { label: 'Area', current: true }, { label: 'Host' }],
		concept: { ...d.concept, eyebrow: '— Overview' },
		location: {
			...d.location,
			eyebrow: arch ? '— Location & context' : '— Area',
			mapImage: arch
				? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80'
				: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
			columns: arch
				? [
						{
							title: 'Access',
							text: '45 minutes from Monterey Regional (MRY); scenic coastal route.',
						},
						{
							title: 'Setting',
							text: 'Elevated site above the marine layer with private trailhead access.',
						},
					]
				: [
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
			...d.booking,
			eyebrow: arch ? 'Reserve the space' : 'Book this stay',
			arrival: arch ? 'May 12, 2026' : 'Jun 4, 2026',
			departure: arch ? 'May 19, 2026' : 'Jun 11, 2026',
			guests: arch ? '2 guests · 1 suite' : `${DEMO_PROPERTY_FOR_BRANDING.max_guests} guests · Whole home`,
			price: arch ? '€2,450' : '$890',
			per: arch ? '/ NIGHT' : '/ night',
			rating: arch ? '4.98' : '4.92',
			lines: arch
				? [
						{ label: 'Accommodation (7 nights)', value: '€17,150' },
						{ label: 'Curated concierge fee', value: '€450' },
					]
				: [
						{ label: 'Stay (7 nights)', value: '$6,230' },
						{ label: 'Cleaning & service', value: '$185' },
					],
			totalLabel: arch ? 'Total contribution' : 'Total',
			total: arch ? '€17,600' : '$6,415',
			cta: arch ? 'Request residency' : 'Check availability',
			disclaimer: arch ? "You won't be charged yet" : 'Taxes and fees calculated at checkout',
		},
		host: {
			label: arch ? 'Curated by' : 'Hosted by',
			name: arch ? 'Domus Studio' : 'Domus Collective',
			imageSrc: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
			inquire: arch ? 'Inquire' : 'Message',
		},
		footer: {
			...d.footer,
			tagline: arch ? 'Curated stays.' : 'Curated stays.',
			links: arch
				? [{ label: 'Ethics' }, { label: 'Archive' }, { label: 'Contact' }]
				: [{ label: 'Terms' }, { label: 'Privacy' }, { label: 'Support' }],
			copyright: arch ? '© 2026 Domus Studio. Template preview.' : '© 2026 Domus Studio. Template preview.',
		},
	};
}

const _fromSeed = propertyToBrandingPreview(DEMO_PROPERTY_FOR_BRANDING);

export const BRANDING_PREVIEW_DEMO: Record<PropertyBrandingTheme, BrandingPreviewDemo> = {
	[Theme.CANVAS]: decorateFullTemplateDemo(Theme.CANVAS, _fromSeed),
	[Theme.ARCHITECTURA]: decorateFullTemplateDemo(Theme.ARCHITECTURA, _fromSeed),
};

export function getBrandingPreviewDemo(theme: PropertyBrandingTheme): BrandingPreviewDemo {
	return BRANDING_PREVIEW_DEMO[theme];
}
