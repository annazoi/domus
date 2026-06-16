'use client';

import { type ReactNode, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import './host-profile-view.css';
import type { HostProfileData, HostProfileProperty } from '@/components/profile/host-profile-types';
import { Skeleton } from '@/components/ui';
import {
	cloudinaryDisplayUrl,
	formatProfileMemberSince,
	profileInitials,
} from '@/lib/profile/display';

const reveal = {
	initial: { opacity: 0, y: 14 },
	animate: { opacity: 1, y: 0 },
};

function HostContactFields({ profile }: { profile: HostProfileData }) {
	const fields: Array<{ key: string; label: string; value: ReactNode }> = [];

	if (profile.email?.trim()) {
		const email = profile.email.trim();
		fields.push({
			key: 'email',
			label: 'Email',
			value: (
				<a href={`mailto:${email}`} className="profile-contact-link">
					{email}
				</a>
			),
		});
	}

	if (profile.phone?.trim()) {
		const phone = profile.phone.trim();
		fields.push({
			key: 'phone',
			label: 'Telephone',
			value: (
				<a href={`tel:${phone.replace(/\s/g, '')}`} className="profile-contact-link">
					{phone}
				</a>
			),
		});
	}

	if (profile.vat_number?.trim()) {
		fields.push({
			key: 'vat',
			label: 'VAT number',
			value: <span className="profile-contact-value">{profile.vat_number.trim()}</span>,
		});
	}

	if (fields.length === 0) {
		return (
			<div className="profile-contact-fields">
				<p className="profile-eyebrow">Contact</p>
				<p className="mt-4 text-sm italic leading-relaxed text-[color:var(--profile-text-soft)]">
					Contact details are not public yet. Message through a booking inquiry.
				</p>
			</div>
		);
	}

	return (
		<div className="profile-contact-fields">
			<p className="profile-eyebrow">Contact</p>
			<dl className="profile-contact-list mt-4">
				{fields.map((field, index) => (
					<motion.div
						key={field.key}
						{...reveal}
						transition={{ duration: 0.34, delay: 0.3 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
						className="profile-contact-row"
					>
						<dt className="profile-contact-label">{field.label}</dt>
						<dd className="min-w-0">{field.value}</dd>
					</motion.div>
				))}
			</dl>
		</div>
	);
}

function HostPropertyCard({ property }: { property: HostProfileProperty }) {
	const coverUrl = property.cover_url ? cloudinaryDisplayUrl(property.cover_url) : '';

	return (
		<Link href={`/${encodeURIComponent(property.slug)}`} className="profile-property-card group">
			<div className="profile-property-card-media">
				{coverUrl ? (
					<Image
						src={coverUrl}
						alt={property.title}
						fill
						className="object-cover"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
						unoptimized
					/>
				) : (
					<div className="profile-property-card-fallback" />
				)}
				<div className="profile-property-card-overlay" aria-hidden>
					<span className="profile-property-card-cta">
						View listing
						<ArrowUpRight className="h-3 w-3" />
					</span>
				</div>
			</div>
			<div className="profile-property-card-body">
				<p className="profile-property-card-title">{property.title}</p>
				{property.city ? <p className="profile-property-card-city">{property.city}</p> : null}
				{property.short_description ? (
					<p className="profile-property-card-desc">{property.short_description}</p>
				) : null}
			</div>
		</Link>
	);
}

function filterProperties(properties: HostProfileProperty[], query: string) {
	const needle = query.trim().toLowerCase();
	if (!needle) return properties;

	return properties.filter((property) => {
		const haystack = [property.title, property.city, property.short_description].join(' ').toLowerCase();
		return haystack.includes(needle);
	});
}

function HostListingsSearch({
	value,
	onChange,
	resultCount,
	totalCount,
}: {
	value: string;
	onChange: (value: string) => void;
	resultCount: number;
	totalCount: number;
}) {
	const hasQuery = value.trim().length > 0;

	return (
		<div className="profile-listings-search w-full lg:max-w-md">
			<label htmlFor="host-listings-search" className="sr-only">
				Search properties
			</label>
			<div className="profile-listings-search-field group">
				<Search
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--profile-accent)]"
					aria-hidden
				/>
				<input
					id="host-listings-search"
					type="search"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder="Search by name, city, or description"
					className="profile-listings-search-input"
					autoComplete="off"
					spellCheck={false}
				/>
				<AnimatePresence>
					{hasQuery ? (
						<motion.button
							type="button"
							initial={{ opacity: 0, scale: 0.92 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.92 }}
							transition={{ duration: 0.16 }}
							onClick={() => onChange('')}
							className="profile-listings-search-clear"
							aria-label="Clear search"
						>
							<X className="h-3.5 w-3.5" aria-hidden />
						</motion.button>
					) : null}
				</AnimatePresence>
			</div>
			{hasQuery ? (
				<p className="mt-2 text-[11px] tracking-wide text-[color:var(--profile-text-soft)]">
					{resultCount} of {totalCount} {totalCount === 1 ? 'listing' : 'listings'}
				</p>
			) : null}
		</div>
	);
}

function HostListingsSection({ properties }: { properties: HostProfileProperty[] }) {
	const [query, setQuery] = useState('');
	const filtered = useMemo(() => filterProperties(properties, query), [properties, query]);

	return (
		<section className="profile-listings-panel overflow-hidden rounded-2xl">
			<div className="border-b border-[color:var(--profile-border)] px-5 py-5 sm:px-7 sm:py-6">
				<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
					<div className="min-w-0">
						<p className="profile-eyebrow">Listings</p>
						<h2 className="profile-heading mt-1 text-3xl tracking-tight sm:text-[2rem]">Properties</h2>
						{properties.length > 0 && !query.trim() ? (
							<p className="profile-meta mt-2">
								{properties.length} published {properties.length === 1 ? 'property' : 'properties'}
							</p>
						) : null}
					</div>

					{properties.length > 0 ? (
						<HostListingsSearch
							value={query}
							onChange={setQuery}
							resultCount={filtered.length}
							totalCount={properties.length}
						/>
					) : null}
				</div>
			</div>

			<div className="px-5 py-6 sm:px-7 sm:py-7">
				{properties.length > 0 ? (
					filtered.length > 0 ? (
						<motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
							<AnimatePresence mode="popLayout">
								{filtered.map((property) => (
									<motion.div
										key={property.id}
										layout
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.98 }}
										transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
									>
										<HostPropertyCard property={property} />
									</motion.div>
								))}
							</AnimatePresence>
						</motion.div>
					) : (
						<div className="profile-listings-empty rounded-xl px-6 py-12 text-center">
							<p className="profile-heading text-2xl tracking-tight">No matches found</p>
							<p className="profile-meta mt-2">Try another keyword — search covers names, cities, and descriptions.</p>
							<button type="button" onClick={() => setQuery('')} className="profile-listings-reset mt-5 text-sm">
								Clear search
							</button>
						</div>
					)
				) : (
					<div className="rounded-xl border border-[color:var(--profile-border)] bg-[color:var(--profile-inset)] px-6 py-12 text-center">
						<p className="profile-heading text-2xl tracking-tight">No published properties yet</p>
						<p className="profile-meta mt-2">Check back soon for new listings from this host.</p>
					</div>
				)}
			</div>
		</section>
	);
}

