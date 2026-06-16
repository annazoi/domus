'use client';

import { type ReactNode, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
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
				<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-espresso/40">Contact</p>
				<p className="mt-5 text-sm italic leading-relaxed text-espresso/45">
					Contact details are not public yet. Message through a booking inquiry.
				</p>
			</div>
		);
	}

	return (
		<div className="profile-contact-fields">
			<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-espresso/40">Contact</p>
			<dl className="profile-contact-list mt-5">
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
		<Link
			href={`/${encodeURIComponent(property.slug)}`}
			className="group overflow-hidden rounded-2xl border border-dashboard-border bg-dashboard-surface shadow-[var(--shadow-dashboard-panel)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgba(28,33,28,0.2)]"
		>
			<div className="relative aspect-[4/3] overflow-hidden bg-dashboard-inset">
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
					<div
						className="absolute inset-0"
						style={{
							background:
								'radial-gradient(ellipse 85% 70% at 20% 15%, color-mix(in srgb, var(--color-camel) 18%, transparent), transparent 68%), linear-gradient(135deg, var(--color-dashboard-inset), var(--color-dashboard-bg))',
						}}
					/>
				)}
			</div>
			<div className="p-5">
				<p className="font-serif text-xl tracking-tight text-espresso transition group-hover:text-camel-dark">
					{property.title}
				</p>
				{property.city ? <p className="mt-1 text-sm text-espresso/55">{property.city}</p> : null}
				{property.short_description ? (
					<p className="mt-3 line-clamp-2 text-sm leading-relaxed text-espresso/65">{property.short_description}</p>
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
					className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-camel/70 transition group-focus-within:text-camel"
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
				<p className="mt-2 text-[11px] tracking-wide text-espresso/45">
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
		<section>
			<div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
				<div className="min-w-0">
					<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-espresso/40">Listings</p>
					<h2 className="mt-1 font-serif text-3xl tracking-tight text-espresso sm:text-4xl">Properties</h2>
					{properties.length > 0 && !query.trim() ? (
						<p className="mt-2 text-sm text-espresso/55">
							{properties.length} {properties.length === 1 ? 'published property' : 'published properties'}
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

			{properties.length > 0 ? (
				filtered.length > 0 ? (
					<motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
					<div className="profile-listings-empty dashboard-panel rounded-2xl px-6 py-14 text-center">
						<p className="font-serif text-2xl tracking-tight text-espresso">No matches found</p>
						<p className="mt-2 text-sm text-espresso/55">
							Try another keyword — search covers property names, cities, and descriptions.
						</p>
						<button
							type="button"
							onClick={() => setQuery('')}
							className="profile-listings-reset mt-6 text-sm text-camel-dark underline decoration-camel/35 underline-offset-4 transition hover:text-camel"
						>
							Clear search
						</button>
					</div>
				)
			) : (
				<div className="dashboard-panel rounded-2xl px-6 py-12 text-center">
					<p className="font-serif text-2xl tracking-tight text-espresso">No published properties yet</p>
					<p className="mt-2 text-sm text-espresso/55">Check back soon for new listings from this host.</p>
				</div>
			)}
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
		<div className="space-y-10">
			{header}

			<motion.article
				className="profile-viewer-shell overflow-hidden rounded-[1.5rem] border border-dashboard-border shadow-xs"
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
			>
				<div className="relative isolate min-h-[13rem] overflow-hidden sm:min-h-[15rem]">
					{bannerUrl ? (
						<Image src={bannerUrl} alt="" fill className="object-cover" unoptimized priority />
					) : (
						<div
							className="absolute inset-0"
							style={{
								background:
									'radial-gradient(ellipse 85% 70% at 20% 15%, color-mix(in srgb, var(--color-camel) 24%, transparent), transparent 68%), radial-gradient(ellipse 60% 55% at 90% 85%, color-mix(in srgb, var(--color-espresso) 12%, transparent), transparent 62%), linear-gradient(135deg, var(--color-dashboard-inset), var(--color-dashboard-bg))',
							}}
						/>
					)}
					<div className="profile-canvas-grain pointer-events-none absolute inset-0 opacity-[0.18]" aria-hidden />
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dashboard-panel via-dashboard-panel/20 to-transparent" />
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-camel/35 to-transparent" />
				</div>

				<div className="relative px-6 pb-8 pt-0 sm:px-10 sm:pb-10">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
						<div className="flex min-w-0 items-end gap-5">
							<motion.div
								{...reveal}
								transition={{ duration: 0.36, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
								className="-mt-14 shrink-0 sm:-mt-16"
							>
								{avatarUrl ? (
									<div className="relative h-[5.75rem] w-[5.75rem] overflow-hidden rounded-full border-[3px] border-dashboard-panel shadow-[0_18px_50px_-18px_rgba(154,133,112,0.7)] sm:h-28 sm:w-28">
										<Image src={avatarUrl} alt={fullName} fill className="object-cover" unoptimized />
									</div>
								) : (
									<div className="flex h-[5.75rem] w-[5.75rem] items-center justify-center rounded-full border-[3px] border-dashboard-panel bg-dashboard-surface font-serif text-3xl tracking-tight text-camel shadow-[0_18px_50px_-18px_rgba(154,133,112,0.7)] sm:h-28 sm:w-28">
										{monogram}
									</div>
								)}
							</motion.div>

							<motion.div
								{...reveal}
								transition={{ duration: 0.36, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
								className="min-w-0 pb-1"
							>
								<p className="text-[10px] font-medium uppercase tracking-[0.24em] text-camel">Host on Domus</p>
								<h1 className="mt-1 break-words font-serif text-4xl tracking-tight text-espresso sm:text-5xl">{fullName}</h1>
								<p className="mt-2 text-sm text-espresso/55">Member since {memberSince}</p>
							</motion.div>
						</div>
					</div>

					<motion.section
						{...reveal}
						transition={{ duration: 0.36, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
						className="profile-viewer-about mt-10 rounded-2xl bg-dashboard-inset/50 px-6 py-7 sm:px-8 shadow-md" 
					>
						<div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.88fr)] lg:items-start lg:gap-10 xl:gap-14">
							<div className="min-w-0">
								<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-espresso/40">About</p>
								{profile.bio?.trim() ? (
									<p className="profile-viewer-bio mt-4 max-w-3xl font-serif text-xl leading-relaxed tracking-tight text-espresso sm:text-2xl">
										{profile.bio}
									</p>
								) : (
									<p className="mt-4 text-sm italic text-espresso/45">{emptyBioMessage}</p>
								)}
							</div>

							<div className="profile-contact-aside lg:pl-10 xl:pl-12">
								<HostContactFields profile={profile} />
							</div>
						</div>
					</motion.section>
				</div>
			</motion.article>

			<HostListingsSection properties={properties} />
		</div>
	);

	if (layout === 'standalone') {
		return (
			<div className="min-h-screen bg-dashboard-bg px-4 py-8 sm:px-8">
				<div className="mx-auto max-w-6xl">{content}</div>
			</div>
		);
	}

	return content;
}

export function HostProfileSkeleton({
	layout = 'dashboard',
	header,
}: {
	layout?: 'dashboard' | 'standalone';
	header?: ReactNode;
}) {
	const content = (
		<div className="space-y-10">
			{header}
			<div className="overflow-hidden rounded-[1.5rem] border border-dashboard-border">
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
	);

	if (layout === 'standalone') {
		return (
			<div className="min-h-screen bg-dashboard-bg px-4 py-8 sm:px-8">
				<div className="mx-auto max-w-6xl">{content}</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Skeleton className="h-10 w-36 bg-black/8" />
			{content}
		</div>
	);
}
