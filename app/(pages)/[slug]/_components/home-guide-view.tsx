'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { MapPin } from 'lucide-react';
import { cloudinaryDisplayUrl, profileInitials } from '@/lib/profile/display';
import { BrandingRichTextBlock } from '@/app/(pages)/templates/_components/branding-rich-text-block';
import { AmenityGlyph } from '@/app/(pages)/templates/_components/branding-preview-shared';
import { BrandingPreviewMap } from '@/components/google-maps';
import { cn, ImageGalleryLightbox, type ImageGalleryOriginRect } from '@/components/ui';
import type { HomeGuideData } from '@/lib/bookings/home-guide-data';

type TabId = 'overview' | 'access' | 'amenities' | 'rules' | 'contact';

function GuideProse({ html, className }: { html: string; className?: string }) {
	if (!html.trim()) return null;
	return (
		<BrandingRichTextBlock
			html={html}
			variant="canvas"
			className={cn(
				'max-w-2xl font-serif text-[15px] leading-[1.8] text-espresso/72 [&_a]:text-camel-dark',
				className,
			)}
		/>
	);
}

function DetailList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
	return (
		<dl className="max-w-xl divide-y divide-black/8">
			{items.map((item) => (
				<div key={item.label} className="grid grid-cols-[minmax(0,140px)_1fr] gap-x-6 gap-y-1 py-3.5 first:pt-0 last:pb-0">
					<dt className="text-sm text-espresso/50">{item.label}</dt>
					<dd className="text-sm font-medium text-espresso">{item.value}</dd>
				</div>
			))}
		</dl>
	);
}

function joinParts(parts: Array<string | null | undefined>, separator = ' · ') {
	return parts.filter(Boolean).join(separator);
}

function TabPanel({ id, labelledBy, active, children }: { id: TabId; labelledBy: string; active: boolean; children: ReactNode }) {
	return (
		<div
			id={`home-guide-panel-${id}`}
			role="tabpanel"
			aria-labelledby={labelledBy}
			hidden={!active}
			className={cn('pt-8', !active && 'hidden')}
		>
			{children}
		</div>
	);
}

function HomeGuideGallery({
	photos,
	title,
}: {
	photos: HomeGuideData['property']['gallery'];
	title: string;
}) {
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [originRect, setOriginRect] = useState<ImageGalleryOriginRect | null>(null);

	if (photos.length === 0) return null;

	const openAt = (index: number, target: EventTarget & Element) => {
		const rect = target.getBoundingClientRect();
		setOriginRect({
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height,
		});
		setLightboxIndex(index);
		setLightboxOpen(true);
	};

	const [hero, ...thumbnails] = photos;
	const imageUrls = photos.map((photo) => photo.url);

	return (
		<section className="mt-10" aria-label="Property photos">
			<div className="mb-3 flex items-baseline justify-between gap-4">
				<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Gallery</p>
				<p className="text-xs tabular-nums text-espresso/40">
					{photos.length} {photos.length === 1 ? 'photo' : 'photos'}
				</p>
			</div>

			<button
				type="button"
				onClick={(event) => openAt(0, event.currentTarget)}
				className="group relative block w-full cursor-pointer overflow-hidden text-left"
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={hero.url}
					alt={hero.caption || title}
					className="aspect-[5/2] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
				/>
				<span className="pointer-events-none absolute inset-0 bg-espresso/0 transition group-hover:bg-espresso/10" aria-hidden />
			</button>

			{thumbnails.length > 0 ? (
				<div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
					{thumbnails.map((photo, index) => (
						<button
							key={photo.id}
							type="button"
							onClick={(event) => openAt(index + 1, event.currentTarget)}
							className="group relative cursor-pointer overflow-hidden"
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={photo.url}
								alt={photo.caption || title}
								className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
							/>
							<span className="pointer-events-none absolute inset-0 bg-espresso/0 transition group-hover:bg-espresso/10" aria-hidden />
						</button>
					))}
				</div>
			) : null}

			<ImageGalleryLightbox
				open={lightboxOpen}
				onClose={() => setLightboxOpen(false)}
				images={imageUrls}
				initialIndex={lightboxIndex}
				originRect={originRect}
			/>
		</section>
	);
}

