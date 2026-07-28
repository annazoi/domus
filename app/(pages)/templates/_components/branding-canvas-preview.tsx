'use client';

import Image from 'next/image';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Bath, BedDouble, Menu, Star, Users } from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { DayPicker } from 'react-day-picker';
import { BrandingPreviewMap } from '@/components/google-maps';
import { cn, Input } from '@/components/ui';
import { Amenities, type AmenityId } from '@/config/constants/dropdowns/amenities.options';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph, BrandingHeroMedia, BrandingHostProfileLink, BrandingWordmark } from './branding-preview-shared';
import { BrandingGuestExtrasSection } from './branding-guest-extras-section';
import { BrandingPrivacyAccess } from './branding-privacy-access';
import { BrandingRichTextBlock } from './branding-rich-text-block';
import { BrandingVideoSection } from './branding-video-section';
import { PhotoGalleryLightbox } from './photo-gallery-carousel';
import { formatStay, useBrandingStayBooking } from './use-branding-stay-booking';

const hikariDisplay = Cormorant_Garamond({
	subsets: ['latin'],
	variable: '--preview-hikari-display',
	weight: ['400', '500', '600', '700'],
	display: 'swap',
});

const hikariBody = DM_Sans({
	subsets: ['latin'],
	variable: '--preview-hikari-body',
	weight: ['400', '500', '600', '700'],
	display: 'swap',
});

type HikariStayHighlight = {
	key: string;
	icon: ReactNode;
	label: string;
};

const PARKING_AMENITY_IDS: AmenityId[] = [Amenities.PARKING, Amenities.FREE_PARKING, Amenities.PAID_PARKING];

function buildHikariStayHighlights(data: BrandingPreviewDemo): HikariStayHighlight[] {
	const items: HikariStayHighlight[] = [];
	const iconClass = 'h-7 w-7 text-[#1c1917]/65';
	const parking = data.amenities.find((amenity) => PARKING_AMENITY_IDS.includes(amenity.id));

	if (data.stay.maxGuests > 0) {
		items.push({
			key: 'guests',
			icon: <Users className={iconClass} strokeWidth={1.5} aria-hidden />,
			label: data.stay.maxGuests === 1 ? 'Up to 1 person' : `Up to ${data.stay.maxGuests} people`,
		});
	}
	if (data.stay.bedrooms > 0) {
		items.push({
			key: 'bedrooms',
			icon: <BedDouble className={iconClass} strokeWidth={1.5} aria-hidden />,
			label: data.stay.bedrooms === 1 ? '1 cozy room' : `${data.stay.bedrooms} cozy rooms`,
		});
	}
	if (data.stay.bathrooms > 0) {
		items.push({
			key: 'baths',
			icon: <Bath className={iconClass} strokeWidth={1.5} aria-hidden />,
			label: data.stay.bathrooms === 1 ? '1 modern bath' : `${data.stay.bathrooms} modern baths`,
		});
	}
	if (parking) {
		items.push({
			key: parking.id,
			icon: <AmenityGlyph id={parking.id} className={iconClass} />,
			label: parking.label,
		});
	}

	return items.slice(0, 4);
}

