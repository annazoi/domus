import { amenityOptionByValue, Amenities, type AmenityId } from '@/config/constants/dropdowns/amenities.options';
import { ApartmentOptionsLabels } from '@/config/constants/dropdowns/apartment.options';
import { RoomTypeOptionsLabels } from '@/config/constants/dropdowns/room-type.options';
import type { PropertyDocument } from '@/features/documents/interfaces/document.interface';
import type { PropertyImage } from '@/features/property-images/interfaces/property-image.interfaces';
import type { Property, PropertyHostProfile } from '@/features/property/interfaces/property.interface';
import type { Service } from '@/features/services/interfaces/service.interface';
import { PRICING_UNIT_LABELS, type PricingUnit } from '@/features/services/interfaces/pricing-unit';
import {
	readVideoUrlSourceFromDocumentPath,
	type VideoUrlSource,
} from '@/lib/media/video-url';
import {
	type PropertyBrandingTheme,
	PropertyBrandingTheme as Theme,
} from '@/app/(pages)/templates/_constants/property-branding-theme';
import { formatPropertyTimeLabel } from './format-property-time';

export type BrandingPreviewDemo = {
	propertyRef?: string;
	wordmark: string;
	logoSrc?: string;
	logoAlt?: string;
	nav: { label: string; current?: boolean }[];
	hero: {
		series: string;
		title: string;
		location: string;
		imageSrc: string;
		videoSrc?: string;
		videoSource?: VideoUrlSource;
	};
	concept: { eyebrow: string; title: string; paragraphs: [string, string] };
	gallery: {
		large: { src: string; caption: string };
		stack: [{ src: string }, { src: string }];
		full: { src: string; caption: string };
	};
	amenities: { id: AmenityId; label: string; description: string; quantity?: number; imageSrc: string }[];
	videos: { src: string; source?: VideoUrlSource; description: string }[];
	welcome: { html: string };
	stay: {
		propertyType: string;
		roomType: string;
		maxGuests: number;
		bedrooms: number;
		beds: number;
		bathrooms: number;
		checkIn: string;
		checkOut: string;
	};
	houseRules: { html: string };
	privacyPolicy: { html: string };
	guestExtras: { id: string; name: string; description: string; price: string; imageSrc: string }[];
	location: {
		eyebrow: string;
		coords: string;
		mapImage: string;
		/** Used with Maps JavaScript API for styled preview maps. */
		mapCenter?: { lat: number; lng: number };
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
		maxGuests: number;
		lines: [{ label: string; value: string }, { label: string; value: string }];
		totalLabel: string;
		total: string;
		cta: string;
		disclaimer: string;
	};
	host: { label: string; name: string; imageSrc: string; inquire: string; rating: string; bio: string };
	footer: { wordmark: string; tagline: string; links: { label: string }[]; copyright: string };
};

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

const isVideoDocument = (document: PropertyDocument | null | undefined) =>
	document?.type === 'VIDEO' || (document?.mimetype?.startsWith('video/') ?? false);

function propertyTypeLabel(value: string): string {
	const key = value as keyof typeof ApartmentOptionsLabels;
	return ApartmentOptionsLabels[key] ?? value.replace(/_/g, ' ');
}

function roomTypeLabel(value: string): string {
	const key = value as keyof typeof RoomTypeOptionsLabels;
	return RoomTypeOptionsLabels[key] ?? value.replace(/_/g, ' ');
}

function formatGuestExtraPrice(price: number, unit: PricingUnit): string {
	return `$${price.toFixed(2)} · ${PRICING_UNIT_LABELS[unit].toLowerCase()}`;
}

function mapGuestExtras(services: Service[] | undefined) {
	if (!services?.length) return [];
	return services
		.filter((service) => service.active)
		.map((service) => ({
			id: service.id,
			name: service.name,
			description: service.description?.trim() ?? '',
			price: formatGuestExtraPrice(service.price, service.pricing_unit),
			imageSrc: service.images[0]?.url?.trim() ?? '',
		}));
}

function hostDisplayName(host: PropertyHostProfile): string {
	return [host.first_name, host.last_name].filter(Boolean).join(' ').trim();
}