function HomeGuideServices({ services }: { services: HomeGuideData['property']['services'] }) {
	if (services.length === 0) return null;

	return (
		<section className="mt-10 border-t border-black/10 pt-10" aria-label="Guest extras">
			<div className="mb-6 flex items-baseline justify-between gap-4">
				<div>
					<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Guest extras</p>
					<p className="mt-2 font-serif text-xl tracking-tight text-espresso">Enhance your stay</p>
				</div>
				<p className="text-xs tabular-nums text-espresso/40">
					{services.length} {services.length === 1 ? 'extra' : 'extras'}
				</p>
			</div>

			<ul className="divide-y divide-black/8">
				{services.map((service) => (
					<li key={service.id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
						{service.imageUrl ? (
							<div className="relative h-20 w-20 shrink-0 overflow-hidden bg-espresso/5">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={service.imageUrl} alt="" className="h-full w-full object-cover" />
							</div>
						) : null}
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
								<p className="font-serif text-lg text-espresso">{service.name}</p>
								<p className="shrink-0 text-sm font-medium tabular-nums text-camel-dark">{service.priceLabel}</p>
							</div>
							{service.description ? (
								<p className="mt-1.5 text-sm leading-relaxed text-espresso/55">{service.description}</p>
							) : null}
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}

export function HomeGuideView({ data }: { data: HomeGuideData }) {
	const { property, host } = data;
	const hasReservation = Boolean(data.checkIn && data.checkOut && data.guests !== null);
	const locationLine = [property.address, property.city, property.country].filter(Boolean).join(', ');
	const mapEmbedSrc =
		property.latitude && property.longitude
			? `https://www.google.com/maps?q=${encodeURIComponent(`${property.latitude},${property.longitude}`)}&z=15&output=embed`
			: '';

	const capacityLine = joinParts([
		property.maxGuests > 0 ? `${property.maxGuests} guest${property.maxGuests === 1 ? '' : 's'}` : null,
		property.bedrooms > 0 ? `${property.bedrooms} bedroom${property.bedrooms === 1 ? '' : 's'}` : null,
		property.beds > 0 ? `${property.beds} bed${property.beds === 1 ? '' : 's'}` : null,
		property.bathrooms > 0 ? `${property.bathrooms} bathroom${property.bathrooms === 1 ? '' : 's'}` : null,
	]);

	const timingLine = joinParts([
		property.checkInTime ? `Check-in ${property.checkInTime}` : null,
		property.checkOutTime ? `Check-out ${property.checkOutTime}` : null,
	]);

	const accessItems = [
		property.doorCode ? { label: 'Door code', value: <span className="font-mono tracking-wide">{property.doorCode}</span> } : null,
		property.safeBoxCode
			? { label: 'Safe box', value: <span className="font-mono tracking-wide">{property.safeBoxCode}</span> }
			: null,
		property.wifiPassword
			? { label: 'Wi-Fi password', value: <span className="font-mono tracking-wide">{property.wifiPassword}</span> }
			: null,
	].filter(Boolean) as Array<{ label: string; value: ReactNode }>;

	const guestItems = data.guest
		? ([
				{ label: 'Name', value: data.guest.name },
				{
					label: 'Email',
					value: (
						<a
							href={`mailto:${data.guest.email}`}
							className="font-normal text-camel-dark underline decoration-camel/30 underline-offset-2 hover:text-camel"
						>
							{data.guest.email}
						</a>
					),
				},
				data.guest.phone
					? {
							label: 'Phone',
							value: (
								<a
									href={`tel:${data.guest.phone}`}
									className="font-normal text-camel-dark underline decoration-camel/30 underline-offset-2 hover:text-camel"
								>
									{data.guest.phone}
								</a>
							),
						}
					: null,
				data.guests !== null ? { label: 'Party size', value: `${data.guests} guest${data.guests === 1 ? '' : 's'}` } : null,
				data.bookingId
					? {
							label: 'Reference',
							value: <span className="font-mono text-xs uppercase tracking-wider">{data.bookingId.slice(0, 8)}</span>,
						}
					: null,
			].filter(Boolean) as Array<{ label: string; value: ReactNode }>)
		: [];

	const hostItems = [
		{
			label: 'Email',
			value: (
				<a
					href={`mailto:${host.email}`}
					className="font-normal text-camel-dark underline decoration-camel/30 underline-offset-2 hover:text-camel"
				>
					{host.email}
				</a>
			),
		},
		host.phone
			? {
					label: 'Phone',
					value: (
						<a
							href={`tel:${host.phone}`}
							className="font-normal text-camel-dark underline decoration-camel/30 underline-offset-2 hover:text-camel"
						>
							{host.phone}
						</a>
					),
				}
			: null,
	].filter(Boolean) as Array<{ label: string; value: ReactNode }>;

	const hostAvatarUrl = host.avatarUrl ? cloudinaryDisplayUrl(host.avatarUrl) : '';
	const hostMonogram = profileInitials(host.first_name, host.last_name);

	const tabs = useMemo(() => {
		const items: Array<{ id: TabId; label: string }> = [{ id: 'overview', label: 'Overview' }];
		if (accessItems.length > 0 || property.locationAccess || locationLine) {
			items.push({ id: 'access', label: 'Access' });
		}
		if (property.amenities.length > 0 || property.appliances.length > 0) {
			items.push({ id: 'amenities', label: 'Amenities' });
		}
		if (property.houseRules || property.privacyPolicy) {
			items.push({ id: 'rules', label: 'Rules' });
		}
		items.push({ id: 'contact', label: 'Contact' });
		return items;
	}, [
		accessItems.length,
		locationLine,
		property.amenities.length,
		property.appliances.length,
		property.houseRules,
		property.locationAccess,
		property.privacyPolicy,
	]);

	const [activeTab, setActiveTab] = useState<TabId>('overview');

	return (
		<div className="min-h-screen bg-[#f7f5f2]">
			<div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
				<header>
					<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-camel">Your Home Guide</p>
					<h1 className="mt-3 font-serif text-3xl tracking-tight text-espresso sm:text-[2.35rem] sm:leading-tight">
						{property.title}
					</h1>
					{locationLine ? (
						<p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-espresso/55">
							<MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-espresso/35" aria-hidden />
							{locationLine}
						</p>
					) : null}

					{hasReservation ? (
						<dl className="mt-8 grid gap-4 border-y border-black/10 py-5 sm:grid-cols-3 sm:gap-6">
							<div>
								<dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso/40">Check in</dt>
								<dd className="mt-1.5 text-sm text-espresso">{data.checkIn}</dd>
							</div>
							<div>
								<dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso/40">Check out</dt>
								<dd className="mt-1.5 text-sm text-espresso">{data.checkOut}</dd>
							</div>
							<div>
								<dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso/40">Guests</dt>
								<dd className="mt-1.5 text-sm text-espresso">{data.guests}</dd>
							</div>
						</dl>
					) : null}
				</header>

				<HomeGuideGallery photos={property.gallery} title={property.title} />

				<div className="mt-10 border-b border-black/10">
					<div
						className="-mb-px flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
						role="tablist"
						aria-label="Home guide sections"
					>
						{tabs.map((tab) => {
							const selected = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									type="button"
									id={`home-guide-tab-${tab.id}`}
									role="tab"
									aria-selected={selected}
									aria-controls={`home-guide-panel-${tab.id}`}
									onClick={() => setActiveTab(tab.id)}
									className={cn(
										'cursor-pointer shrink-0 border-b-2 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition',
										selected
											? 'border-camel text-espresso'
											: 'border-transparent text-espresso/40 hover:text-espresso/65',
									)}
								>
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>

				<TabPanel id="overview" labelledBy="home-guide-tab-overview" active={activeTab === 'overview'}>
					{property.welcomeMessage ? (
						<div className="mb-8">
							<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Welcome</p>
							<div className="mt-4">
								<GuideProse html={property.welcomeMessage} />
							</div>
						</div>
					) : null}

					{guestItems.length > 0 ? (
						<div className={property.welcomeMessage ? 'mb-8' : undefined}>
							<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Guest</p>
							<div className="mt-4">
								<DetailList items={guestItems} />
							</div>
						</div>
					) : null}

					<div>
						<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">The stay</p>
						<p className="mt-4 text-sm capitalize text-espresso/60">
							{joinParts([property.propertyType, property.roomType])}
						</p>
						{capacityLine ? <p className="mt-2 text-sm text-espresso">{capacityLine}</p> : null}
						{timingLine ? <p className="mt-1 text-sm text-espresso/65">{timingLine}</p> : null}
					</div>
				</TabPanel>

				{(accessItems.length > 0 || property.locationAccess || locationLine) && (
					<TabPanel id="access" labelledBy="home-guide-tab-access" active={activeTab === 'access'}>
						{accessItems.length > 0 ? <DetailList items={accessItems} /> : null}
						{property.locationAccess ? (
							<div className={accessItems.length > 0 ? 'mt-8' : undefined}>
								<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Getting in</p>
								<div className="mt-4">
									<GuideProse html={property.locationAccess} />
								</div>
							</div>
						) : null}
						{locationLine ? (
							<div className={accessItems.length > 0 || property.locationAccess ? 'mt-8' : undefined}>
								<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Location</p>
								{mapEmbedSrc ? (
									<div className="relative mt-4 aspect-[16/10] overflow-hidden bg-espresso/5">
										<BrandingPreviewMap
											title="Property location"
											center={{ lat: property.latitude, lng: property.longitude }}
											embedSrc={mapEmbedSrc}
											className="absolute inset-0 h-full w-full border-0 grayscale"
										/>
									</div>
								) : null}
								<p className="mt-4 text-sm leading-relaxed text-espresso/65">{locationLine}</p>
							</div>
						) : null}
					</TabPanel>
				)}

				{(property.amenities.length > 0 || property.appliances.length > 0) && (
					<TabPanel id="amenities" labelledBy="home-guide-tab-amenities" active={activeTab === 'amenities'}>
						{property.amenities.length > 0 ? (
							<div className={property.appliances.length > 0 ? 'mb-10' : undefined}>
								<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Amenities</p>
								<ul className="mt-4 divide-y divide-black/8">
									{property.amenities.map((amenity) => (
										<li key={amenity.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
											<AmenityGlyph id={amenity.id} className="mt-0.5 h-4 w-4 shrink-0 text-espresso/45" />
											<div className="min-w-0 flex-1">
												<p className="text-sm text-espresso">
													{amenity.label}
													{amenity.quantity ? ` · ${amenity.quantity}` : ''}
												</p>
												{amenity.description ? (
													<p className="mt-1 text-sm leading-relaxed text-espresso/55">{amenity.description}</p>
												) : null}
											</div>
										</li>
									))}
								</ul>
							</div>
						) : null}

						{property.appliances.length > 0 ? (
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Equipment</p>
								<div className="mt-4 space-y-8">
									{property.appliances.map((appliance) => (
										<div key={appliance.id}>
											<h3 className="font-serif text-lg text-espresso">{appliance.title}</h3>
											{appliance.description ? (
												<div className="mt-2">
													<GuideProse html={appliance.description} className="text-sm leading-relaxed" />
												</div>
											) : null}
										</div>
									))}
								</div>
							</div>
						) : null}
					</TabPanel>
				)}

				{(property.houseRules || property.privacyPolicy) && (
					<TabPanel id="rules" labelledBy="home-guide-tab-rules" active={activeTab === 'rules'}>
						{property.houseRules ? (
							<div className={property.privacyPolicy ? 'mb-10' : undefined}>
								<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">House rules</p>
								<div className="mt-4">
									<GuideProse html={property.houseRules} />
								</div>
							</div>
						) : null}
						{property.privacyPolicy ? (
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Privacy</p>
								<div className="mt-4">
									<GuideProse html={property.privacyPolicy} className="text-sm leading-relaxed" />
								</div>
							</div>
						) : null}
					</TabPanel>
				)}

				<TabPanel id="contact" labelledBy="home-guide-tab-contact" active={activeTab === 'contact'}>
					<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Your host</p>
					<div className="mt-5 flex items-start gap-5">
						<div className="shrink-0">
							{hostAvatarUrl ? (
								<div className="relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full ring-1 ring-black/10">
									<Image src={hostAvatarUrl} alt={host.name} fill className="object-cover" unoptimized />
								</div>
							) : (
								<div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-espresso/6 font-serif text-xl tracking-tight text-camel-dark ring-1 ring-black/10">
									{hostMonogram}
								</div>
							)}
						</div>
						<div className="min-w-0 flex-1 pt-1">
							<p className="font-serif text-2xl tracking-tight text-espresso">{host.name}</p>
							{host.host_name ? (
								<p className="mt-1 text-sm text-espresso/45">@{host.host_name}</p>
							) : null}
							<div className="mt-5">
								<DetailList items={hostItems} />
							</div>
						</div>
					</div>
				</TabPanel>

				<HomeGuideServices services={property.services} />

				<footer className="mt-14 flex flex-col gap-4 border-t border-black/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm text-espresso/45">Bookmark this page for your stay.</p>
					<div className="flex flex-wrap gap-3">
						{data.bookingId ? (
							<Link
								href={`/bookings/${data.bookingId}`}
								className="text-sm text-espresso/65 underline decoration-black/15 underline-offset-4 transition hover:text-espresso"
							>
								Booking details
							</Link>
						) : null}
						<Link
							href={`/${encodeURIComponent(property.slug)}`}
							className="text-sm font-medium text-espresso underline decoration-camel/40 underline-offset-4 transition hover:text-camel-dark"
						>
							View listing
						</Link>
					</div>
				</footer>
			</div>
		</div>
	);
}