function HikariBookingPanel({
	data,
	listingPreview,
	propertyRef,
	guestCap,
}: {
	data: BrandingPreviewDemo;
	listingPreview?: boolean;
	propertyRef: string;
	guestCap: number;
}) {
	const booking = useBrandingStayBooking({ listingPreview, propertyRef, guestCap });
	const priceHint = booking.checkingAvailability
		? 'Checking…'
		: booking.stayRange?.from && booking.stayRange?.to && booking.availabilityMsg
			? booking.availabilityMsg
			: 'Select dates';
	const datesSelected = Boolean(booking.stayRange?.from && booking.stayRange?.to);
	const reserveDisabled =
		listingPreview && (!propertyRef || !datesSelected || booking.checkingAvailability);

	return (
		<div className="border border-[#0a0a0a] bg-[#fcfcfa] p-6 sm:p-8">
			<div className="flex items-start justify-between gap-4 border-b border-[#0a0a0a]/10 pb-5">
				<div>
					<p className="font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.3em] text-[#0a0a0a]/45">
						{data.booking.eyebrow}
					</p>
					{data.booking.price.trim() ? (
						<p className="mt-2 font-[family-name:var(--preview-hikari-display)] text-4xl font-bold tracking-tight text-[#0a0a0a]">
							{data.booking.price}
							<span className="ml-1 text-sm font-normal text-[#0a0a0a]/40">{data.booking.per}</span>
						</p>
					) : null}
				</div>
				{data.booking.rating.trim() ? (
					<div className="flex items-center gap-1 border border-[#d4a853]/40 px-2.5 py-1">
						<Star className="h-3.5 w-3.5 fill-[#d4a853] text-[#d4a853]" aria-hidden />
						<span className="font-[family-name:var(--preview-hikari-body)] text-xs font-medium">{data.booking.rating}</span>
					</div>
				) : null}
			</div>

			<p className="mt-4 font-[family-name:var(--preview-hikari-body)] text-sm text-[#0a0a0a]/55">{priceHint}</p>
			{data.booking.guests.trim() ? (
				<p className="mt-2 font-[family-name:var(--preview-hikari-body)] text-xs uppercase tracking-[0.18em] text-[#0a0a0a]/45">
					{data.booking.guests}
				</p>
			) : null}

			<div ref={booking.stayPickerRef} className="relative mt-6 [--rdp-accent-color:#0a0a0a] [--rdp-accent-background-color:rgba(10,10,10,0.08)]">
				<div className="grid grid-cols-2 gap-px bg-[#0a0a0a]/10">
					<button
						type="button"
						onClick={() => booking.setStayPickerOpen(true)}
						className="cursor-pointer bg-[#fcfcfa] p-4 text-left"
					>
						<p className="font-[family-name:var(--preview-hikari-body)] text-[9px] uppercase tracking-[0.2em] text-[#0a0a0a]/40">In</p>
						<p className="mt-1 font-[family-name:var(--preview-hikari-display)] text-sm font-semibold">
							{booking.stayRange?.from ? formatStay(booking.stayRange.from) : data.booking.arrival || '—'}
						</p>
					</button>
					<button
						type="button"
						onClick={() => booking.setStayPickerOpen(true)}
						className="cursor-pointer bg-[#fcfcfa] p-4 text-left"
					>
						<p className="font-[family-name:var(--preview-hikari-body)] text-[9px] uppercase tracking-[0.2em] text-[#0a0a0a]/40">Out</p>
						<p className="mt-1 font-[family-name:var(--preview-hikari-display)] text-sm font-semibold">
							{booking.stayRange?.to ? formatStay(booking.stayRange.to) : data.booking.departure || '—'}
						</p>
					</button>
				</div>
				{booking.stayPickerOpen ? (
					<div
						role="dialog"
						aria-label="Select stay dates"
						className="absolute inset-x-0 top-full z-30 mt-1 border border-[#0a0a0a] bg-white p-3 shadow-2xl"
					>
						<DayPicker
							mode="range"
							min={1}
							excludeDisabled
							selected={booking.stayRange}
							onSelect={(range) => {
								booking.setStayRange(range);
								if (range?.from && range?.to) void booking.checkAvailabilityForDates(range.from, range.to);
							}}
							disabled={booking.dayDisabled}
							numberOfMonths={1}
						/>
						<div className="mt-2 flex gap-2 border-t border-[#0a0a0a]/10 pt-2">
							<button
								type="button"
								onClick={booking.clearStayRange}
								disabled={!booking.stayRange?.from && !booking.stayRange?.to}
								className="cursor-pointer flex-1 py-2 font-[family-name:var(--preview-hikari-body)] text-xs uppercase tracking-widest text-[#0a0a0a]/45 transition hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-40"
							>
								Clear
							</button>
							<button
								type="button"
								onClick={() => booking.setStayPickerOpen(false)}
								className="cursor-pointer flex-1 py-2 font-[family-name:var(--preview-hikari-body)] text-xs uppercase tracking-widest text-[#0a0a0a]"
							>
								Apply
							</button>
						</div>
					</div>
				) : null}
			</div>

			<div className="mt-5">
				<label htmlFor={booking.guestFieldId} className="font-[family-name:var(--preview-hikari-body)] text-[9px] uppercase tracking-[0.2em] text-[#0a0a0a]/40">
					Guests
				</label>
				<Input
					id={booking.guestFieldId}
					type="number"
					min={1}
					max={guestCap}
					value={booking.guestCount}
					onChange={(e) => {
						const v = parseInt(e.target.value, 10);
						if (!Number.isNaN(v)) booking.setGuestCount(Math.min(guestCap, Math.max(1, v)));
					}}
					className="mt-2 rounded-none border-[#0a0a0a]/15"
					variant="compact"
				/>
			</div>

			<button
				type="button"
				onClick={() => void booking.handleReserveClick()}
				disabled={reserveDisabled}
				className={cn(
					'group mt-8 flex w-full cursor-pointer items-center justify-between bg-[#1c1917] px-5 py-4 font-[family-name:var(--preview-hikari-display)] text-sm font-semibold uppercase tracking-[0.2em] text-[#f6f3ee] transition hover:bg-[#b08a62] hover:text-white disabled:cursor-not-allowed disabled:opacity-50',
				)}
			>
				<span>{booking.checkingAvailability ? 'Checking…' : data.booking.cta}</span>
				<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
			</button>
		</div>
	);
}

