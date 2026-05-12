'use client';

import Image from 'next/image';
import { Manrope, Noto_Serif } from 'next/font/google';
import { ChevronDown, CircleUser, MapPin, Menu, Search, Star } from 'lucide-react';
import { BrandingPreviewMap } from '@/components/google-maps';
import { cn, Input } from '@/components/ui';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiRoutes } from '@/config/api/routes';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph, FillImg } from './branding-preview-shared';
import { PhotoGalleryLightbox } from './photo-gallery-carousel';
import { DayPicker, type DateRange } from 'react-day-picker';
import { useCheckAvailability } from '@/features/bookings/hooks/use-check-availability';

const notoSerif = Noto_Serif({
	subsets: ['latin'],
	variable: '--preview-arch-headline',
	weight: ['400', '600', '700'],
	display: 'swap',
});

const manrope = Manrope({
	subsets: ['latin'],
	variable: '--preview-arch-body',
	weight: ['300', '400', '500', '700'],
	display: 'swap',
});

function startOfToday() {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d;
}

function formatStay(d: Date) {
	return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function toDateParam(d: Date) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function dayStart(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
}

function nightsPriced(checkIn: Date, checkOutExclusive: Date, allowed: Set<string>) {
	for (let c = dayStart(checkIn), end = dayStart(checkOutExclusive); c < end; c.setDate(c.getDate() + 1)) {
		if (!allowed.has(toDateParam(c))) return false;
	}
	return true;
}

export function ArchitecturaPreview({
	data,
	listingPreview,
}: {
	data: BrandingPreviewDemo;
	listingPreview?: boolean;
}) {
	const aboutLong = [data.concept.paragraphs[0], data.concept.paragraphs[1]].filter(Boolean).join(' ').trim();
	const showAboutLong = Boolean(aboutLong);
	const aboutShort = data.concept.title.trim();
	const galleryImages = useMemo(
		() => [
		data.gallery.large.src.trim(),
		data.gallery.stack[0].src.trim(),
		data.gallery.stack[1].src.trim(),
	].filter(Boolean),
		[data.gallery.large.src, data.gallery.stack],
	);
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [galleryIndex, setGalleryIndex] = useState(0);
	const [stayRange, setStayRange] = useState<DateRange | undefined>();
	const [stayPickerOpen, setStayPickerOpen] = useState(false);
	const stayPickerRef = useRef<HTMLDivElement>(null);
	const guestFieldId = useId();
	const guestCap = useMemo(() => {
		const m = data.booking.guests.match(/^(\d+)/);
		const n = m ? parseInt(m[1], 10) : data.booking.maxGuests;
		const cap = Number.isFinite(n) && n > 0 ? n : data.booking.maxGuests;
		return Math.min(Math.max(1, data.booking.maxGuests), Math.max(1, cap));
	}, [data.booking.guests, data.booking.maxGuests]);
	const [guestCount, setGuestCount] = useState(1);
	const [checkingAvailability, setCheckingAvailability] = useState(false);
	const [availabilityMsg, setAvailabilityMsg] = useState<string | null>(null);
	const [availableForCheckout, setAvailableForCheckout] = useState(false);
	const [totalPrice, setTotalPrice] = useState<number | null>(null);
	const [allowedDateKeys, setAllowedDateKeys] = useState<Set<string>>(new Set());
	const todayStart = useMemo(() => startOfToday(), []);
	const propertyRef = useMemo(() => data.footer.tagline.replace(/^\//, '').trim(), [data.footer.tagline]);
	const checkAvailabilityMutation = useCheckAvailability();
	const router = useRouter();
	const hostRating = data.host.rating.trim() || (data.booking.rating.trim() ? `${data.booking.rating} rating` : 'Top rated host');
	const hostBio = data.host.bio.trim() || 'Friendly, responsive host with a focus on thoughtful local recommendations.';

	const openGallery = (src: string) => {
		const index = galleryImages.findIndex((img) => img === src);
		setGalleryIndex(index >= 0 ? index : 0);
		setGalleryOpen(true);
	};

	useEffect(() => {
		setGuestCount((c) => Math.min(guestCap, Math.max(1, c)));
	}, [guestCap]);

	useEffect(() => {
		if (!listingPreview || !propertyRef) return;
		let cancelled = false;
		void (async () => {
			try {
				const qs = new URLSearchParams({ start: toDateParam(todayStart) });
				const res = await fetch(`/api${ApiRoutes.properties.unavailableDays(propertyRef)}?${qs}`);
				if (!res.ok || cancelled) return;
				const json = (await res.json()) as { available_dates?: string[] };
				if (!cancelled) setAllowedDateKeys(new Set(json.available_dates ?? []));
			} catch {
				if (!cancelled) setAllowedDateKeys(new Set());
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [listingPreview, propertyRef, todayStart]);

	const dayDisabled = useMemo(() => {
		return (day: Date) => {
			const d = dayStart(day);
			if (d.getTime() < todayStart.getTime()) return true;

			const from = stayRange?.from ? dayStart(stayRange.from) : null;
			const to = stayRange?.to ? dayStart(stayRange.to) : null;
			const key = toDateParam(day);

			if (!from) return !allowedDateKeys.has(key);
			if (!to) {
				if (d.getTime() < from.getTime()) return true;
				if (d.getTime() === from.getTime()) return !allowedDateKeys.has(key);
				return !nightsPriced(from, d, allowedDateKeys);
			}

			if (d.getTime() < from.getTime()) return true;
			if (d.getTime() === from.getTime()) return !allowedDateKeys.has(key);
			if (d.getTime() <= to.getTime()) {
				if (d.getTime() === to.getTime()) return !nightsPriced(from, d, allowedDateKeys);
				return !allowedDateKeys.has(key);
			}
			return !nightsPriced(from, d, allowedDateKeys);
		};
	}, [allowedDateKeys, todayStart, stayRange?.from, stayRange?.to]);

	useEffect(() => {
		if (!stayPickerOpen) return;
		const onPointerDown = (e: PointerEvent) => {
			const el = stayPickerRef.current;
			if (el && !el.contains(e.target as Node)) setStayPickerOpen(false);
		};
		document.addEventListener('pointerdown', onPointerDown);
		return () => document.removeEventListener('pointerdown', onPointerDown);
	}, [stayPickerOpen]);

	const checkAvailabilityForDates = useCallback(
		async (from: Date, to: Date) => {
			if (!propertyRef) return;
			setCheckingAvailability(true);
			setAvailabilityMsg(null);
			try {
				const check_in = toDateParam(from);
				const check_out = toDateParam(to);
				const data = await checkAvailabilityMutation.mutateAsync({
					property_id: propertyRef,
					check_in,
					check_out,
					guests: guestCount,
				});

				const available = Boolean(data.isAvailable);
				const total = typeof data.totalPrice === 'number' ? data.totalPrice : null;
				setAvailableForCheckout(available);
				setTotalPrice(total);
				setAvailabilityMsg(
					available
						? `Available${total !== null ? ` · Total $${total}` : ''}`
						: 'Not available for selected dates.',
				);
				return { available, total };
			} catch {
				setAvailableForCheckout(false);
				setTotalPrice(null);
				setAvailabilityMsg('Could not check availability.');
			} finally {
				setCheckingAvailability(false);
			}
		},
		[propertyRef, guestCount, checkAvailabilityMutation],
	);

	const handleReserveClick = async () => {
		if (!stayRange?.from || !stayRange?.to) return;
		const result = await checkAvailabilityForDates(stayRange.from, stayRange.to);
		if (!result?.available) return;

		const qs = new URLSearchParams({
			property_id: propertyRef,
			check_in: toDateParam(stayRange.from),
			check_out: toDateParam(stayRange.to),
			guests: String(guestCount),
			total_price: String(result.total ?? 0),
		});
		router.push(`/guest-details?${qs.toString()}`);
	};

	return (
		<div
			className={cn(
				notoSerif.variable,
				manrope.variable,
				'text-[#1b1c1a] antialiased',
				'bg-[#fbf9f6] font-[family-name:var(--preview-arch-body)] selection:bg-[#ffdbcf] selection:text-[#793015]',
			)}
		>
			<header className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-[#dbc1b9]/30 bg-[#fbf9f6]/90 px-4 py-4 backdrop-blur-xl sm:px-8 sm:py-5">
				<div className="flex min-w-0 items-center gap-3">
					{listingPreview ? null : <Menu className="h-5 w-5 shrink-0 text-[#944528]" strokeWidth={1.5} />}
					<span className="truncate font-[family-name:var(--preview-arch-headline)] text-base uppercase tracking-[0.2em] text-[#1b1c1a] sm:text-lg">
						{data.wordmark}
					</span>
				</div>
				{data.nav.length > 0 ? (
					<nav className="hidden gap-8 md:flex">
						{data.nav.map((item) => (
							<span
								key={item.label}
								className={cn(
									'text-[10px] uppercase tracking-widest',
									item.current ? 'font-bold text-[#944528]' : 'text-[#1b1c1a]/60',
								)}
							>
								{item.label}
							</span>
						))}
					</nav>
				) : (
					<span className="hidden md:block" />
				)}
				{listingPreview ? (
					<span className="w-10 shrink-0 sm:w-16" aria-hidden />
				) : (
					<div className="flex items-center gap-4 text-[#1b1c1a]/60">
						<Search className="h-5 w-5" strokeWidth={1.5} />
						<CircleUser className="h-5 w-5" strokeWidth={1.5} />
					</div>
				)}
			</header>

			<main>
				<section className="relative mb-16 w-full overflow-hidden px-4 sm:mb-24 sm:px-8">
					<div className="relative h-[220px] w-full sm:h-[300px] lg:h-[360px]">
						{data.hero.imageSrc.trim() ? (
							<Image
								src={data.hero.imageSrc}
								alt=""
								fill
								className="object-cover grayscale-[20%]"
								sizes="(max-width: 1024px) 100vw, 1024px"
								unoptimized
							/>
						) : (
							<div className="absolute inset-0 bg-[#e4e2df]" aria-hidden />
						)}
						<div
							className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(27,28,26,0.45)]"
							aria-hidden
						/>
						<div className="absolute bottom-6 left-4 max-w-3xl sm:bottom-10 sm:left-8">
							{data.hero.series ? (
								<p className="mb-2 font-[family-name:var(--preview-arch-body)] text-[10px] uppercase tracking-[0.35em] text-white/85 sm:text-xs">
									{data.hero.series}
								</p>
							) : null}
							<h1 className="font-[family-name:var(--preview-arch-headline)] text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
								{data.hero.title}
							</h1>
							{data.hero.location ? (
								<div className="mt-4 flex items-center gap-2 text-white/90">
									<MapPin className="h-5 w-5 shrink-0" strokeWidth={1.5} />
									<span className="font-[family-name:var(--preview-arch-headline)] text-lg italic sm:text-2xl">
										{data.hero.location}
									</span>
								</div>
							) : null}
						</div>
					</div>
				</section>

				<div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-4 pb-16 lg:grid-cols-12 lg:gap-16 lg:px-12">
					<div className="space-y-16 lg:col-span-7 lg:space-y-24">
						<section>
							{data.concept.eyebrow ? (
								<span className="mb-2 block font-[family-name:var(--preview-arch-body)] text-[10px] uppercase tracking-widest text-[#944528]">
									{data.concept.eyebrow}
								</span>
							) : null}
							{showAboutLong ? (
								<p
									className={cn(
										'max-w-2xl font-[family-name:var(--preview-arch-headline)] text-2xl font-semibold leading-tight text-[#1b1c1a] sm:text-3xl lg:text-4xl',
										!data.concept.eyebrow && 'mt-4',
										aboutShort ? 'mb-6' : '',
									)}
								>
									{aboutLong}
								</p>
							) : null}
							{aboutShort ? (
								<p
									className={cn(
										'mb-6 max-w-2xl',
										showAboutLong
											? 'text-base leading-relaxed text-[#55433d] sm:text-lg'
											: 'font-[family-name:var(--preview-arch-headline)] text-2xl font-semibold leading-tight text-[#1b1c1a] sm:text-3xl lg:text-4xl',
										!showAboutLong && (data.concept.eyebrow ? 'mt-2' : 'mt-4'),
									)}
								>
									{data.concept.title}
								</p>
							) : null}
						</section>

						<section className="space-y-12">
							{data.gallery.large.src.trim() ||
							data.gallery.stack[0].src.trim() ||
							data.gallery.stack[1].src.trim() ? (
								<div className="grid grid-cols-12 items-end gap-4">
									{data.gallery.large.src.trim() ? (
										<button type="button" onClick={() => openGallery(data.gallery.large.src.trim())} className="col-span-12 cursor-pointer text-left sm:col-span-8">
											<FillImg
												src={data.gallery.large.src}
												className="aspect-[4/5] w-full rounded-sm"
												sizes="(max-width: 640px) 100vw, 60vw"
											/>
											{data.gallery.large.caption ? (
												<p className="mt-3 font-[family-name:var(--preview-arch-body)] text-[10px] uppercase tracking-widest text-[#1b1c1a]/40">
													{data.gallery.large.caption}
												</p>
											) : null}
										</button>
									) : null}
									{data.gallery.stack[0].src.trim() || data.gallery.stack[1].src.trim() ? (
										<div className="col-span-12 grid gap-4 sm:col-span-4 sm:translate-y-6">
											{data.gallery.stack[0].src.trim() ? (
												<button type="button" onClick={() => openGallery(data.gallery.stack[0].src.trim())} className="cursor-pointer">
													<FillImg
														src={data.gallery.stack[0].src}
														className="aspect-square w-full rounded-sm"
														sizes="200px"
													/>
												</button>
											) : null}
											{data.gallery.stack[1].src.trim() ? (
												<button type="button" onClick={() => openGallery(data.gallery.stack[1].src.trim())} className="cursor-pointer">
													<FillImg
														src={data.gallery.stack[1].src}
														className="aspect-[3/4] w-full rounded-sm"
														sizes="200px"
													/>
												</button>
											) : null}
										</div>
									) : null}
								</div>
							) : null}

							{data.gallery.full.src.trim() ? (
								<div className="relative h-[220px] w-full overflow-hidden rounded-sm sm:h-[280px] lg:h-[320px]">
									<Image
										src={data.gallery.full.src}
										alt=""
										fill
										className="object-cover"
										sizes="100vw"
										unoptimized
									/>
									{data.gallery.full.pullQuote.title || data.gallery.full.pullQuote.text ? (
										<div className="absolute bottom-4 right-4 hidden max-w-xs bg-white/95 p-5 shadow-sm sm:block">
											{data.gallery.full.pullQuote.title ? (
												<h3 className="mb-2 font-[family-name:var(--preview-arch-headline)] text-xl italic text-[#1b1c1a]">
													{data.gallery.full.pullQuote.title}
												</h3>
											) : null}
											{data.gallery.full.pullQuote.text ? (
												<p className="text-sm leading-relaxed text-[#55433d]">{data.gallery.full.pullQuote.text}</p>
											) : null}
										</div>
									) : null}
								</div>
							) : null}
						</section>

						{data.amenities.length > 0 ? (
							<section>
								<span className="mb-8 block font-[family-name:var(--preview-arch-body)] text-[10px] uppercase tracking-widest text-[#944528]">
									{listingPreview ? '— Amenities' : '— Curated Amenities'}
								</span>
								<div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
									{data.amenities.map((a) => (
										<div key={a.label} className="flex flex-col gap-3">
											<AmenityGlyph id={a.id} className="text-[#944528]" />
											<h4 className="font-[family-name:var(--preview-arch-headline)] text-[10px] font-bold uppercase tracking-widest">
												{a.label}
											</h4>
										</div>
									))}
								</div>
							</section>
						) : null}

						<section className="pb-8">
							<span className="mb-8 block font-[family-name:var(--preview-arch-body)] text-[10px] uppercase tracking-widest text-[#944528]">
								{data.location.eyebrow}
							</span>
							{listingPreview && (data.location.mapCenter || data.location.mapEmbedSrc) ? (
								<div className="relative aspect-video w-full overflow-hidden rounded-sm bg-[#efeeeb] grayscale contrast-125">
									<BrandingPreviewMap
										title="Property location"
										center={data.location.mapCenter}
										embedSrc={data.location.mapEmbedSrc}
										className="absolute inset-0 h-full w-full border-0"
									/>
								</div>
							) : (
								<div className="relative aspect-video w-full overflow-hidden rounded-sm bg-[#efeeeb] grayscale contrast-125">
									<div className="absolute inset-0 z-10 flex items-center justify-center">
										{data.location.coords ? (
											<div className="text-center">
												<MapPin className="mx-auto mb-2 h-12 w-12 text-[#944528]" strokeWidth={1.25} />
												<p className="font-[family-name:var(--preview-arch-headline)] text-lg italic text-[#1b1c1a]">
													{data.location.coords}
												</p>
											</div>
										) : listingPreview ? null : (
											<div className="text-center">
												<MapPin className="mx-auto mb-2 h-12 w-12 text-[#944528]" strokeWidth={1.25} />
												<p className="font-[family-name:var(--preview-arch-headline)] text-lg italic text-[#1b1c1a]">
													—
												</p>
											</div>
										)}
									</div>
									{data.location.mapImage.trim() ? (
										<Image
											src={data.location.mapImage}
											alt=""
											fill
											className="object-cover opacity-40"
											sizes="100vw"
											unoptimized
										/>
									) : null}
								</div>
							)}
							<div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
								{data.location.columns.map((col) => (
									<div key={col.title}>
										<h5 className="mb-2 font-[family-name:var(--preview-arch-headline)] text-base font-semibold">
											{col.title}
										</h5>
										<p className="text-sm leading-relaxed text-[#55433d]">{col.text}</p>
									</div>
								))}
							</div>
						</section>
						{data.host.name.trim() ? (
							<section className="border-t border-[#dbc1b9]/15 pt-8">
								<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#944528]">Meet our host</p>
								<div className="mt-4 flex items-start gap-4">
									{data.host.imageSrc.trim() ? (
										<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full grayscale">
											<Image src={data.host.imageSrc} alt="" fill className="object-cover" sizes="64px" unoptimized />
										</div>
									) : null}
									<div className="min-w-0">
										<p className="font-[family-name:var(--preview-arch-headline)] text-xl font-semibold text-[#1b1c1a]">
											{data.host.name}
										</p>
										<p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#944528]">{hostRating}</p>
										<p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#1b1c1a]/70">{hostBio}</p>
									</div>
								</div>
							</section>
						) : null}
					</div>

					<div className="lg:col-span-5">
						<div className="lg:sticky lg:top-24">
							<div className="border border-[#dbc1b9]/30 bg-white p-6 shadow-[0_20px_50px_rgba(27,28,26,0.06)] sm:p-8 lg:p-10">
								{listingPreview ? (
									<>
										<p className="text-[10px] font-medium uppercase leading-snug tracking-[0.2em] text-[#1A1A1A]">
											{checkingAvailability ? (
												'Checking...'
											) : stayRange?.from && stayRange?.to && availabilityMsg ? (
												availableForCheckout && totalPrice !== null ? (
													<>
														Total{' '}
														<span className="text-[14px] font-semibold tracking-normal">${totalPrice}</span>
													</>
												) : (
													availabilityMsg
												)
											) : (
												'Pick your stay dates - pricing appears here.'
											)}
										</p>
										<div
											ref={stayPickerRef}
											className="relative mt-5 min-w-0 border-t border-[#dbc1b9]/40 pt-6 [--rdp-accent-color:#944528] [--rdp-accent-background-color:rgba(148,69,40,0.12)]"
										>
											<div className="grid grid-cols-2 gap-2">
												<div>
													<p className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">Check in</p>
													<button
														type="button"
														onClick={() => setStayPickerOpen(true)}
														aria-expanded={stayPickerOpen}
														aria-haspopup="dialog"
														className="mt-1 w-full rounded-lg border border-black/10 bg-white px-2.5 py-3 text-left text-xs font-medium tabular-nums text-[#1A1A1A] outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-[#944528]/30"
													>
														{stayRange?.from ? formatStay(stayRange.from) : 'Add date'}
													</button>
												</div>
												<div>
													<p className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">Check out</p>
													<button
														type="button"
														onClick={() => setStayPickerOpen(true)}
														aria-expanded={stayPickerOpen}
														aria-haspopup="dialog"
														className="mt-1 w-full rounded-lg border border-black/10 bg-white px-2.5 py-3 text-left text-xs font-medium tabular-nums text-[#1A1A1A] outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-[#944528]/30"
													>
														{stayRange?.to ? formatStay(stayRange.to) : 'Add date'}
													</button>
												</div>
											</div>
											{stayPickerOpen ? (
												<div
													role="dialog"
													aria-label="Select stay dates"
													className="absolute inset-x-0 top-full z-20 mt-2 w-full min-w-0 max-w-full rounded-xl border border-black/10 bg-white p-2 shadow-xl"
												>
													<DayPicker
														mode="range"
														min={1}
														selected={stayRange}
														onSelect={(range) => {
															setStayRange(range);
															if (range?.from && range?.to) void checkAvailabilityForDates(range.from, range.to);
														}}
														disabled={dayDisabled}
														numberOfMonths={1}
														className="mx-auto w-full min-w-0 max-w-full justify-center [--rdp-day-height:2rem] [--rdp-day-width:2rem] [--rdp-day_button-height:1.875rem] [--rdp-day_button-width:1.875rem] [&_.rdp-month]:w-full [&_.rdp-month_caption]:text-sm [&_.rdp-month_grid]:w-full [&_.rdp-nav]:h-8 [&_.rdp-weekday]:p-0 [&_.rdp-weekday]:text-[10px] [&_.rdp-day]:text-[12px]"
													/>
													<div className="flex justify-end gap-2">
														<button type="button" onClick={() => setStayPickerOpen(false)} className="mt-2 w-fit rounded-lg border border-black/10 bg-white px-2.5 py-2 text-left text-xs font-medium tabular-nums text-[#1A1A1A] outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-[#944528]/30">Apply</button>
														<button type="button" onClick={() => setStayRange(undefined)} className="mt-2 w-fit rounded-lg border border-black/10 bg-white px-2.5 py-2 text-left text-xs font-medium tabular-nums text-[#1A1A1A] outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-[#944528]/30">Clear</button>
													</div>
												</div>
											) : null}
										</div>
										<div className="mt-5">
											<label htmlFor={guestFieldId} className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">
												Guests
											</label>
											<Input
												id={guestFieldId}
												type="number"
												inputMode="numeric"
												min={1}
												max={guestCap}
												step={1}
												value={guestCount}
												onChange={(e) => {
													const v = parseInt(e.target.value, 10);
													if (Number.isNaN(v)) return;
													setGuestCount(Math.min(guestCap, Math.max(1, v)));
												}}
												className="mt-1.5"
												variant="compact"
											/>
											<p className="mt-1 text-[10px] text-[#1A1A1A]/45">Up to {guestCap} guests</p>
										</div>
										<button
											type="button"
											onClick={() => void handleReserveClick()}
											disabled={!propertyRef || !stayRange?.from || !stayRange?.to || checkingAvailability}
											className="mt-8 w-full rounded-sm bg-[#944528] py-4 font-[family-name:var(--preview-arch-body)] text-[11px] uppercase tracking-widest text-white transition hover:bg-[#b35c3d] disabled:cursor-not-allowed disabled:opacity-60"
										>
											{checkingAvailability ? 'Checking...' : 'Reserve'}
										</button>
									</>
								) : (
									<>
										<p className="text-[10px] font-medium uppercase leading-snug tracking-[0.2em] text-[#1A1A1A]">
											{checkingAvailability ? (
												'Checking...'
											) : stayRange?.from && stayRange?.to && availabilityMsg ? (
												availableForCheckout && totalPrice !== null ? (
													<>
														Available · Total{' '}
														<span className="text-[14px] font-semibold tracking-normal">${totalPrice}</span>
													</>
												) : (
													availabilityMsg
												)
											) : (
												'Pick your stay dates - pricing appears here.'
											)}
										</p>
										<div
											ref={stayPickerRef}
											className="relative mt-5 min-w-0 border-t border-[#dbc1b9]/40 pt-6 [--rdp-accent-color:#944528] [--rdp-accent-background-color:rgba(148,69,40,0.12)]"
										>
											<div className="grid grid-cols-2 gap-2">
												<div>
													<p className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">Check in</p>
													<button
														type="button"
														onClick={() => setStayPickerOpen(true)}
														aria-expanded={stayPickerOpen}
														aria-haspopup="dialog"
														className="mt-1 w-full rounded-lg border border-black/10 bg-white px-2.5 py-3 text-left text-xs font-medium tabular-nums text-[#1A1A1A] outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-[#944528]/30"
													>
														{stayRange?.from ? formatStay(stayRange.from) : 'Add date'}
													</button>
												</div>
												<div>
													<p className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">Check out</p>
													<button
														type="button"
														onClick={() => setStayPickerOpen(true)}
														aria-expanded={stayPickerOpen}
														aria-haspopup="dialog"
														className="mt-1 w-full rounded-lg border border-black/10 bg-white px-2.5 py-3 text-left text-xs font-medium tabular-nums text-[#1A1A1A] outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-[#944528]/30"
													>
														{stayRange?.to ? formatStay(stayRange.to) : 'Add date'}
													</button>
												</div>
											</div>
											{stayPickerOpen ? (
												<div
													role="dialog"
													aria-label="Select stay dates"
													className="absolute inset-x-0 top-full z-20 mt-2 w-full min-w-0 max-w-full rounded-xl border border-black/10 bg-white p-2 shadow-xl"
												>
													<DayPicker
														mode="range"
														min={1}
														selected={stayRange}
														onSelect={(range) => {
															setStayRange(range);
															if (range?.from && range?.to) void checkAvailabilityForDates(range.from, range.to);
														}}
														disabled={dayDisabled}
														numberOfMonths={1}
														className="mx-auto w-full min-w-0 max-w-full justify-center [--rdp-day-height:2rem] [--rdp-day-width:2rem] [--rdp-day_button-height:1.875rem] [--rdp-day_button-width:1.875rem] [&_.rdp-month]:w-full [&_.rdp-month_caption]:text-sm [&_.rdp-month_grid]:w-full [&_.rdp-nav]:h-8 [&_.rdp-weekday]:p-0 [&_.rdp-weekday]:text-[10px] [&_.rdp-day]:text-[12px]"
													/>
													<div className="flex justify-end gap-2">
														<button type="button" onClick={() => setStayPickerOpen(false)} className="mt-2 w-fit rounded-lg border border-black/10 bg-white px-2.5 py-2 text-left text-xs font-medium tabular-nums text-[#1A1A1A] outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-[#944528]/30">Apply</button>
														<button type="button" onClick={() => setStayRange(undefined)} className="mt-2 w-fit rounded-lg border border-black/10 bg-white px-2.5 py-2 text-left text-xs font-medium tabular-nums text-[#1A1A1A] outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-[#944528]/30">Clear</button>
													</div>
												</div>
											) : null}
										</div>
										<div className="mt-5">
											<label htmlFor={guestFieldId} className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">
												Guests
											</label>
											<Input
												id={guestFieldId}
												type="number"
												inputMode="numeric"
												min={1}
												max={guestCap}
												step={1}
												value={guestCount}
												onChange={(e) => {
													const v = parseInt(e.target.value, 10);
													if (Number.isNaN(v)) return;
													setGuestCount(Math.min(guestCap, Math.max(1, v)));
												}}
												className="mt-1.5"
												variant="compact"
											/>
											<p className="mt-1 text-[10px] text-[#1A1A1A]/45">Up to {guestCap} guests</p>
										</div>
										<button
											type="button"
											onClick={() => void handleReserveClick()}
											disabled={!propertyRef || !stayRange?.from || !stayRange?.to || checkingAvailability}
											className="mt-8 w-full rounded-sm bg-[#944528] py-4 font-[family-name:var(--preview-arch-body)] text-[11px] uppercase tracking-widest text-white transition hover:bg-[#b35c3d] disabled:cursor-not-allowed disabled:opacity-60"
										>
											{checkingAvailability ? 'Checking...' : 'Reserve'}
										</button>
									</>
								)}
							</div>

							{data.host.imageSrc.trim() || data.host.name.trim() ? (
								<div className="mt-6 flex items-center gap-4 border-t border-[#dbc1b9]/15 p-4">
									{data.host.imageSrc.trim() ? (
										<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full grayscale">
											<Image
												src={data.host.imageSrc}
												alt=""
												fill
												className="object-cover"
												sizes="48px"
												unoptimized
											/>
										</div>
									) : null}
									<div className="min-w-0 flex-1">
										{data.host.label ? (
											<p className="text-[9px] uppercase tracking-widest text-[#1b1c1a]/50">{data.host.label}</p>
										) : null}
										<p className="font-[family-name:var(--preview-arch-headline)] text-sm font-semibold">
											{data.host.name}
										</p>
									</div>
									{data.host.inquire ? (
										<button
											type="button"
											className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-[#944528]"
										>
											{data.host.inquire}
										</button>
									) : null}
								</div>
							) : null}
						</div>
					</div>
				</div>
			</main>

			<footer className="mt-12 border-t border-[#dbc1b9]/15 bg-[#fbf9f6] px-6 py-12 sm:px-10">
				<div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
					<div>
						<span className="text-sm font-bold text-[#1b1c1a]">{data.footer.wordmark}</span>
						{data.footer.tagline ? (
							<span className="ml-2 font-[family-name:var(--preview-arch-body)] text-[10px] uppercase tracking-[0.12em] text-[#1b1c1a]/40">
								{data.footer.tagline}
							</span>
						) : null}
					</div>
					{data.footer.links.length > 0 ? (
						<div className="flex flex-wrap gap-8">
							{data.footer.links.map((l) => (
								<span key={l.label} className="text-[10px] uppercase tracking-[0.12em] text-[#1b1c1a]/45">
									{l.label}
								</span>
							))}
						</div>
					) : (
						<span className="hidden md:block" />
					)}
					<p className="font-[family-name:var(--preview-arch-body)] text-[10px] uppercase tracking-[0.12em] text-[#1b1c1a]/35 md:mt-0">
						{data.footer.copyright}
					</p>
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
