'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BrandingThemeFullPreview } from '@/features/property/components/branding-theme-full-preview';
import { propertyToBrandingPreview } from '@/features/property/utils/property-to-branding-preview';
import { useProperty } from '@/features/property/hooks/use-property';

export default function PropertyBrandingPreviewPage() {
	const { id } = useParams<{ id: string }>();
	const { data: property, isLoading } = useProperty(id);

	if (isLoading) return <p className="p-6 text-sm text-[#1A1A1A]/60">Loading…</p>;
	if (!property) return <p className="p-6 text-sm text-red-700">Property not found.</p>;

	const data = propertyToBrandingPreview(property);

	return (
		<div className="min-h-screen bg-neutral-200">
			<div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-black/10 bg-white/95 px-4 py-3 text-sm backdrop-blur-sm">
				<span className="truncate font-medium text-[#1A1A1A]">Saved theme · {property.title}</span>
				<Link href={`/dashboard/properties/${property.id}`} className="shrink-0 text-[#6B705C] hover:underline">
					← Edit property
				</Link>
			</div>
			<BrandingThemeFullPreview theme={property.branding_theme} data={data} listingPreview />
		</div>
	);
}