export function CanvasPreview({
	data,
	listingPreview,
}: {
	data: BrandingPreviewDemo;
	listingPreview?: boolean;
}) {
	const aboutLong = [data.concept.paragraphs[0], data.concept.paragraphs[1]].filter(Boolean).join(' ').trim();
	const aboutShort = data.concept.title.trim();
	const heroVideo = data.hero.videoSrc?.trim() ?? '';
	const heroImageSrc = data.hero.imageSrc.trim() || data.gallery.large.src.trim();
	const mosaicImages = useMemo(() => {
		const seen = new Set<string>();
		const next: string[] = [];
		for (const src of [
			data.gallery.large.src.trim(),
			...data.gallery.stack.map((item) => item.src.trim()),
			data.gallery.full.src.trim(),
		]) {
			if (!src || seen.has(src)) continue;
			seen.add(src);
			next.push(src);
			if (next.length >= 5) break;
		}
		return next;
	}, [data.gallery]);
	const galleryImages = useMemo(() => {
		const seen = new Set<string>();
		const next: string[] = [];
		for (const src of [heroImageSrc, ...mosaicImages]) {
			if (!src || seen.has(src)) continue;
			seen.add(src);
			next.push(src);
		}
		return next;
	}, [heroImageSrc, mosaicImages]);
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [galleryIndex, setGalleryIndex] = useState(0);
	const propertyRef = useMemo(
		() => (listingPreview ? (data.propertyRef ?? '').trim() : ''),
		[listingPreview, data.propertyRef],
	);
	const guestCap = useMemo(() => {
		const m = data.booking.guests.match(/^(\d+)/);
		const n = m ? parseInt(m[1], 10) : data.booking.maxGuests;
		return Math.min(Math.max(1, data.booking.maxGuests), Math.max(1, n));
	}, [data.booking.guests, data.booking.maxGuests]);

	const openGallery = (src: string) => {
		const index = galleryImages.findIndex((img) => img === src);
		setGalleryIndex(index >= 0 ? index : 0);
		setGalleryOpen(true);
	};

	const stayHighlights = useMemo(() => buildHikariStayHighlights(data), [data]);
	const stayBandImage = useMemo(() => {
		const candidates = [
			data.gallery.large.src.trim(),
			...data.gallery.stack.map((item) => item.src.trim()),
			data.gallery.full.src.trim(),
			heroImageSrc,
		];
		return candidates.find((src) => src && src !== heroImageSrc) || heroImageSrc || '';
	}, [data.gallery, heroImageSrc]);
	const heroSupport =
		aboutShort ||
		(data.hero.location
			? `${data.stay.propertyType ? `${data.stay.propertyType} in ` : ''}${data.hero.location}.`
			: '');
	const hostName = data.host.name.trim();
	const headerCta = data.booking.cta.trim() || 'Check availability';
	const heroRef = useRef<HTMLElement>(null);
	const stayBandRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: heroRef,
		offset: ['start start', 'end start'],
	});
	const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '48%']);
	const { scrollYProgress: stayBandProgress } = useScroll({
		target: stayBandRef,
		offset: ['start end', 'end start'],
	});
	const stayBandY = useTransform(stayBandProgress, [0, 1], ['-28%', '28%']);

	const scrollToId = (id: string) => {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	return (
		<div
			className={cn(
				hikariDisplay.variable,
				hikariBody.variable,
				'min-h-screen bg-[#f6f3ee] font-[family-name:var(--preview-hikari-body)] text-[#1c1917] antialiased selection:bg-[#b08a62]/25',
			)}
		>
			<main className="relative z-10">
				<section
					ref={heroRef}
					className="relative h-[min(88vh,52rem)] min-h-[26rem] overflow-hidden sm:min-h-[32rem]"
				>
					{(heroVideo || heroImageSrc) ? (
						<motion.div style={{ y: parallaxY }} className="absolute inset-x-0 -top-[24%] h-[148%] w-full will-change-transform">
							<BrandingHeroMedia
								videoSrc={heroVideo}
								videoSource={data.hero.videoSource}
								imageSrc={heroImageSrc}
								className="h-full min-h-full w-full"
								sizes="100vw"
								priority
								onImageClick={heroVideo ? undefined : () => openGallery(heroImageSrc)}
							/>
						</motion.div>
					) : (
						<div className="absolute inset-0 bg-[#1c1917]" />
					)}
					<div
						className="pointer-events-none absolute inset-x-0 top-0 z-10 h-36 bg-gradient-to-b from-black/50 to-transparent"
						aria-hidden
					/>

					<header className="relative z-30">
						<div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-5 sm:px-10 lg:px-12">
							<BrandingWordmark
								wordmark={data.wordmark}
								logoSrc={data.logoSrc}
								logoAlt={data.logoAlt}
								className="font-[family-name:var(--preview-hikari-display)] text-xl font-semibold tracking-[0.08em] text-[#f6f3ee] drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)] sm:text-2xl"
							/>
							{data.nav.length > 0 ? (
								<nav className="hidden items-center gap-8 lg:flex">
									{data.nav.map((item) => (
										<span
											key={item.label}
											className={cn(
												'font-[family-name:var(--preview-hikari-body)] text-[15px] tracking-wide drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]',
												item.current ? 'font-medium text-[#f6f3ee]' : 'text-[#f6f3ee]/70',
											)}
										>
											{item.label}
										</span>
									))}
								</nav>
							) : null}
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={() => scrollToId('hikari-booking')}
									className="hidden cursor-pointer items-center gap-1.5 rounded-full bg-[#b08a62] px-5 py-2.5 text-[15px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] transition hover:bg-[#c49a72] sm:inline-flex"
								>
									{headerCta}
									<ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
								</button>
								{listingPreview ? null : <Menu className="h-5 w-5 text-[#f6f3ee]/85 lg:hidden" strokeWidth={1.25} />}
							</div>
						</div>
					</header>
				</section>

				<section className="relative z-20 bg-[#f6f3ee] px-5 pb-12 pt-10 sm:px-10 sm:pb-16 sm:pt-12 lg:px-12">
					<div className="mx-auto max-w-[1400px]">
						<div className="max-w-3xl">
							{data.hero.series ? (
								<p className="flex items-center gap-3 font-[family-name:var(--preview-hikari-body)] text-[11px] font-medium uppercase tracking-[0.22em] text-[#b08a62]">
									<span className="h-px w-6 bg-[#b08a62]" aria-hidden />
									{data.hero.series}
								</p>
							) : null}
							<h1 className="mt-4 font-[family-name:var(--preview-hikari-display)] text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.08] tracking-[-0.02em] text-[#1c1917]">
								{data.hero.title}
							</h1>
							{heroSupport ? (
								<p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#1c1917]/62 sm:text-base">
									{heroSupport}
								</p>
							) : null}
							<div className="mt-7 flex flex-wrap items-center gap-3">
								<button
									type="button"
									onClick={() => scrollToId(hostName ? 'hikari-host' : 'hikari-booking')}
									className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#1c1917] px-6 py-3 text-[15px] font-medium text-[#f6f3ee] transition hover:bg-[#1c1917]/85"
								>
									{hostName ? 'Meet the host' : headerCta}
									<ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
								</button>
								{hostName || galleryImages.length > 1 ? (
									<button
										type="button"
										onClick={() =>
											hostName
												? scrollToId('hikari-booking')
												: openGallery(galleryImages[1] ?? heroImageSrc)
										}
										className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#1c1917]/18 bg-transparent px-6 py-3 text-[15px] font-medium text-[#1c1917] transition hover:border-[#1c1917]/35 hover:bg-white/60"
									>
										{hostName ? headerCta : 'View photos'}
										<ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
									</button>
								) : null}
							</div>
						</div>

						{stayBandImage ? (
							<div
								ref={stayBandRef}
								className="relative mt-12 aspect-[16/10] w-full overflow-hidden bg-[#1c1917]/8 sm:mt-14 sm:aspect-[21/9]"
							>
								<motion.div
									style={{ y: stayBandY }}
									className="absolute inset-x-0 -top-[32%] h-[164%] w-full will-change-transform"
								>
									<button
										type="button"
										onClick={() => openGallery(stayBandImage)}
										className="absolute inset-0 cursor-pointer"
										aria-label="View photo"
									>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img src={stayBandImage} alt="" className="h-full w-full object-cover" />
									</button>
								</motion.div>
							</div>
						) : null}

						{stayHighlights.length > 0 ? (
							<ul
								className={cn(
									'grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4',
									stayBandImage ? 'mt-3 sm:mt-4' : 'mt-12',
								)}
							>
								{stayHighlights.map((item) => (
									<li
										key={item.key}
										className="flex flex-col items-center justify-center rounded-2xl border border-[#1c1917]/08 bg-white px-4 py-7 text-center shadow-[0_10px_30px_-24px_rgba(28,25,23,0.35)] sm:px-5 sm:py-8"
									>
										<div className="flex h-10 w-10 items-center justify-center">{item.icon}</div>
										<p className="mt-4 font-[family-name:var(--preview-hikari-body)] text-sm font-medium leading-snug text-[#1c1917]/80 sm:text-[15px]">
											{item.label}
										</p>
									</li>
								))}
							</ul>
						) : null}

						{mosaicImages.length > 0 ? (
							<div className="mt-14 sm:mt-16">
								<div
									className={cn(
										'grid gap-3 sm:gap-3.5',
										mosaicImages.length >= 5
											? 'grid-cols-2 sm:grid-cols-4 sm:grid-rows-2 sm:h-[min(34rem,58vh)]'
											: 'grid-cols-2 sm:grid-cols-3',
									)}
								>
									{mosaicImages.map((src, index) => {
										const isFeature = mosaicImages.length >= 5 && index === 4;
										return (
											<button
												key={`${src}-${index}`}
												type="button"
												onClick={() => openGallery(src)}
												className={cn(
													'group relative min-h-0 cursor-pointer overflow-hidden rounded-2xl bg-[#1c1917]/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b08a62]',
													isFeature
														? 'col-span-2 aspect-[4/5] sm:col-span-2 sm:col-start-3 sm:row-span-2 sm:row-start-1 sm:aspect-auto sm:h-full'
														: mosaicImages.length >= 5
															? 'aspect-[4/5] sm:aspect-auto sm:h-full'
															: 'aspect-[4/5]',
												)}
											>
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img
													src={src}
													alt=""
													className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
												/>
											</button>
										);
									})}
								</div>
							</div>
						) : null}

						{data.amenities.length > 0 ? (
							<div className="mt-16 sm:mt-20">
								<div className="mx-auto max-w-2xl text-center">
									<p className="font-[family-name:var(--preview-hikari-body)] text-[11px] font-medium uppercase tracking-[0.22em] text-[#1c1917]/40">
										Amenities
									</p>
									<h2 className="mt-3 font-[family-name:var(--preview-hikari-display)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-tight tracking-[-0.02em] text-[#1c1917]">
										Everything you need for a comfortable stay
									</h2>
									<p className="mt-3 text-sm leading-relaxed text-[#1c1917]/55 sm:text-[15px]">
										Thoughtfully selected amenities designed to make every stay comfortable, convenient, and truly unforgettable.
									</p>
								</div>
								<ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
									{data.amenities.map((amenity) => (
										<li
											key={amenity.id}
											className="flex flex-col items-center justify-center rounded-2xl border border-[#1c1917]/08 bg-white px-4 py-7 text-center sm:px-5 sm:py-8"
										>
											<AmenityGlyph id={amenity.id} className="h-7 w-7 text-[#1c1917]/70" />
											<p className="mt-4 font-[family-name:var(--preview-hikari-body)] text-sm font-medium leading-snug text-[#1c1917]/80">
												{amenity.label}
												{amenity.quantity ? ` · ${amenity.quantity}` : ''}
											</p>
										</li>
									))}
								</ul>
							</div>
						) : null}
					</div>
				</section>

				<section className="bg-[#fbfaf7]">
					<div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-10 lg:grid-cols-[1fr_minmax(0,380px)] lg:gap-16 lg:py-24">
						<div className="space-y-16">
							{aboutLong ? (
								<div>
									<p className="font-[family-name:var(--preview-hikari-display)] text-6xl font-bold leading-none text-[#0a0a0a]/[0.04]">01</p>
									<p className="-mt-8 max-w-2xl font-[family-name:var(--preview-hikari-body)] text-base leading-[1.85] text-[#0a0a0a]/70 sm:text-lg">
										{aboutLong}
									</p>
								</div>
							) : null}

							{data.welcome.html ? (
								<div>
									<p className="font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.35em] text-[#0a0a0a]/40">
										Welcome
									</p>
									<div className="mt-4 max-w-2xl">
										<BrandingRichTextBlock html={data.welcome.html} variant="canvas" />
									</div>
								</div>
							) : null}

							{data.videos.length > 0 ? (
								<BrandingVideoSection videos={data.videos} variant="canvas" eyebrow="Video tour" />
							) : null}

							<BrandingGuestExtrasSection guestExtras={data.guestExtras} variant="canvas" />

							{data.houseRules.html ? (
								<div>
									<p className="mb-4 font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.35em] text-[#0a0a0a]/40">
										House rules
									</p>
									<div className="max-w-2xl border border-[#0a0a0a]/10 bg-white p-6">
										<BrandingRichTextBlock html={data.houseRules.html} variant="canvas" />
									</div>
								</div>
							) : null}

							<div>
								<p className="mb-6 font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.35em] text-[#0a0a0a]/40">
									{data.location.eyebrow || 'Location'}
								</p>
								<div className="relative aspect-[2/1] w-full overflow-hidden bg-[#0a0a0a]/5">
									{listingPreview && (data.location.mapCenter || data.location.mapEmbedSrc) ? (
										<BrandingPreviewMap
											title="Property location"
											center={data.location.mapCenter}
											embedSrc={data.location.mapEmbedSrc}
											className="absolute inset-0 h-full w-full border-0 grayscale"
										/>
									) : data.location.mapImage.trim() ? (
										<Image src={data.location.mapImage} alt="" fill className="object-cover grayscale" sizes="100vw" unoptimized />
									) : null}
								</div>
								<div className="mt-8 grid gap-8 sm:grid-cols-2">
									{data.location.columns.map((c) => (
										<div key={c.title}>
											<h3 className="font-[family-name:var(--preview-hikari-display)] text-xs font-bold uppercase tracking-[0.2em]">
												{c.title}
											</h3>
											<p className="mt-2 font-[family-name:var(--preview-hikari-body)] text-sm leading-relaxed text-[#0a0a0a]/60">
												{c.text}
											</p>
										</div>
									))}
								</div>
							</div>

							{data.host.name.trim() ? (
								<BrandingHostProfileLink
									hostName={data.host.host_name}
									listingPreview={listingPreview}
									className="scroll-mt-8 transition hover:bg-[#0a0a0a]/[0.02]"
								>
									<div
										id="hikari-host"
										className="flex flex-col gap-6 border border-[#0a0a0a]/10 p-8 sm:flex-row sm:items-center"
									>
										{data.host.imageSrc.trim() ? (
											<div className="relative h-24 w-24 shrink-0 overflow-hidden bg-[#0a0a0a]/5 transition group-hover/host:opacity-90">
												<Image src={data.host.imageSrc} alt="" fill className="object-cover grayscale" sizes="96px" unoptimized />
											</div>
										) : null}
										<div>
											{data.host.label ? (
												<p className="font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.25em] text-[#0a0a0a]/40">
													{data.host.label}
												</p>
											) : null}
											<p className="mt-2 font-[family-name:var(--preview-hikari-display)] text-2xl font-bold transition group-hover/host:text-[#0a0a0a]/75">
												{data.host.name}
											</p>
											{data.host.rating.trim() ? (
												<p className="mt-1 font-[family-name:var(--preview-hikari-body)] text-xs text-[#d4a853]">
													{data.host.rating}
												</p>
											) : null}
											{data.host.bio.trim() ? (
												<p className="mt-3 max-w-lg font-[family-name:var(--preview-hikari-body)] text-sm leading-relaxed text-[#0a0a0a]/65">
													{data.host.bio}
												</p>
											) : null}
										</div>
									</div>
								</BrandingHostProfileLink>
							) : null}
						</div>

						<aside id="hikari-booking" className="scroll-mt-8 lg:sticky lg:top-8 lg:self-start">
							<HikariBookingPanel
								data={data}
								listingPreview={listingPreview}
								propertyRef={propertyRef}
								guestCap={guestCap}
							/>
						</aside>
					</div>
				</section>
			</main>

			<footer className="relative z-10 border-t border-[#0a0a0a] bg-[#0a0a0a] px-5 py-8 text-[#fcfcfa] sm:px-10">
				<div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<p className="font-[family-name:var(--preview-hikari-display)] text-sm font-bold uppercase tracking-[0.3em]">
						{data.footer.wordmark}
					</p>
					{data.privacyPolicy.html ? (
									<div className="pointer-events-auto z-20">
										<BrandingPrivacyAccess html={data.privacyPolicy.html} variant="canvas" />
									</div>
								) : null}
					{data.footer.links.length > 0 ? (
						<div className="flex flex-wrap gap-8 font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.2em] text-[#fcfcfa]/45">
							{data.footer.links.map((l) => (
								<span key={l.label}>{l.label}</span>
							))}
						</div>
					) : null}
					<p className="font-[family-name:var(--preview-hikari-body)] text-xs text-[#fcfcfa]/35">{data.footer.copyright}</p>
				</div>
			</footer>

			<PhotoGalleryLightbox
				images={galleryImages}
				open={galleryOpen}
				initialIndex={galleryIndex}
				onClose={() => setGalleryOpen(false)}
			/>
		</div>
	);
}
