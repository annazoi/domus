'use client';

import { notFound, useParams } from 'next/navigation';
import { BrandingThemeFullPreview } from '@/app/(pages)/templates/_components/branding-theme-full-preview';
import { propertyToBrandingPreview } from '@/app/(pages)/templates/_utils/property-to-branding-preview';
import { Skeleton } from '@/components/ui';
import { usePropertyServices } from '@/features/services/hooks/use-property-services';
import { useProperty } from '@/features/property/hooks/use-property';
import { usePublicHost } from '@/features/user/hooks/use-public-host';
import { PublicHostProfileSkeleton, PublicHostProfileView } from './_components/public-host-profile';

/** Single-segment app routes — avoid treating these as property or host slugs. */
const RESERVED = new Set(['auth', 'templates', 'properties', 'dashboard', 'bookings', 'confirm-and-pay', 'guest-details']);

export default function SlugPage() {
	const { slug } = useParams<{ slug: string }>();
	const key = slug ?? '';
	if (RESERVED.has(key.toLowerCase())) notFound();

	const { data: property, isLoading: propertyLoading } = useProperty(key, { retry: false });
	const { data: guestExtras = [] } = usePropertyServices(property?.id ?? '');
	const shouldFetchHost = !propertyLoading && !property;
	const { data: host, isLoading: hostLoading } = usePublicHost(key, { enabled: shouldFetchHost });

	if (propertyLoading || (shouldFetchHost && hostLoading)) {
		if (shouldFetchHost && hostLoading && !propertyLoading) {
			return <PublicHostProfileSkeleton />;
		}

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

	if (property) {
		const data = propertyToBrandingPreview(property, { guestExtras });
		return <BrandingThemeFullPreview theme={property.branding_theme} data={data} listingPreview />;
	}

	if (host) {
		return <PublicHostProfileView host={host} />;
	}

	notFound();
}