type HostProfileViewProps = {
	profile: HostProfileData;
	properties?: HostProfileProperty[];
	header?: ReactNode;
	emptyBioMessage?: string;
	layout?: 'dashboard' | 'standalone';
};

export function HostProfileView({
	profile,
	properties = [],
	header,
	emptyBioMessage = 'This host has not added a bio yet.',
	layout = 'dashboard',
}: HostProfileViewProps) {
	const fullName = `${profile.first_name} ${profile.last_name}`.trim();
	const monogram = profileInitials(profile.first_name, profile.last_name);
	const bannerUrl = profile.banner_url ? cloudinaryDisplayUrl(profile.banner_url) : '';
	const avatarUrl = profile.avatar_url ? cloudinaryDisplayUrl(profile.avatar_url) : '';
	const memberSince = formatProfileMemberSince(profile.created_at);

	const content = (
		<div className="space-y-8">
			{header}

			<motion.article
				className="profile-viewer-shell overflow-hidden rounded-[1.5rem] border"
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
			>
				<div className="relative isolate min-h-[12rem] overflow-hidden sm:min-h-[14rem]">
					{bannerUrl ? (
						<Image src={bannerUrl} alt="" fill className="object-cover" unoptimized priority />
					) : (
						<div
							className="absolute inset-0"
							style={{
								background:
									'radial-gradient(ellipse 85% 70% at 20% 15%, color-mix(in srgb, var(--profile-accent) 24%, transparent), transparent 68%), radial-gradient(ellipse 60% 55% at 90% 85%, color-mix(in srgb, var(--profile-text) 10%, transparent), transparent 62%), linear-gradient(135deg, var(--profile-image-bg), var(--profile-bg))',
							}}
						/>
					)}
					<div className="profile-canvas-grain pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden />
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--profile-panel)] via-[color:var(--profile-panel)]/15 to-transparent" />
				</div>

				<div className="relative px-6 pb-8 pt-0 sm:px-9 sm:pb-9">
					<div className="flex min-w-0 items-end gap-5">
						<motion.div
							{...reveal}
							transition={{ duration: 0.36, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
							className="-mt-12 shrink-0 sm:-mt-14"
						>
							{avatarUrl ? (
								<div className="relative h-[5.25rem] w-[5.25rem] overflow-hidden rounded-full border-[3px] border-[color:var(--profile-panel)] shadow-[0_18px_50px_-18px_rgba(154,133,112,0.65)] sm:h-24 sm:w-24">
									<Image src={avatarUrl} alt={fullName} fill className="object-cover" unoptimized />
								</div>
							) : (
								<div className="flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-full border-[3px] border-[color:var(--profile-panel)] bg-[color:var(--profile-image-bg)] font-serif text-2xl tracking-tight text-[color:var(--profile-accent)] shadow-[0_18px_50px_-18px_rgba(154,133,112,0.65)] sm:h-24 sm:w-24 sm:text-3xl">
									{monogram}
								</div>
							)}
						</motion.div>

						<motion.div
							{...reveal}
							transition={{ duration: 0.36, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
							className="min-w-0 pb-0.5"
						>
							<p className="profile-eyebrow-accent profile-eyebrow">Host on Domus</p>
							<h1 className="profile-heading mt-1 break-words text-3xl tracking-tight sm:text-4xl">{fullName}</h1>
							<p className="profile-meta mt-1.5">Member since {memberSince}</p>
						</motion.div>
					</div>

					<motion.section
						{...reveal}
						transition={{ duration: 0.36, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
						className="profile-viewer-about mt-8 rounded-xl px-5 py-6 sm:px-7 sm:py-7"
					>
						<div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] lg:items-start lg:gap-10">
							<div className="min-w-0">
								<p className="profile-eyebrow">About</p>
								{profile.bio?.trim() ? (
									<p className="profile-viewer-bio mt-3 max-w-2xl font-serif text-xl leading-relaxed tracking-tight text-[color:var(--profile-text)] sm:text-[1.35rem]">
										{profile.bio}
									</p>
								) : (
									<p className="mt-3 text-sm italic text-[color:var(--profile-text-soft)]">{emptyBioMessage}</p>
								)}
							</div>

							<div className="profile-contact-aside lg:pl-8">
								<HostContactFields profile={profile} />
							</div>
						</div>
					</motion.section>
				</div>
			</motion.article>

			<HostListingsSection properties={properties} />
		</div>
	);

	const pageClass =
		layout === 'standalone'
			? 'profile-page profile-page--standalone px-4 py-8 sm:px-8'
			: 'profile-page profile-page--dashboard';

	return (
		<div className={pageClass}>
			<div className={layout === 'standalone' ? 'mx-auto max-w-6xl' : undefined}>{content}</div>
		</div>
	);
}

export function HostProfileSkeleton({
	layout = 'dashboard',
	header,
}: {
	layout?: 'dashboard' | 'standalone';
	header?: ReactNode;
}) {
	const content = (
		<div className="space-y-8">
			{header}
			<div className="overflow-hidden rounded-[1.5rem] border border-[color:var(--profile-border)] bg-[color:var(--profile-panel)]">
				<Skeleton className="h-48 w-full rounded-none bg-black/6" />
				<div className="space-y-4 px-6 py-8 sm:px-9">
					<Skeleton className="h-14 w-14 rounded-full bg-black/6" />
					<Skeleton className="h-9 w-52 bg-black/6" />
					<Skeleton className="h-20 w-full rounded-xl bg-black/5" />
				</div>
			</div>
			<div className="overflow-hidden rounded-2xl border border-[color:var(--profile-border)] bg-[color:var(--profile-panel)] p-6">
				<Skeleton className="h-8 w-40 bg-black/6" />
				<div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					<Skeleton className="aspect-[4/3] rounded-xl bg-black/6" />
					<Skeleton className="aspect-[4/3] rounded-xl bg-black/6" />
					<Skeleton className="aspect-[4/3] rounded-xl bg-black/6" />
				</div>
			</div>
		</div>
	);

	const pageClass =
		layout === 'standalone'
			? 'profile-page profile-page--standalone px-4 py-8 sm:px-8'
			: 'profile-page profile-page--dashboard';

	return (
		<div className={pageClass}>
			<div className={layout === 'standalone' ? 'mx-auto max-w-6xl' : undefined}>
				{layout === 'dashboard' && !header ? <Skeleton className="mb-6 h-10 w-36 bg-black/6" /> : null}
				{content}
			</div>
		</div>
	);
}
