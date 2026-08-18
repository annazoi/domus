'use client';

import Image from 'next/image';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ArrowRight, Bath, BedDouble, Menu, Star, Users } from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { DayPicker } from 'react-day-picker';
import { BrandingPreviewMap } from '@/components/google-maps';
import { cn, Input } from '@/components/ui';
import { Amenities, type AmenityId } from '@/config/constants/dropdowns/amenities.options';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph, BrandingHeroMedia, BrandingHostProfileLink, BrandingWordmark } from './branding-preview-shared';
import { BrandingGuestExtrasSection } from './branding-guest-extras-section';
import { BrandingPrivacyAccess } from './branding-privacy-access';
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

const HIKARI_TRUST_AVATARS = [
	'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80',
	'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80',
	'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=96&q=80',
	'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=96&q=80',
] as const;

function hikariNavTarget(label: string) {
	const key = label.trim().toLowerCase();
	if (key === 'home' || key === 'stay') return 'hikari-hero';
	if (key === 'gallery' || key === 'space') return 'hikari-gallery';
	if (key === 'amenities') return 'hikari-amenities';
	if (key === 'booking' || key === 'reserve' || key === 'book') return 'hikari-booking';
	return '';
}

function HikariScrollRevealWord({
	word,
	index,
	total,
	progress,
}: {
	word: string;
	index: number;
	total: number;
	progress: MotionValue<number>;
}) {
	const start = index / Math.max(total, 1);
	const end = (index + 1) / Math.max(total, 1);
	const color = useTransform(progress, [start, end], ['rgba(28, 25, 23, 0.14)', '#1c1917']);

	return (
		<motion.span style={{ color }} className="inline will-change-[color]">
			{word}{' '}
		</motion.span>
	);
}

