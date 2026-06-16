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
	const { data: host, isLoading, isError } = usePublicHost(key, { enabled: Boolean(key) });

	if (!key) {
		if (notFoundOnError) notFound();
		return null;
	}

	if (isLoading) {
		return <HostProfileSkeleton layout={layout} header={header} />;
	}

	if (isError || !host) {
		if (notFoundOnError) notFound();
		return null;
	}

	return (
		<HostProfileView
			layout={layout}
			profile={publicHostToProfileData(host)}
			properties={host.properties ?? []}
			header={header}
		/>
	);
}