function mapPropertyHostToBranding(host: PropertyHostProfile | null | undefined): BrandingPreviewDemo['host'] {
	if (!host) {
		return { label: '', name: '', imageSrc: '', inquire: '', rating: '', bio: '' };
	}

	const name = hostDisplayName(host);
	if (!name) {
		return { label: '', name: '', imageSrc: '', inquire: '', rating: '', bio: '' };
	}

	return {
		label: 'Hosted by',
		name,
		imageSrc: host.avatar_url?.trim() ?? '',
		inquire: '',
		rating: '',
		bio: host.bio?.trim() ?? '',
	};
}

const DEMO_HOST: PropertyHostProfile = {
	first_name: 'Morgan',
	last_name: 'Vale',
	bio: 'Local host with a decade on the coast — quick replies, thoughtful recommendations, and a light touch when you need privacy.',
	avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
};

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

function demoVideoDocument(url: string, order: number): PropertyDocument {
	const t = new Date('2026-05-01T12:00:00.000Z').toISOString();
	return {
		id: `${DEMO_IDS.user}-doc-${order}`,
		user_id: DEMO_IDS.user,
		filename: `demo-walkthrough.mp4`,
		mimetype: 'video/mp4',
		size: 1,
		url,
		path: 'video-source:YOUTUBE',
		type: 'VIDEO',
		order,
		created_at: t,
		updated_at: t,
		property_amenity_id: null,
	};
}

