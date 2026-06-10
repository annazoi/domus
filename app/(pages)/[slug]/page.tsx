'use client';

import { notFound, useParams } from 'next/navigation';
import { BrandingThemeFullPreview } from '@/app/(pages)/templates/_components/branding-theme-full-preview';
import { propertyToBrandingPreview } from '@/app/(pages)/templates/_utils/property-to-branding-preview';
import { Skeleton } from '@/components/ui';
import { usePropertyServices } from '@/features/services/hooks/use-property-services';
import { useProperty } from '@/features/property/hooks/use-property';

/** Single-segment app routes — avoid treating these as property slugs. */
const RESERVED = new Set(['auth', 'templates', 'properties']);

export default function PropertyListingBySlugPage() {
	const { slug } = useParams<{ slug: string }>();
	const key = slug ?? '';
	if (RESERVED.has(key.toLowerCase())) notFound();

	const { data: property, isLoading } = useProperty(key);
	const { data: guestExtras = [] } = usePropertyServices(property?.id ?? '');

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#f4f2ee] px-4 py-5 sm:px-8">
				<div className="mx-auto max-w-[1440px] space-y-8">
					<Skeleton className="h-16 w-full rounded-2xl bg-black/10" />
					<div className="grid gap-4 lg:grid-cols-12">
						<Skeleton className="h-80 w-full rounded-2xl bg-black/10 lg:col-span-8" />
						<div className="space-y-4 lg:col-span-4">
							<Skeleton className="h-38 w-full rounded-2xl bg-black/10" />
							<Skeleton className="h-38 w-full rounded-2xl bg-black/10" />
						</div>
					</div>
				</div>
			</div>
		);
	}
	if (!property) return <p className="p-6 text-sm text-red-700">Property not found.</p>;

	const data = propertyToBrandingPreview(property, { guestExtras });

	return <BrandingThemeFullPreview theme={property.branding_theme} data={data} listingPreview />;
}