function HikariScrollRevealText({ words }: { words: string[] }) {
	const sectionRef = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start 78%', 'center 42%'],
	});

	if (words.length === 0) return null;

	return (
		<section
			ref={sectionRef}
			className="relative z-20 flex items-center justify-center bg-[#f6f3ee] px-6 py-28 md:px-12 md:py-25 md:pb-18"
			aria-label="About the stay"
		>
			<p className="max-w-5xl text-center font-[family-name:var(--preview-hikari-display)] text-[clamp(1.75rem,4.5vw,2.25rem)] font-medium leading-[1.25] tracking-[-0.03em]">
				{words.map((word, index) => (
					<HikariScrollRevealWord
						key={`${word}-${index}`}
						word={word}
						index={index}
						total={words.length}
						progress={scrollYProgress}
					/>
				))}
			</p>
		</section>
	);
}

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
		<div className="lg:border-l lg:border-[#1c1917]/10 lg:pl-10">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="font-[family-name:var(--preview-hikari-body)] text-[11px] font-medium uppercase tracking-[0.22em] text-[#1c1917]/40">
						{data.booking.eyebrow}
					</p>
					{data.booking.price.trim() ? (
						<p className="mt-2 font-[family-name:var(--preview-hikari-display)] text-[2.35rem] font-medium leading-none tracking-[-0.03em] text-[#1c1917]">
							{data.booking.price}
							<span className="ml-1.5 align-middle font-[family-name:var(--preview-hikari-body)] text-sm font-normal text-[#1c1917]/40">
								{data.booking.per}
							</span>
						</p>
					) : null}
				</div>
				{data.booking.rating.trim() ? (
					<div className="flex items-center gap-1.5 rounded-full bg-[#f6f3ee] px-3 py-1.5">
						<Star className="h-3.5 w-3.5 fill-[#b08a62] text-[#b08a62]" aria-hidden />
						<span className="font-[family-name:var(--preview-hikari-body)] text-xs font-medium text-[#1c1917]">
							{data.booking.rating}
						</span>
					</div>
				) : null}
			</div>

			<p className="mt-5 text-sm leading-relaxed text-[#1c1917]/55">{priceHint}</p>
			{data.booking.guests.trim() ? (
				<p className="mt-1.5 text-sm text-[#1c1917]/40">{data.booking.guests}</p>
			) : null}

			<div
				ref={booking.stayPickerRef}
				className="relative mt-6 [--rdp-accent-color:#b08a62] [--rdp-accent-background-color:rgba(176,138,98,0.14)]"
			>
				<div className="grid grid-cols-2 gap-6 border-y border-[#1c1917]/10 py-4">
					<button
						type="button"
						onClick={() => booking.setStayPickerOpen(true)}
						className="cursor-pointer text-left"
					>
						<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1c1917]/40">Check in</p>
						<p className="mt-1.5 font-[family-name:var(--preview-hikari-display)] text-lg font-medium tracking-tight">
							{booking.stayRange?.from ? formatStay(booking.stayRange.from) : data.booking.arrival || '—'}
						</p>
					</button>
					<button
						type="button"
						onClick={() => booking.setStayPickerOpen(true)}
						className="cursor-pointer border-l border-[#1c1917]/10 pl-6 text-left"
					>
						<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1c1917]/40">Check out</p>
						<p className="mt-1.5 font-[family-name:var(--preview-hikari-display)] text-lg font-medium tracking-tight">
							{booking.stayRange?.to ? formatStay(booking.stayRange.to) : data.booking.departure || '—'}
						</p>
					</button>
				</div>
				{booking.stayPickerOpen ? (
					<div
						role="dialog"
						aria-label="Select stay dates"
						className="absolute inset-x-0 top-full z-30 mt-2 rounded-2xl border border-[#1c1917]/10 bg-white p-3 shadow-[0_24px_60px_-24px_rgba(28,25,23,0.4)]"
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
						<div className="mt-2 flex gap-2 border-t border-[#1c1917]/08 pt-2">
							<button
								type="button"
								onClick={booking.clearStayRange}
								disabled={!booking.stayRange?.from && !booking.stayRange?.to}
								className="cursor-pointer flex-1 rounded-full py-2.5 text-sm text-[#1c1917]/45 transition hover:text-[#1c1917] disabled:cursor-not-allowed disabled:opacity-40"
							>
								Clear
							</button>
							<button
								type="button"
								onClick={() => booking.setStayPickerOpen(false)}
								className="cursor-pointer flex-1 rounded-full bg-[#1c1917] py-2.5 text-sm font-medium text-[#f6f3ee] transition hover:bg-[#b08a62]"
							>
								Apply
							</button>
						</div>
					</div>
				) : null}
			</div>

			<div className="mt-5">
				<label
					htmlFor={booking.guestFieldId}
					className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1c1917]/40"
				>
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
					className="mt-2 rounded-none border-0 border-b border-[#1c1917]/15 bg-transparent px-0 shadow-none"
					variant="compact"
				/>
			</div>

			<button
				type="button"
				onClick={() => void booking.handleReserveClick()}
				disabled={reserveDisabled}
				className={cn(
					'group mt-7 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1c1917] px-5 py-3.5 text-[15px] font-medium text-[#f6f3ee] shadow-[0_12px_32px_-16px_rgba(28,25,23,0.55)] transition hover:bg-[#b08a62] disabled:cursor-not-allowed disabled:opacity-50',
				)}
			>
				<span>{booking.checkingAvailability ? 'Checking…' : data.booking.cta}</span>
				<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
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
	const aboutShort = data.concept.title.trim();
	const aboutLong = [data.concept.paragraphs[0], data.concept.paragraphs[1]].filter(Boolean).join(' ').trim();
	const welcomeText = data.welcome.html
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim();
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
	const hostImage = data.host.imageSrc.trim();
	const headerCta = data.booking.cta.trim() || 'Book your stay';
	const trustAvatars = useMemo(() => {
		const next: string[] = [];
		if (hostImage) next.push(hostImage);
		for (const src of HIKARI_TRUST_AVATARS) {
			if (next.length >= 4) break;
			if (next.includes(src)) continue;
			next.push(src);
		}
		return next;
	}, [hostImage]);
	const heroRef = useRef<HTMLElement>(null);
	const stayBandRef = useRef<HTMLDivElement>(null);
	const scrollRevealCopy = welcomeText;
	const scrollRevealWords = useMemo(
		() => (scrollRevealCopy ? scrollRevealCopy.split(/\s+/).filter(Boolean) : []),
		[scrollRevealCopy],
	);
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
					id="hikari-hero"
					ref={heroRef}
					className="relative flex min-h-[100svh] flex-col overflow-hidden sm:min-h-[min(100svh,56rem)]"
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
					<div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/45 via-black/25 to-black/50" aria-hidden />

					<header className="relative z-30">
						<div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-5 sm:px-10 lg:px-12">
							<BrandingWordmark
								wordmark={data.wordmark}
								logoSrc={data.logoSrc}
								logoAlt={data.logoAlt}
								className="font-[family-name:var(--preview-hikari-display)] text-xl font-semibold tracking-[0.06em] text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.35)] sm:text-2xl"
							/>
							{data.nav.length > 0 ? (
								<nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
									{data.nav.map((item) => {
										const target = hikariNavTarget(item.label);
										return (
											<button
												key={item.label}
												type="button"
												onClick={() => (target ? scrollToId(target) : undefined)}
												className={cn(
													'cursor-pointer font-[family-name:var(--preview-hikari-body)] text-[15px] tracking-wide text-white/85 transition hover:text-white',
													item.current && 'font-medium text-white',
												)}
											>
												{item.label}
											</button>
										);
									})}
								</nav>
							) : null}
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={() => scrollToId('hikari-booking')}
									className="hidden cursor-pointer rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#1c1917] shadow-[0_8px_24px_-10px_rgba(0,0,0,0.45)] transition hover:bg-white/90 sm:inline-flex"
								>
									{headerCta}
								</button>
								{listingPreview ? null : <Menu className="h-5 w-5 text-white/90 lg:hidden" strokeWidth={1.25} />}
							</div>
						</div>
					</header>

					<div className="relative z-20 flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-8 text-center sm:px-10 sm:pb-20">
						{trustAvatars.length > 0 ? (
							<div className="flex flex-wrap items-center justify-center gap-3">
								<div className="flex items-center pl-1">
									{trustAvatars.map((src, index) => (
										<span
											key={`${src}-${index}`}
											className="relative -ml-2 h-9 w-9 overflow-hidden rounded-full border-2 border-white/90 first:ml-0"
											style={{ zIndex: trustAvatars.length - index }}
										>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img src={src} alt="" className="h-full w-full object-cover" />
										</span>
									))}
								</div>
								<p className="font-[family-name:var(--preview-hikari-body)] text-sm text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
									{listingPreview && hostName ? `Hosted by ${hostName}` : 'Trusted by travelers worldwide'}
								</p>
							</div>
						) : null}

						<h1 className="mt-6 max-w-4xl font-[family-name:var(--preview-hikari-display)] text-[clamp(2.6rem,7vw,4.75rem)] font-medium leading-[1.05] tracking-[-0.03em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
							{data.hero.title}
						</h1>

						{heroSupport ? (
							<p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)] sm:text-base">
								{heroSupport}
							</p>
						) : null}

						<button
							type="button"
							onClick={() => scrollToId('hikari-booking')}
							className="mt-8 cursor-pointer rounded-full bg-white px-7 py-3.5 text-[15px] font-medium text-[#1c1917] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition hover:bg-white/92"
						>
							{data.booking.cta.trim() || 'Reserve now'}
						</button>
					</div>
				</section>

				{scrollRevealWords.length > 0 ? <HikariScrollRevealText words={scrollRevealWords} /> : null}

				<section className="relative z-20 bg-[#f6f3ee] px-5 pb-12 pt-10 sm:px-10 sm:pb-16 sm:pt-12 lg:px-12">
					<div className="mx-auto max-w-[1400px]">
						{stayBandImage ? (
							<div
								ref={stayBandRef}
								className="relative aspect-[16/10] w-full overflow-hidden bg-[#1c1917]/8 sm:aspect-[21/9] rounded-2xl"
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
									'grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4',
									stayBandImage ? 'mt-10 sm:mt-12' : undefined,
								)}
							>
								{stayHighlights.map((item) => (
									<li key={item.key} className="flex items-start gap-3">
										<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">{item.icon}</div>
										<p className="pt-1 text-[15px] font-medium leading-snug text-[#1c1917]/80">{item.label}</p>
									</li>
								))}
							</ul>
						) : null}

						{mosaicImages.length > 0 ? (
							<div id="hikari-gallery" className="mt-14 scroll-mt-8 sm:mt-16">
								{aboutLong ? (
									<p className="mx-auto mb-10 max-w-3xl text-center font-[family-name:var(--preview-hikari-display)] text-[clamp(1.15rem,2.4vw,1.45rem)] font-medium leading-[1.55] tracking-[-0.02em] text-[#1c1917]/75 sm:mb-12">
										{aboutLong}
									</p>
								) : null}
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
							<div id="hikari-amenities" className="mt-16 scroll-mt-8 sm:mt-20">
								<div className="flex flex-col items-end justify-between gap-6 border-b border-[#1c1917]/12 pb-6 sm:flex-row sm:items-end">
									<div className="max-w-xl">
										<p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#1c1917]/40">Amenities</p>
										<h2 className="mt-3 font-[family-name:var(--preview-hikari-display)] text-[clamp(1.85rem,3.4vw,2.65rem)] font-medium leading-[1.1] tracking-[-0.03em] text-[#1c1917]">
											What the house provides
										</h2>
									</div>
									<p className="text-sm tabular-nums text-[#1c1917]/40 sm:pb-1">
										{String(data.amenities.length).padStart(2, '0')} listed
									</p>
								</div>
								<ul className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-3 lg:gap-x-14">
									{data.amenities.map((amenity, index) => (
										<li
											key={amenity.id}
											className="flex items-center gap-3.5 border-b border-[#1c1917]/10 py-5"
										>
											<span className="w-7 shrink-0 font-[family-name:var(--preview-hikari-display)] text-sm tabular-nums text-[#b08a62]">
												{String(index + 1).padStart(2, '0')}
											</span>
											<AmenityGlyph id={amenity.id} className="h-4 w-4 shrink-0 text-[#1c1917]/40" />
											<p className="min-w-0 text-[15px] leading-snug text-[#1c1917]/85">
												{amenity.label}
												{amenity.quantity ? (
													<span className="text-[#1c1917]/40"> · {amenity.quantity}</span>
												) : null}
											</p>
										</li>
									))}
								</ul>
							</div>
						) : null}
					</div>
				</section>

				<section className="relative z-20 bg-[#f6f3ee]">
					<div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-10 lg:grid-cols-[1fr_minmax(0,380px)] lg:gap-16 lg:px-12 lg:py-24">
						<div className="space-y-16">
							{data.videos.length > 0 ? (
								<BrandingVideoSection videos={data.videos} variant="canvas" eyebrow="Video tour" />
							) : null}

							<BrandingGuestExtrasSection guestExtras={data.guestExtras} variant="canvas" />

							<div>
								<div className="max-w-xl">
									<p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#1c1917]/40">
										{data.location.eyebrow || 'Location'}
									</p>
									<h2 className="mt-3 font-[family-name:var(--preview-hikari-display)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-tight tracking-[-0.02em] text-[#1c1917]">
										Find your way here
									</h2>
								</div>
								<div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#1c1917]/6 sm:aspect-[2/1]">
									{listingPreview && (data.location.mapCenter || data.location.mapEmbedSrc) ? (
										<BrandingPreviewMap
											title="Property location"
											center={data.location.mapCenter}
											embedSrc={data.location.mapEmbedSrc}
											className="absolute inset-0 h-full w-full border-0"
										/>
									) : data.location.mapImage.trim() ? (
										<Image src={data.location.mapImage} alt="" fill className="object-cover" sizes="100vw" unoptimized />
									) : null}
								</div>
								{data.location.columns.length > 0 ? (
									<div className="mt-8 grid gap-8 sm:grid-cols-2">
										{data.location.columns.map((c) => (
											<div key={c.title}>
												<h3 className="font-[family-name:var(--preview-hikari-display)] text-xl font-medium tracking-tight text-[#1c1917]">
													{c.title}
												</h3>
												<p className="mt-2 text-sm leading-relaxed text-[#1c1917]/55">{c.text}</p>
											</div>
										))}
									</div>
								) : null}
							</div>

							{data.host.name.trim() ? (
								<BrandingHostProfileLink
									hostName={data.host.host_name}
									listingPreview={listingPreview}
									className="scroll-mt-8"
								>
									<div
										id="hikari-host"
										className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6"
									>
										{data.host.imageSrc.trim() ? (
											<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full transition group-hover/host:opacity-90">
												<Image src={data.host.imageSrc} alt="" fill className="object-cover" sizes="80px" unoptimized />
											</div>
										) : null}
										<div>
											{data.host.label ? (
												<p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#1c1917]/40">
													{data.host.label}
												</p>
											) : null}
											<p className="mt-2 font-[family-name:var(--preview-hikari-display)] text-[1.75rem] font-medium tracking-tight text-[#1c1917] transition group-hover/host:text-[#b08a62]">
												{data.host.name}
											</p>
											{data.host.rating.trim() ? (
												<p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#b08a62]">
													<Star className="h-3.5 w-3.5 fill-[#b08a62] text-[#b08a62]" aria-hidden />
													{data.host.rating}
												</p>
											) : null}
											{data.host.bio.trim() ? (
												<p className="mt-3 max-w-lg text-sm leading-relaxed text-[#1c1917]/55">{data.host.bio}</p>
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

			<footer className="relative z-10 bg-[#1c1917] px-5 py-10 sm:px-10 lg:px-12">
				<div className="mx-auto flex max-w-[1400px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
					<p className="font-[family-name:var(--preview-hikari-display)] text-xl font-medium tracking-[-0.02em] text-[#f6f3ee]">
						{data.footer.wordmark}
					</p>
					{(data.houseRules.html || data.privacyPolicy.html) ? (
						<div className="pointer-events-auto z-20 flex flex-wrap gap-2">
							{data.houseRules.html ? (
								<BrandingPrivacyAccess html={data.houseRules.html} variant="canvas" title="House rules" />
							) : null}
							{data.privacyPolicy.html ? (
								<BrandingPrivacyAccess html={data.privacyPolicy.html} variant="canvas" title="Privacy" />
							) : null}
						</div>
					) : null}
					{data.footer.links.length > 0 ? (
						<div className="flex flex-wrap gap-6 text-sm text-[#f6f3ee]/45">
							{data.footer.links.map((l) => (
								<span key={l.label}>{l.label}</span>
							))}
						</div>
					) : null}
					<p className="text-sm text-[#f6f3ee]/40">{data.footer.copyright}</p>
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
