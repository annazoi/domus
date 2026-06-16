'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HostProfileBySlug } from '@/components/profile/host-profile-by-slug';
import { HostProfileSkeleton } from '@/components/profile/host-profile-view';
import { Button } from '@/components/ui';
import { useGetMe } from '@/features/user/hooks/use-user';
import { hostNameSlugFromParts } from '@/lib/slug/host-name-slug';

function resolveHostSlug(user: { host_name?: string | null; first_name: string; last_name: string }) {
	return user.host_name?.trim() || hostNameSlugFromParts(user.first_name, user.last_name);
}

export function ProfileViewer() {
	const { data: user, isLoading, isError } = useGetMe();

	if (isLoading) {
		return <HostProfileSkeleton layout="dashboard" />;
	}

	if (isError || !user) {
		return (
			<div className="dashboard-panel rounded-2xl px-6 py-12 text-center">
				<p className="font-serif text-2xl text-espresso">Profile unavailable</p>
				<p className="mt-2 text-sm text-espresso/55">Sign in again or return to edit your profile.</p>
				<Link href="/dashboard/profile" className="mt-6 inline-block">
					<Button type="button" variant="secondary">
						Edit profile
					</Button>
				</Link>
			</div>
		);
	}

	const hostSlug = resolveHostSlug(user);

	return (
		<HostProfileBySlug
			hostName={hostSlug}
			layout="dashboard"
			header={
				<div className="flex flex-wrap items-center justify-between gap-4">
					<Link href="/dashboard/profile">
						<Button
							type="button"
							variant="ghostPill"
							className="group -ml-2 flex items-center gap-2 px-3 py-2 text-sm text-espresso/60 transition hover:text-espresso"
						>
							<ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
							Edit profile
						</Button>
					</Link>
					<span className="inline-flex items-center gap-2 rounded-full border border-camel/25 bg-camel/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-camel">
						<span className="h-1.5 w-1.5 rounded-full bg-camel" />
						Public preview
					</span>
				</div>
			}
		/>
	);
}
