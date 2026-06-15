'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { MapPin } from 'lucide-react';
import { BrandingRichTextBlock } from '@/app/(pages)/templates/_components/branding-rich-text-block';
import { AmenityGlyph } from '@/app/(pages)/templates/_components/branding-preview-shared';
import { BrandingPreviewMap } from '@/components/google-maps';
import { cn } from '@/components/ui';
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
	].filter(Boolean) as Array<{ label: string; value: ReactNode }>;

	const hostItems = [
		{ label: 'Name', value: host.name },
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

				{property.coverImage ? (
					<div className="relative mt-10 aspect-[5/2] overflow-hidden">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={property.coverImage} alt={property.title} className="h-full w-full object-cover" />
					</div>
				) : null}

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
					<div className="mt-4">
						<DetailList items={hostItems} />
					</div>
				</TabPanel>

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
