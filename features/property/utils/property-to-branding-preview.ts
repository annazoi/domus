import { amenityOptionByValue, type AmenityId } from '@/config/constants/dropdowns/amenities.options';
import type { BrandingPreviewDemo } from '@/features/property/components/branding-preview-demo';
import type { Property } from '@/features/property/interfaces/property.interface';

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function twoParagraphs(text: string): [string, string] {
	const t = stripHtml(text);
	if (!t) return ['', ''];
	const s = t.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((x) => x.trim()).filter(Boolean) ?? [];
	if (s.length >= 2) return [s[0], s.slice(1).join(' ')];
	const m = Math.floor(t.length / 2);
	return [t.slice(0, m).trim() || t, t.slice(m).trim() || t];
}

type PrevAmenityId = BrandingPreviewDemo['amenities'][number]['id'];

function amenityPreviewId(value: string): PrevAmenityId {
	const v = value.toLowerCase();
	if (v.includes('pool') || v.includes('tub')) return 'pool';
	if (v.includes('wifi')) return 'wifi';
	if (v.includes('kitchen') || v.includes('stove') || v.includes('oven') || v.includes('cooking')) return 'utensils';
	if (v.includes('fire') || v.includes('bbq') || v.includes('grill')) return 'fire';
	if (v.includes('wine')) return 'wine';
	if (v.includes('spa') || v.includes('gym')) return 'spa';
	return 'wifi';
}

/** Listing preview: only fields from API — no demo imagery or placeholder prices. */
export function propertyToBrandingPreview(property: Property): BrandingPreviewDemo {
	const imgs = [...property.images].sort((a, b) => a.order - b.order);
	const urls = imgs.map((i) => i.document?.url).filter(Boolean) as string[];
	const img = (i: number) => urls[i] ?? '';

	const amenities = property.amenity_ids.map((value) => {
		const opt = amenityOptionByValue[value as AmenityId];
		return {
			id: amenityPreviewId(value),
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

	const body = property.short_description?.trim() || property.description?.trim() || '';
	const [p1, p2] = twoParagraphs(body);
	const conceptTitle = stripHtml(property.short_description || '').slice(0, 160) || property.title;

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
			paragraphs: [p1, p2],
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
				{ title: 'Coordinates', text: coords },
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
