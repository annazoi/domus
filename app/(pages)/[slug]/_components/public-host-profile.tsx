'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
	cloudinaryDisplayUrl,
	formatProfileMemberSince,
	profileInitials,
} from '@/app/(pages)/dashboard/profile/_utils/profile-display';
import { Skeleton } from '@/components/ui';
import type { PublicHostProfile, PublicHostProperty } from '@/features/user/interfaces/public-host.interface';

function HostPropertyCard({ property }: { property: PublicHostProperty }) {
	const coverUrl = property.cover_url ? cloudinaryDisplayUrl(property.cover_url) : '';

	return (
		<Link
			href={`/${encodeURIComponent(property.slug)}`}
			className="group overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_12px_40px_-24px_rgba(28,33,28,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgba(28,33,28,0.35)]"
		>
			<div className="relative aspect-[4/3] overflow-hidden bg-[#f0ebe4]">
				{coverUrl ? (
					<Image
						src={coverUrl}
						alt={property.title}
						fill
						className="object-cover transition duration-500 group-hover:scale-[1.03]"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
						unoptimized
					/>
				) : (
					<div className="absolute inset-0 bg-gradient-to-br from-[#f0ebe4] via-[#faf8f5] to-[#e8dfd4]" />
				)}
			</div>
			<div className="p-5">
				<p className="font-serif text-xl tracking-tight text-[#3e2f26] transition group-hover:text-[#9a8570]">
					{property.title}
				</p>
				{property.city ? (
					<p className="mt-1 text-sm text-[#3e2f26]/55">{property.city}</p>
				) : null}
				{property.short_description ? (
					<p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#3e2f26]/65">{property.short_description}</p>
				) : null}
			</div>
		</Link>
	);
}

export function PublicHostProfileView({ host }: { host: PublicHostProfile }) {
	const fullName = `${host.first_name} ${host.last_name}`.trim();
	const monogram = profileInitials(host.first_name, host.last_name);
	const bannerUrl = host.banner_url ? cloudinaryDisplayUrl(host.banner_url) : '';
	const avatarUrl = host.avatar_url ? cloudinaryDisplayUrl(host.avatar_url) : '';
	const memberSince = formatProfileMemberSince(host.created_at);
	const properties = host.properties ?? [];

	return (
		<div className="min-h-screen bg-[#f4f2ee] px-4 py-8 sm:px-8">
			<div className="mx-auto max-w-6xl space-y-10">
				<article className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-[0_24px_80px_-32px_rgba(28,33,28,0.18)]">
					<div className="relative isolate min-h-[13rem] overflow-hidden sm:min-h-[15rem]">
						{bannerUrl ? (
							<Image src={bannerUrl} alt="" fill className="object-cover" unoptimized priority />
						) : (
							<div
								className="absolute inset-0"
								style={{
									background:
										'radial-gradient(ellipse 85% 70% at 20% 15%, rgba(154,133,112,0.24), transparent 68%), radial-gradient(ellipse 60% 55% at 90% 85%, rgba(62,47,38,0.12), transparent 62%), linear-gradient(135deg, #f0ebe4, #f4f2ee)',
								}}
							/>
						)}
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
					</div>

					<div className="relative px-6 pb-8 pt-0 sm:px-10 sm:pb-10">
						<div className="flex min-w-0 items-end gap-5">
							<div className="-mt-14 shrink-0 sm:-mt-16">
								{avatarUrl ? (
									<div className="relative h-[5.75rem] w-[5.75rem] overflow-hidden rounded-full border-[3px] border-white shadow-[0_18px_50px_-18px_rgba(154,133,112,0.7)] sm:h-28 sm:w-28">
										<Image src={avatarUrl} alt={fullName} fill className="object-cover" unoptimized />
									</div>
								) : (
									<div className="flex h-[5.75rem] w-[5.75rem] items-center justify-center rounded-full border-[3px] border-white bg-[#f0ebe4] font-serif text-3xl tracking-tight text-[#9a8570] shadow-[0_18px_50px_-18px_rgba(154,133,112,0.7)] sm:h-28 sm:w-28">
										{monogram}
									</div>
								)}
							</div>

							<div className="min-w-0 pb-1">
								<p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#9a8570]">Host on Domus</p>
								<h1 className="mt-1 break-words font-serif text-4xl tracking-tight text-[#3e2f26] sm:text-5xl">{fullName}</h1>
								<p className="mt-2 text-sm text-[#3e2f26]/55">Member since {memberSince}</p>
							</div>
						</div>

						<section className="mt-10 rounded-2xl border border-black/8 bg-[#faf8f5] px-6 py-7 sm:px-8">
							<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2f26]/40">About</p>
							{host.bio?.trim() ? (
								<p className="mt-4 max-w-3xl font-serif text-xl leading-relaxed tracking-tight text-[#3e2f26] sm:text-2xl">
									{host.bio}
								</p>
							) : (
								<p className="mt-4 text-sm italic text-[#3e2f26]/45">This host has not added a bio yet.</p>
							)}
						</section>
					</div>
				</article>

				<section>
					<div className="mb-6 flex flex-wrap items-end justify-between gap-3">
						<div>
							<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2f26]/40">Listings</p>
							<h2 className="mt-1 font-serif text-3xl tracking-tight text-[#3e2f26] sm:text-4xl">Properties</h2>
						</div>
						{properties.length > 0 ? (
							<p className="text-sm text-[#3e2f26]/55">
								{properties.length} {properties.length === 1 ? 'property' : 'properties'}
							</p>
						) : null}
					</div>

					{properties.length > 0 ? (
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{properties.map((property) => (
								<HostPropertyCard key={property.id} property={property} />
							))}
						</div>
					) : (
						<div className="rounded-2xl border border-black/8 bg-white px-6 py-12 text-center">
							<p className="font-serif text-2xl tracking-tight text-[#3e2f26]">No published properties yet</p>
							<p className="mt-2 text-sm text-[#3e2f26]/55">Check back soon for new listings from this host.</p>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}

export function PublicHostProfileSkeleton() {
	return (
		<div className="min-h-screen bg-[#f4f2ee] px-4 py-8 sm:px-8">
			<div className="mx-auto max-w-6xl space-y-10">
				<div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white">
					<Skeleton className="h-52 w-full rounded-none bg-black/8" />
					<div className="space-y-4 px-6 py-8 sm:px-10">
						<Skeleton className="h-16 w-16 rounded-full bg-black/8" />
						<Skeleton className="h-10 w-56 bg-black/8" />
						<Skeleton className="h-24 w-full bg-black/6" />
					</div>
				</div>
				<div className="space-y-6">
					<Skeleton className="h-10 w-48 bg-black/8" />
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						<Skeleton className="aspect-[4/3] rounded-2xl bg-black/8" />
						<Skeleton className="aspect-[4/3] rounded-2xl bg-black/8" />
						<Skeleton className="aspect-[4/3] rounded-2xl bg-black/8" />
					</div>
				</div>
			</div>
		</div>
	);
}