function demoImages(): PropertyImage[] {
	const cap = ['', '', '', '', ''];
	const photos = DEMO_IMG_URLS.map((url, order) => ({
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
	const videoUrl = 'https://www.youtube.com/watch?v=EngW7tLk6R8';
	return [
		...photos,
		{
			id: `${DEMO_IDS.property}-vid-0`,
			user_id: DEMO_IDS.user,
			property_id: DEMO_IDS.property,
			document_id: `${DEMO_IDS.user}-doc-5`,
			description: 'House walkthrough',
			created_at: new Date('2026-05-01T12:00:00.000Z').toISOString(),
			document: demoVideoDocument(videoUrl, 5),
			is_cover: false,
			order: 5,
		},
	];
}

/** Synthetic listing matching `Property` — drives `/templates` previews via {@link propertyToBrandingPreview}. */
export const DEMO_PROPERTY_FOR_BRANDING: Property = {
	id: DEMO_IDS.property,
	host_id: DEMO_IDS.host,
	host: DEMO_HOST,
	title: 'Cliffside retreat with ocean light',
	slug: 'demo-cliffs',
	description:
		'<p>Floor-to-ceiling glass pulls the horizon into the living space. Warm plaster walls and wide-plank oak keep the palette grounded.</p><p>Mornings begin with coastal fog; afternoons open onto terraces cut into the hillside. Every room is oriented toward the view.</p>',
	short_description:
		'Quiet luxury framed by coastal redwoods and the Pacific - a whole-home stay with soaking tub, plunge pool, and chef’s kitchen.',
	welcome_message:
		'<p>Welcome to the cliffs. Unpack slowly, open the terrace doors, and let the ocean set the pace for your stay.</p>',
	location_access:
		'Private gated drive off Highway 1 - keypad code shared 24h before arrival. Self check-in via smart lock; coastal trail entrance from the lower terrace.',
	check_in_time: '16:00',
	check_out_time: '11:00',
	house_rules_instructions:
		'<p>Quiet hours after 10 PM. No shoes on the oak floors. Please rinse off in the outdoor shower before using the plunge pool.</p>',
	privacy_policy:
		'<p>We do not use interior cameras. Contact details are used only for your stay and are not shared with third parties.</p>',
	property_type: 'house',
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
	appliances: [],
	minimum_advance_reservation_hours: null,
	minimum_rental_period_nights: null,
	maximum_rental_period_nights: null,
	created_at: new Date('2026-05-01T12:00:00.000Z').toISOString(),
	updated_at: new Date('2026-05-03T12:00:00.000Z').toISOString(),
	images: demoImages(),
};

/** Listing preview: fields from `Property` only (no fictional rates). */
export function propertyToBrandingPreview(
	property: Property,
	options?: { guestExtras?: Service[] },
): BrandingPreviewDemo {
	const ordered = [...property.images].sort((a, b) => a.order - b.order);
	const photos = ordered.filter((item) => !isVideoDocument(item.document));
	const videos = ordered
		.filter((item) => isVideoDocument(item.document))
		.map((item) => ({
			src: item.document?.url ?? '',
			source: readVideoUrlSourceFromDocumentPath(item.document?.path) ?? undefined,
			description: item.description?.trim() ?? '',
		}))
		.filter((item) => item.src);
	const urls = photos.map((i) => i.document?.url).filter(Boolean) as string[];
	const img = (i: number) => urls[i] ?? '';

	const amenities = property.amenity_ids.map((value) => {
		const amenityId = value as AmenityId;
		const opt = amenityOptionByValue[amenityId];
		const entry = property.amenities.find((amenity) => amenity.value === value);
		return {
			id: amenityId,
			label: opt?.label ?? value.replace(/_/g, ' '),
			description: entry?.description?.trim() ?? '',
			quantity:
				typeof entry?.quantity === 'number' && Number.isFinite(entry.quantity) && entry.quantity > 0
					? entry.quantity
					: undefined,
			imageSrc: entry?.image_url?.trim() ?? '',
		};
	});

	const heroVideo = videos[0] ?? null;
	const listingVideos = heroVideo ? videos.slice(1) : videos;

	const coords =
		property.lat != null && property.lng != null
			? `${property.lat.toFixed(4)}°, ${property.lng.toFixed(4)}°`
			: '';

	const mapCenter =
		property.lat != null && property.lng != null ? { lat: property.lat, lng: property.lng } : undefined;

	const mapEmbedSrc =
		mapCenter != null
			? `https://www.google.com/maps?q=${encodeURIComponent(`${mapCenter.lat},${mapCenter.lng}`)}&z=15&output=embed`
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
	const roomLbl = property.room_type ? roomTypeLabel(property.room_type) : '';
	const checkInLabel = formatPropertyTimeLabel(property.check_in_time);
	const checkOutLabel = formatPropertyTimeLabel(property.check_out_time);
	const propertyType = propertyTypeLabel(property.property_type);

	return {
		propertyRef: property.id,
		wordmark: property.title,
		logoSrc: property.logo_url?.trim() ?? '',
		logoAlt: property.logo_alt?.trim() ?? '',
		nav: [],
		hero: {
			series: [propertyType, property.city].filter(Boolean).join(' · '),
			title: property.title,
			location: [property.city, property.country].filter(Boolean).join(', ') || property.country || property.city || '',
			imageSrc: img(0),
			videoSrc: heroVideo?.src ?? '',
			videoSource: heroVideo?.source,
		},
		concept: {
			eyebrow: 'About',
			title: conceptTitle,
			paragraphs: [descOneLine, ''],
		},
		gallery: {
			large: { src: img(1), caption: photos[1]?.description?.trim() ?? '' },
			stack: [{ src: img(2) }, { src: img(3) }],
			full: {
				src: img(4),
				caption: photos[4]?.description?.trim() ?? '',
			},
		},
		amenities,
		videos: listingVideos,
		welcome: { html: property.welcome_message?.trim() ?? '' },
		stay: {
			propertyType,
			roomType: roomLbl,
			maxGuests: property.max_guests,
			bedrooms: property.bedrooms,
			beds: property.beds,
			bathrooms: property.bathrooms,
			checkIn: checkInLabel,
			checkOut: checkOutLabel,
		},
		houseRules: { html: property.house_rules_instructions?.trim() ?? '' },
		privacyPolicy: { html: property.privacy_policy?.trim() ?? '' },
		guestExtras: mapGuestExtras(options?.guestExtras),
		location: {
			eyebrow: 'Location',
			coords,
			mapImage: '',
			mapCenter,
			mapEmbedSrc,
			columns: [
				{ title: 'Address', text: addressLine },
				{ title: 'Access', text: stripHtml(property.location_access ?? '') || '—' },
			],
		},
		booking: {
			eyebrow: 'Add your availability',
			price: '',
			per: '',
			rating: '',
			arrival: checkInLabel,
			departure: checkOutLabel,
			guests: `${property.max_guests} guests · ${property.bedrooms} bd · ${property.beds} beds · ${property.bathrooms} bath${roomLbl ? ` · ${roomLbl}` : ''}`,
			maxGuests: Math.max(1, property.max_guests),
			lines: [
				{ label: '', value: '' },
				{ label: '', value: '' },
			],
			totalLabel: '',
			total: '',
			cta: 'Check availability',
			disclaimer: '',
		},
		host: mapPropertyHostToBranding(property.host),
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
	const mizu = theme === Theme.MIZU;
	const hikari = theme === Theme.CANVAS;
	return {
		...d,
		nav: arch
			? [{ label: 'Overview' }, { label: 'Gallery', current: true }, { label: 'Book' }]
			: mizu
				? [{ label: 'House' }, { label: 'Gallery', current: true }, { label: 'Book' }]
				: hikari
					? [{ label: 'Stay' }, { label: 'Space', current: true }, { label: 'Reserve' }]
					: [{ label: 'Stays' }, { label: 'Area', current: true }, { label: 'Host' }],
		hero: mizu
			? { ...d.hero, series: 'Mizu House · 水' }
			: arch
				? { ...d.hero, series: 'Kaze Pavilion · Rental' }
				: hikari
					? { ...d.hero, series: 'Hikari · 光' }
					: d.hero,
		concept: {
			...d.concept,
			eyebrow: mizu ? 'The stay' : arch ? 'Overview' : hikari ? 'Essence' : '— Overview',
		},
		location: {
			...d.location,
			eyebrow: arch ? 'Neighborhood' : mizu ? '— Waterside' : hikari ? '— Setting' : '— Area',
			mapImage: mizu
				? 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80'
				: arch
					? 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80'
					: hikari
						? 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80'
						: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
		},
		booking: {
			...d.booking,
			eyebrow: arch ? 'Book this rental' : mizu ? 'Plan your stay' : hikari ? 'Reserve' : 'Book this stay',
			cta: arch ? 'Check availability' : mizu ? 'Reserve dates' : hikari ? 'Check availability' : 'Check availability',
		},
		host: {
			...d.host,
			inquire: arch || mizu ? 'Message host' : '',
		},
		footer: {
			...d.footer,
			tagline: mizu
				? 'Still water. Warm light.'
				: arch
					? 'Thoughtful stays with clear pricing, honest details, and effortless booking.'
					: hikari
						? 'Light, space, horizon.'
						: 'Curated stays.',
			links: mizu
				? [{ label: 'Soak' }, { label: 'Gallery' }, { label: 'Book' }]
				: arch
					? [{ label: 'Gallery' }, { label: 'Amenities' }, { label: 'Contact' }]
					: hikari
						? [{ label: 'Stay' }, { label: 'Guide' }, { label: 'Book' }]
						: [{ label: 'Terms' }, { label: 'Privacy' }, { label: 'Support' }],
			copyright: mizu
				? '© 2026 Mizu House. Template preview.'
				: arch
					? '© 2026 Kaze Pavilion. Template preview.'
					: hikari
						? '© 2026 Hikari. Template preview.'
						: '© 2026 Domus Studio. Template preview.',
		},
	};
}

const _fromSeed = propertyToBrandingPreview(DEMO_PROPERTY_FOR_BRANDING);

export const BRANDING_PREVIEW_DEMO: Record<PropertyBrandingTheme, BrandingPreviewDemo> = {
	[Theme.CANVAS]: decorateFullTemplateDemo(Theme.CANVAS, _fromSeed),
	[Theme.ARCHITECTURA]: decorateFullTemplateDemo(Theme.ARCHITECTURA, _fromSeed),
	[Theme.MIZU]: decorateFullTemplateDemo(Theme.MIZU, _fromSeed),
};

export function getBrandingPreviewDemo(theme: PropertyBrandingTheme): BrandingPreviewDemo {
	return BRANDING_PREVIEW_DEMO[theme];
}
