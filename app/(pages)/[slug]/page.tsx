'use client';

import { notFound, useParams } from 'next/navigation';
import { BrandingThemeFullPreview } from '@/app/(pages)/templates/_components/branding-theme-full-preview';
import { propertyToBrandingPreview } from '@/app/(pages)/templates/_utils/property-to-branding-preview';
import { useProperty } from '@/features/property/hooks/use-property';

/** Single-segment app routes — avoid treating these as property slugs. */
const RESERVED = new Set(['auth', 'templates', 'properties']);

export default function PropertyListingBySlugPage() {
	const { slug } = useParams<{ slug: string }>();
	const key = slug ?? '';
	if (RESERVED.has(key.toLowerCase())) notFound();

	const { data: property, isLoading } = useProperty(key);

	if (isLoading) return <p className="p-6 text-sm text-[#1A1A1A]/60">Loading…</p>;
	if (!property) return <p className="p-6 text-sm text-red-700">Property not found.</p>;

	const data = propertyToBrandingPreview(property);

	return <BrandingThemeFullPreview theme={property.branding_theme} data={data} listingPreview />;
}
