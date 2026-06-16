'use client';

import { notFound, useParams } from 'next/navigation';
import { BrandingThemeFullPreview } from '@/app/(pages)/templates/_components/branding-theme-full-preview';
import { propertyToBrandingPreview } from '@/app/(pages)/templates/_utils/property-to-branding-preview';
import { HostProfileBySlug } from '@/components/profile/host-profile-by-slug';
import { HostProfileSkeleton } from '@/components/profile/host-profile-view';
import { Skeleton } from '@/components/ui';
import { usePropertyServices } from '@/features/services/hooks/use-property-services';
import { useProperty } from '@/features/property/hooks/use-property';
import { usePublicHost } from '@/features/user/hooks/use-public-host';

const RESERVED = new Set(['auth', 'templates', 'properties', 'dashboard', 'bookings', 'confirm-and-pay', 'guest-details']);

export default function SlugPageClient() {
	const { slug } = useParams<{ slug: string }>();
	const key = slug ?? '';
	if (RESERVED.has(key.toLowerCase())) notFound();

	const { data: host, isLoading: hostLoading } = usePublicHost(key);
	const { data: property, isLoading: propertyLoading } = useProperty(key, { retry: false });
	const { data: guestExtras = [] } = usePropertyServices(property?.id ?? '');

	const loading = hostLoading || propertyLoading;

	if (loading) {
		if (hostLoading && !propertyLoading) {
			return <HostProfileSkeleton layout="standalone" />;
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

	if (host) {
		return <HostProfileBySlug hostName={key} layout="standalone" />;
	}

	if (property) {
		const data = propertyToBrandingPreview(property, { guestExtras });
		return <BrandingThemeFullPreview theme={property.branding_theme} data={data} listingPreview />;
	}

	notFound();
}
