'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { BookOpen, ImageIcon, Lock, MapPin, Wind, X } from 'lucide-react';
import { cloudinaryDisplayUrl, profileInitials } from '@/lib/profile/display';
import { BrandingRichTextBlock } from '@/app/(pages)/templates/_components/branding-rich-text-block';
import { AmenityGlyph } from '@/app/(pages)/templates/_components/branding-preview-shared';
import { BrandingPreviewMap } from '@/components/google-maps';
import { Button, Checkbox, cn, ImageGalleryLightbox, type ImageGalleryOriginRect } from '@/components/ui';
import type { HomeGuideData } from '@/lib/bookings/home-guide-data';

type TabId = 'overview' | 'access' | 'amenities' | 'extras' | 'rules' | 'contact';

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

function TabPanel({
	id,
	labelledBy,
	active,
	services,
	children,
}: {
	id: TabId;
	labelledBy: string;
	active: boolean;
	services?: HomeGuideData['property']['services'];
	children: ReactNode;
}) {
	return (
		<div
			id={`home-guide-panel-${id}`}
			role="tabpanel"
			aria-labelledby={labelledBy}
			hidden={!active}
			className={cn('pt-8', !active && 'hidden')}
		>
			{children}
			{services && services.length > 0 ? (
				<HomeGuidePropertyServices services={services} className="mt-10 border-t border-black/10 pt-10" />
			) : null}
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

type HomeGuideService = HomeGuideData['property']['services'][number];

function parseServicePrice(priceLabel: string) {
	const match = priceLabel.match(/\$([\d,.]+)/);
	return match ? Number(match[1].replace(/,/g, '')) : 0;
}

function formatGuidePrice(value: number) {
	return `$${value.toFixed(2)}`;
}

function HomeGuideExtraServiceRow({
	service,
	selected,
	onToggle,
}: {
	service: HomeGuideService;
	selected: boolean;
	onToggle: () => void;
}) {
	const unitPrice = parseServicePrice(service.priceLabel);

	return (
		<li>
			<button
				type="button"
				onClick={onToggle}
				aria-pressed={selected}
				aria-label={`${selected ? 'Remove' : 'Add'} ${service.name}`}
				className={cn(
					'group flex w-full cursor-pointer gap-4 border p-4 text-left transition duration-300 sm:gap-5 sm:p-5',
					selected
						? 'border-camel/50 bg-white shadow-[0_12px_40px_rgba(26,26,26,0.06)] ring-1 ring-camel/20'
						: 'border-black/8 bg-white/45 hover:border-black/15 hover:bg-white/70',
				)}
			>
				{service.imageUrl ? (
					<div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden bg-espresso/5 sm:h-20 sm:w-20">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={service.imageUrl} alt="" className="h-full w-full object-cover" />
					</div>
				) : (
					<div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center bg-espresso/[0.04] sm:h-20 sm:w-20">
						<span className="font-serif text-2xl text-camel/55">{service.name.charAt(0)}</span>
					</div>
				)}

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
						<div className="min-w-0">
							<p className="font-serif text-lg tracking-tight text-espresso">{service.name}</p>
							<p className="mt-1 text-xs uppercase tracking-[0.12em] text-espresso/40">{service.priceLabel}</p>
						</div>
						<p
							className={cn(
								'shrink-0 font-medium tabular-nums transition duration-300',
								selected ? 'text-camel-dark' : 'text-espresso/70',
							)}
						>
							{formatGuidePrice(unitPrice)}
						</p>
					</div>
					{service.description ? (
						<p className="mt-2 text-sm leading-relaxed text-espresso/55">{service.description}</p>
					) : null}
				</div>

				<Checkbox
					checked={selected}
					onChange={() => onToggle()}
					onClick={(event) => event.stopPropagation()}
					className="mt-1 shrink-0 accent-camel"
					aria-label={`Add ${service.name}`}
				/>
			</button>
		</li>
	);
}

function HomeGuidePropertyServices({
	services,
	className,
}: {
	services: HomeGuideData['property']['services'];
	className?: string;
}) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

	if (services.length === 0) return null;

	const selectedServices = services.filter((service) => selectedIds.has(service.id));
	const total = selectedServices.reduce((sum, service) => sum + parseServicePrice(service.priceLabel), 0);
	const hasSelection = selectedServices.length > 0;

	const toggleService = (serviceId: string) => {
		setSelectedIds((current) => {
			const next = new Set(current);
			if (next.has(serviceId)) {
				next.delete(serviceId);
			} else {
				next.add(serviceId);
			}
			return next;
		});
	};

	return (
		<section className={className} aria-label="Guest extras">
			<div className="overflow-hidden border border-black/10 bg-gradient-to-b from-white/85 to-white/50">
				<div className="border-b border-black/8 px-5 py-6 sm:px-6 sm:py-7">
					<div className="flex items-start justify-between gap-4">
						<div className="max-w-lg">
							<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Guest extras</p>
							<p className="mt-2 font-serif text-2xl tracking-tight text-espresso">Enhance your stay</p>
							<p className="mt-3 text-sm leading-relaxed text-espresso/55">
								Optional add-ons you can request for your stay. Select what you&apos;d like, then complete payment below.
							</p>
						</div>
						<p className="shrink-0 text-xs tabular-nums text-espresso/40">
							{services.length} {services.length === 1 ? 'extra' : 'extras'}
						</p>
					</div>
				</div>

				<ul className="space-y-3 px-5 py-6 sm:px-6">
					{services.map((service) => (
						<HomeGuideExtraServiceRow
							key={service.id}
							service={service}
							selected={selectedIds.has(service.id)}
							onToggle={() => toggleService(service.id)}
						/>
					))}
				</ul>

				<div className="border-t border-black/10 bg-espresso/[0.03] px-5 py-5 sm:px-6 sm:py-6">
					<div className="flex items-end justify-between gap-4 border-b border-black/8 pb-5">
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso/40">Your selection</p>
							<p className="mt-1 text-sm text-espresso">
								{hasSelection
									? `${selectedServices.length} extra${selectedServices.length === 1 ? '' : 's'} selected`
									: 'Select at least one extra to continue'}
							</p>
						</div>
						<p className="font-serif text-2xl tabular-nums tracking-tight text-espresso">
							{hasSelection ? formatGuidePrice(total) : '—'}
						</p>
					</div>

					<Button
						type="button"
						disabled={!hasSelection}
						variant="primary"
						className="mt-5 flex w-full items-center justify-center gap-2.5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]"
					>
						<Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
						Pay securely
					</Button>

					<p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-espresso/35">
						Encrypted checkout
					</p>
				</div>
			</div>
		</section>
	);
}

function richTextPreview(html: string, max = 100) {
	const text = html
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (!text) return '';
	if (text.length <= max) return text;
	return `${text.slice(0, max)}…`;
}

type HomeGuideAppliance = HomeGuideData['property']['appliances'][number];

const modalEase = [0.22, 1, 0.36, 1] as const;

function HomeGuideEquipmentGuides({ appliances }: { appliances: HomeGuideAppliance[] }) {
	const [activeApplianceId, setActiveApplianceId] = useState<string | null>(null);

	const activeAppliance = useMemo(
		() => (activeApplianceId ? appliances.find((appliance) => appliance.id === activeApplianceId) ?? null : null),
		[activeApplianceId, appliances],
	);

	const closeModal = useCallback(() => setActiveApplianceId(null), []);

	useEffect(() => {
		if (!activeApplianceId) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeModal();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [activeApplianceId, closeModal]);

	if (appliances.length === 0) return null;

	return (
		<div>
			<div className="max-w-xl">
				<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-camel/90">Guest how-tos</p>
				<h3 className="mt-2 font-serif text-2xl tracking-tight text-espresso">Equipment guides</h3>
				<p className="mt-2 text-sm leading-relaxed text-espresso/58">
					Step-by-step instructions for appliances and devices in the home - air conditioning, heating, laundry, and more.
				</p>
			</div>

			<ul className="mt-6 grid gap-3">
				{appliances.map((appliance, index) => {
					const preview = richTextPreview(appliance.description);
					return (
						<li key={appliance.id}>
							<button
								type="button"
								onClick={() => setActiveApplianceId(appliance.id)}
								className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-white/90 via-white/75 to-white/55 p-4 text-left transition duration-300 hover:border-camel/30 hover:shadow-[0_12px_40px_-28px_rgba(120,84,40,0.45)]"
							>
								<div className="flex gap-4">
									<div
										className={cn(
											'relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-black/[0.06]',
											appliance.imageUrl ? 'bg-espresso/5' : 'bg-camel/[0.08]',
										)}
									>
										{appliance.imageUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={appliance.imageUrl} alt="" className="h-full w-full object-cover" />
										) : (
											<Wind className="h-7 w-7 text-camel/55" aria-hidden />
										)}
										<span className="absolute bottom-1.5 right-1.5 rounded-full bg-[#f7f5f2]/95 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-espresso/55">
											{String(index + 1).padStart(2, '0')}
										</span>
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-espresso">{appliance.title}</p>
										{preview ? (
											<p className="mt-1 line-clamp-2 text-sm text-espresso/55">{preview}</p>
										) : (
											<p className="mt-1 text-sm italic text-espresso/40">Tap to view instructions</p>
										)}
										<div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-espresso/40">
											<span className="inline-flex items-center gap-1">
												<BookOpen className="h-3 w-3" aria-hidden />
												Guide
											</span>
											{appliance.imageUrl ? (
												<span className="inline-flex items-center gap-1">
													<ImageIcon className="h-3 w-3" aria-hidden />
													Photo
												</span>
											) : null}
										</div>
									</div>
								</div>
							</button>
						</li>
					);
				})}
			</ul>

			<AnimatePresence>
				{activeApplianceId && activeAppliance ? (
					<motion.div
						key={activeApplianceId}
						className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
						role="presentation"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.22 }}
						onClick={closeModal}
					>
						<motion.div
							className="absolute inset-0 bg-espresso/45 backdrop-blur-[3px]"
							aria-hidden
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.22 }}
						/>
						<motion.div
							role="dialog"
							aria-modal="true"
							aria-labelledby="home-guide-equipment-title"
							className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-black/10 bg-white shadow-[0_32px_100px_-28px_rgba(0,0,0,0.4)] sm:rounded-3xl"
							initial={{ opacity: 0, y: 40, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 28, scale: 0.98 }}
							transition={{ duration: 0.28, ease: modalEase }}
							onClick={(event) => event.stopPropagation()}
						>
							<div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/8 px-5 py-5 sm:px-6">
								<div className="min-w-0 pr-2">
									<p className="text-[10px] font-medium uppercase tracking-[0.2em] text-camel/90">Equipment guide</p>
									<h3 id="home-guide-equipment-title" className="mt-2 font-serif text-2xl tracking-tight text-espresso">
										{activeAppliance.title}
									</h3>
								</div>
								<button
									type="button"
									onClick={closeModal}
									className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-espresso/50 transition hover:bg-black/5 hover:text-espresso"
									aria-label="Close guide"
								>
									<X className="h-4 w-4" />
								</button>
							</div>

							{activeAppliance.imageUrl ? (
								<div className="relative aspect-[16/10] shrink-0 bg-espresso/5">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={activeAppliance.imageUrl} alt="" className="h-full w-full object-cover" />
								</div>
							) : null}

							<div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
								{activeAppliance.description ? (
									<div>
										<p className="text-[10px] font-medium uppercase tracking-[0.16em] text-espresso/40">Instructions</p>
										<div className="mt-4">
											<GuideProse html={activeAppliance.description} className="text-sm leading-relaxed" />
										</div>
									</div>
								) : (
									<p className="text-sm italic text-espresso/40">No instructions provided.</p>
								)}
							</div>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

function HomeGuidePaidExtras({
	extras,
	totalLabel,
}: {
	extras: HomeGuideData['paidExtras'];
	totalLabel: string | null;
}) {
	if (extras.length === 0) return null;

	return (
		<div>
			<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Your booking</p>
			<p className="mt-3 max-w-md font-serif text-xl leading-snug tracking-tight text-espresso">
				Extras included with your stay
			</p>

			<ul className="mt-8 space-y-4">
				{extras.map((extra) => (
					<li
						key={extra.id}
						className="group relative overflow-hidden border border-black/8 bg-white/55 transition duration-300 hover:border-camel/25 hover:bg-white/80"
					>
						<span
							className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-camel/70 transition group-hover:bg-camel"
							aria-hidden
						/>
						<div className="flex gap-4 p-4 sm:gap-5 sm:p-5">
							{extra.imageUrl ? (
								<div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden bg-espresso/5 sm:h-20 sm:w-20">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={extra.imageUrl} alt="" className="h-full w-full object-cover" />
								</div>
							) : (
								<div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center bg-espresso/[0.04] sm:h-20 sm:w-20">
									<span className="font-serif text-2xl text-camel/55">{extra.name.charAt(0)}</span>
								</div>
							)}
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
									<div className="min-w-0">
										<p className="font-serif text-lg tracking-tight text-espresso">{extra.name}</p>
										{extra.quantity > 1 ? (
											<p className="mt-1 inline-flex items-center rounded-full bg-espresso/[0.05] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-espresso/55">
												Qty {extra.quantity}
											</p>
										) : null}
									</div>
									<p className="shrink-0 text-sm font-medium tabular-nums text-camel-dark">{extra.lineTotalLabel}</p>
								</div>
								{extra.description ? (
									<p className="mt-2 text-sm leading-relaxed text-espresso/55">{extra.description}</p>
								) : null}
								{extra.quantity > 1 ? (
									<p className="mt-2 text-xs tabular-nums text-espresso/40">{extra.unitPriceLabel}</p>
								) : null}
							</div>
						</div>
					</li>
				))}
			</ul>

			{totalLabel && extras.length > 1 ? (
				<div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">
					<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-espresso/45">Extras total</p>
					<p className="font-serif text-xl tabular-nums tracking-tight text-espresso">{totalLabel}</p>
				</div>
			) : null}
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
		if (data.paidExtras.length > 0) {
			items.push({ id: 'extras', label: 'Extras' });
		}
		if (property.houseRules || property.privacyPolicy) {
			items.push({ id: 'rules', label: 'Rules' });
		}
		items.push({ id: 'contact', label: 'Contact' });
		return items;
	}, [
		accessItems.length,
		data.paidExtras.length,
		locationLine,
		property.amenities.length,
		property.appliances.length,
		property.houseRules,
		property.locationAccess,
		property.privacyPolicy,
	]);

	const [activeTab, setActiveTab] = useState<TabId>('overview');
	const propertyServices = property.services.length > 0 ? property.services : undefined;

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

				<TabPanel
					id="overview"
					labelledBy="home-guide-tab-overview"
					active={activeTab === 'overview'}
					services={propertyServices}
				>
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
					<TabPanel
						id="access"
						labelledBy="home-guide-tab-access"
						active={activeTab === 'access'}
						services={propertyServices}
					>
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
					<TabPanel
						id="amenities"
						labelledBy="home-guide-tab-amenities"
						active={activeTab === 'amenities'}
						services={propertyServices}
					>
						{property.amenities.length > 0 ? (
							<div className={property.appliances.length > 0 ? 'mb-10' : undefined}>
								<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/45">Amenities</p>
								<ul
									className={cn(
										'mt-4',
										property.amenities.length > 8
											? 'grid gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3'
											: 'divide-y divide-black/8',
									)}
								>
									{property.amenities.map((amenity) => (
										<li
											key={amenity.id}
											className={cn(
												'flex gap-3',
												property.amenities.length > 8 ? 'items-start' : 'py-3.5 first:pt-0 last:pb-0',
											)}
										>
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

						{property.appliances.length > 0 ? <HomeGuideEquipmentGuides appliances={property.appliances} /> : null}
					</TabPanel>
				)}

				{data.paidExtras.length > 0 && (
					<TabPanel
						id="extras"
						labelledBy="home-guide-tab-extras"
						active={activeTab === 'extras'}
						services={propertyServices}
					>
						<HomeGuidePaidExtras extras={data.paidExtras} totalLabel={data.extrasTotalLabel} />
					</TabPanel>
				)}

				{(property.houseRules || property.privacyPolicy) && (
					<TabPanel
						id="rules"
						labelledBy="home-guide-tab-rules"
						active={activeTab === 'rules'}
						services={propertyServices}
					>
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

				<TabPanel
					id="contact"
					labelledBy="home-guide-tab-contact"
					active={activeTab === 'contact'}
					services={propertyServices}
				>
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
