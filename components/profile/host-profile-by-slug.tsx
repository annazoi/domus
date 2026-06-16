'use client';

import { type ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { HostProfileSkeleton, HostProfileView } from '@/components/profile/host-profile-view';
import { publicHostToProfileData } from '@/components/profile/public-host-profile';
import { usePublicHost } from '@/features/user/hooks/use-public-host';

type HostProfileBySlugProps = {
	hostName: string;
	layout?: 'dashboard' | 'standalone';
	header?: ReactNode;
	notFoundOnError?: boolean;
};

export function HostProfileBySlug({
	hostName,
	layout = 'standalone',
	header,
	notFoundOnError = true,
}: HostProfileBySlugProps) {
	const key = hostName.trim();
	const { data: host, isPending, isError } = usePublicHost(key, { enabled: Boolean(key) });

	if (!key) {
		if (notFoundOnError) notFound();
		return null;
	}

	if (isPending) {
		return <HostProfileSkeleton layout={layout} header={header} />;
	}

	if (isError || !host) {
		if (notFoundOnError) notFound();
		return (
			<div className="dashboard-panel rounded-2xl px-6 py-12 text-center">
				<p className="font-serif text-2xl text-espresso">Profile preview unavailable</p>
				<p className="mt-2 text-sm text-espresso/55">Could not load your public profile. Try again in a moment.</p>
			</div>
		);
	}

	return (
		<HostProfileView
			key={host.id}
			layout={layout}
			profile={publicHostToProfileData(host)}
			properties={host.properties ?? []}
			header={header}
		/>
	);
}
