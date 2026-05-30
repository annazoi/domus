'use client';

import Image from 'next/image';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { ChevronDown, Droplets, MapPin, Menu, Star } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DayPicker, type DateRange } from 'react-day-picker';
import { BrandingPreviewMap } from '@/components/google-maps';
import { cn, Input } from '@/components/ui';
import { ApiRoutes } from '@/config/api/routes';
import { useCheckAvailability } from '@/features/bookings/hooks/use-check-availability';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph, FillImg } from './branding-preview-shared';
import { PhotoGalleryLightbox } from './photo-gallery-carousel';

const cormorant = Cormorant_Garamond({
	subsets: ['latin'],
	variable: '--preview-mizu-headline',
	weight: ['400', '500', '600'],
	display: 'swap',
});

const dmSans = DM_Sans({
	subsets: ['latin'],
	variable: '--preview-mizu-body',
	weight: ['400', '500', '600', '700'],
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

function MizuBookingPanel({
	data,
	listingPreview,
	propertyRef,
	guestCap,
	hostRating,
}: {
	data: BrandingPreviewDemo;
	listingPreview?: boolean;
	propertyRef: string;
	guestCap: number;
	hostRating: string;
}) {
	const guestFieldId = useId();
	const stayPickerRef = useRef<HTMLDivElement>(null);
	const [stayRange, setStayRange] = useState<DateRange | undefined>();
	const [stayPickerOpen, setStayPickerOpen] = useState(false);
	const [guestCount, setGuestCount] = useState(1);
	const [checkingAvailability, setCheckingAvailability] = useState(false);
	const [availabilityMsg, setAvailabilityMsg] = useState<string | null>(null);
	const [availableForCheckout, setAvailableForCheckout] = useState(false);
	const [totalPrice, setTotalPrice] = useState<number | null>(null);
	const [allowedDateKeys, setAllowedDateKeys] = useState<Set<string>>(new Set());
	const todayStart = useMemo(() => startOfToday(), []);
	const checkAvailabilityMutation = useCheckAvailability();
	const router = useRouter();

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
				const result = await checkAvailabilityMutation.mutateAsync({
					property_id: propertyRef,
					check_in: toDateParam(from),
					check_out: toDateParam(to),
					guests: guestCount,
				});
				const available = Boolean(result.isAvailable);
				const total = typeof result.totalPrice === 'number' ? result.totalPrice : null;
				setAvailableForCheckout(available);
				setTotalPrice(total);
				setAvailabilityMsg(
					available
						? `Available${total !== null ? ` · $${total} total` : ''}`
						: 'Not available for these dates.',
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

	const priceLine = checkingAvailability
		? 'Checking availability…'
		: stayRange?.from && stayRange?.to && availabilityMsg
			? availabilityMsg
			: data.booking.price.trim()
				? `${data.booking.price} ${data.booking.per}`
				: 'Choose dates to see your total';
	const calendarMonth = stayRange?.from ?? stayRange?.to ?? new Date();

	return (
		<div className="rounded-[1.75rem] border border-[#6b9a8f]/25 bg-[#fff9f4] shadow-[0_24px_60px_-28px_rgba(26,46,53,0.35)]">
			<div className="border-b border-[#6b9a8f]/15 bg-gradient-to-br from-[#6b9a8f]/12 to-transparent px-6 py-5">
				<div className="flex items-center gap-2 text-[#4d7c6f]">
					<Droplets className="h-4 w-4" strokeWidth={1.5} aria-hidden />
					<p className="font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.22em]">
						{data.booking.eyebrow}
					</p>
				</div>
				<p className="mt-3 font-[family-name:var(--preview-mizu-headline)] text-3xl text-[#1a2e35]">
					{data.booking.price.trim() ? (
						<>
							{data.booking.price}
							<span className="ml-1 text-base font-normal text-[#1a2e35]/50">{data.booking.per}</span>
						</>
					) : (
						priceLine
					)}
				</p>
				{data.booking.rating.trim() ? (
					<p className="mt-2 flex items-center gap-1.5 font-[family-name:var(--preview-mizu-body)] text-sm text-[#1a2e35]/65">
						<Star className="h-4 w-4 fill-[#c4785a] text-[#c4785a]" aria-hidden />
						{data.booking.rating} · {hostRating}
					</p>
				) : null}
			</div>

			<div className="overflow-visible p-6">
				<p className="font-[family-name:var(--preview-mizu-body)] text-sm leading-snug text-[#1a2e35]/70">{priceLine}</p>

				<div ref={stayPickerRef} className="relative z-20 mt-5">
					<div className="grid grid-cols-2 gap-3">
						<div className="rounded-2xl bg-[#f3ebe3]/80 p-3">
							<p className="font-[family-name:var(--preview-mizu-body)] text-[9px] font-semibold uppercase tracking-wider text-[#1a2e35]/45">
								Arrive
							</p>
							<button
								type="button"
								onClick={() => setStayPickerOpen(true)}
								className="cursor-pointer mt-1 w-full text-left font-[family-name:var(--preview-mizu-body)] text-sm font-medium text-[#1a2e35]"
							>
								{stayRange?.from ? formatStay(stayRange.from) : data.booking.arrival || 'Select'}
							</button>
						</div>
						<div className="rounded-2xl bg-[#f3ebe3]/80 p-3">
							<p className="font-[family-name:var(--preview-mizu-body)] text-[9px] font-semibold uppercase tracking-wider text-[#1a2e35]/45">
								Depart
							</p>
							<button
								type="button"
								onClick={() => setStayPickerOpen(true)}
								className="cursor-pointer mt-1 w-full text-left font-[family-name:var(--preview-mizu-body)] text-sm font-medium text-[#1a2e35]"
							>
								{stayRange?.to ? formatStay(stayRange.to) : data.booking.departure || 'Select'}
							</button>
						</div>
					</div>
					{stayPickerOpen ? (
						<div
							role="dialog"
							aria-label="Select stay dates"
							className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-[#6b9a8f]/20 bg-white p-4 shadow-[0_20px_50px_-16px_rgba(26,46,53,0.35)]"
						>
							<DayPicker
								mode="range"
								min={1}
								defaultMonth={calendarMonth}
								selected={stayRange}
								onSelect={(range) => {
									setStayRange(range);
									if (range?.from && range?.to) void checkAvailabilityForDates(range.from, range.to);
								}}
								disabled={listingPreview ? dayDisabled : undefined}
								numberOfMonths={1}
								className={cn(
									'w-full font-[family-name:var(--preview-mizu-body)]',
									'[--rdp-accent-color:#4d7c6f]',
									'[--rdp-accent-background-color:rgba(77,124,111,0.14)]',
									'[--rdp-day-height:2.35rem]',
									'[--rdp-day-width:2.35rem]',
									'[--rdp-day_button-height:2.1rem]',
									'[--rdp-day_button-width:2.1rem]',
									'[--rdp-day_button-border-radius:0.5rem]',
									'[--rdp-nav_button-height:2rem]',
									'[--rdp-nav_button-width:2rem]',
									'[--rdp-today-color:#1a2e35]',
									'[--rdp-outside-opacity:0.35]',
									'[--rdp-disabled-opacity:0.35]',
									'[&_.rdp-month]:w-full',
									'[&_.rdp-month_grid]:w-full',
									'[&_.rdp-month_caption]:mb-2',
									'[&_.rdp-caption_label]:text-sm [&_.rdp-caption_label]:font-semibold [&_.rdp-caption_label]:text-[#1a2e35]',
									'[&_.rdp-weekday]:text-[10px] [&_.rdp-weekday]:font-medium [&_.rdp-weekday]:uppercase [&_.rdp-weekday]:tracking-[0.18em] [&_.rdp-weekday]:text-[#1a2e35]/45',
									'[&_.rdp-button_previous]:rounded-lg [&_.rdp-button_next]:rounded-lg',
									'[&_.rdp-button_previous]:border [&_.rdp-button_next]:border',
									'[&_.rdp-button_previous]:border-[#6b9a8f]/25 [&_.rdp-button_next]:border-[#6b9a8f]/25',
									'[&_.rdp-day_button]:text-sm [&_.rdp-day_button]:font-medium [&_.rdp-day_button]:text-[#1a2e35]',
									'[&_.rdp-day_button]:transition-colors [&_.rdp-day_button]:duration-150',
									'[&_.rdp-day_button:hover:not(:disabled)]:bg-[#f3ebe3]',
								)}
							/>
							<div className="mt-3 flex justify-end gap-2 border-t border-[#6b9a8f]/15 pt-3">
								<button
									type="button"
									onClick={() => setStayPickerOpen(false)}
									className="cursor-pointer rounded-full bg-[#4d7c6f] px-4 py-1.5 font-[family-name:var(--preview-mizu-body)] text-xs font-semibold text-white"
								>
									Done
								</button>
								<button
									type="button"
									onClick={() => setStayRange(undefined)}
									className="cursor-pointer rounded-full px-3 py-1.5 font-[family-name:var(--preview-mizu-body)] text-xs text-[#1a2e35]/50"
								>
									Clear
								</button>
							</div>
						</div>
					) : null}
				</div>

				<div className="mt-4">
					<label htmlFor={guestFieldId} className="text-[9px] font-semibold uppercase tracking-wider text-[#1a2e35]/45">
						Guests
					</label>
					<Input
						id={guestFieldId}
						type="number"
						min={1}
						max={guestCap}
						value={guestCount}
						onChange={(e) => {
							const v = parseInt(e.target.value, 10);
							if (!Number.isNaN(v)) setGuestCount(Math.min(guestCap, Math.max(1, v)));
						}}
						className="mt-1.5"
						variant="compact"
					/>
				</div>

				<button
					type="button"
					onClick={() => void handleReserveClick()}
					disabled={listingPreview && (!propertyRef || !stayRange?.from || !stayRange?.to || checkingAvailability)}
					className="cursor-pointer mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#4d7c6f] py-4 font-[family-name:var(--preview-mizu-body)] text-sm font-semibold tracking-wide text-white transition hover:bg-[#3d665b] disabled:cursor-not-allowed disabled:opacity-55"
				>
					{checkingAvailability ? 'Checking…' : data.booking.cta}
					<ChevronDown className="h-4 w-4 -rotate-90" aria-hidden />
				</button>
				{data.booking.disclaimer ? (
					<p className="mt-3 text-center font-[family-name:var(--preview-mizu-body)] text-[11px] text-[#1a2e35]/45">
						{data.booking.disclaimer}
					</p>
				) : null}
			</div>
		</div>
	);
}

export function MizuPreview({
	data,
	listingPreview,
}: {
	data: BrandingPreviewDemo;
	listingPreview?: boolean;
}) {
	const aboutLong = [data.concept.paragraphs[0], data.concept.paragraphs[1]].filter(Boolean).join(' ').trim();
	const aboutShort = data.concept.title.trim();
	const heroSrc = data.hero.imageSrc.trim() || data.gallery.large.src.trim();
	const galleryImages = useMemo(
		() =>
			[
				heroSrc,
				data.gallery.large.src.trim(),
				data.gallery.stack[0].src.trim(),
				data.gallery.stack[1].src.trim(),
				data.gallery.full.src.trim(),
			].filter(Boolean),
		[heroSrc, data.gallery],
	);
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [galleryIndex, setGalleryIndex] = useState(0);
	const propertyRef = useMemo(() => data.footer.tagline.replace(/^\//, '').trim(), [data.footer.tagline]);
	const guestCap = useMemo(() => {
		const m = data.booking.guests.match(/^(\d+)/);
		const n = m ? parseInt(m[1], 10) : data.booking.maxGuests;
		return Math.min(Math.max(1, data.booking.maxGuests), Math.max(1, n));
	}, [data.booking.guests, data.booking.maxGuests]);
	const hostRating = data.host.rating.trim() || `${data.booking.rating} guest favourite`;
	const hostBio =
		data.host.bio.trim() ||
		'A calm, design-led retreat with onsen-inspired baths, cedar decks, and views that turn copper at dusk.';

	const openGallery = (src: string) => {
		const index = galleryImages.findIndex((img) => img === src);
		setGalleryIndex(index >= 0 ? index : 0);
		setGalleryOpen(true);
	};

	return (
		<div
			className={cn(
				cormorant.variable,
				dmSans.variable,
				'bg-[#f3ebe3] font-[family-name:var(--preview-mizu-body)] text-[#1a2e35] antialiased selection:bg-[#6b9a8f]/25',
			)}
		>
			<section className="relative min-h-[min(88vh,920px)] w-full overflow-hidden">
				{heroSrc ? (
					<Image src={heroSrc} alt="" fill className="object-cover" sizes="100vw" priority unoptimized />
				) : (
					<div className="absolute inset-0 bg-[#2a4549]" aria-hidden />
				)}
				<div
					className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a2e35]/88 via-[#1a2e35]/35 to-[#1a2e35]/15"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(196,120,90,0.22),transparent)]"
					aria-hidden
				/>

				<header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-6 sm:px-10">
					<span className="font-[family-name:var(--preview-mizu-headline)] text-xl tracking-wide text-[#fff9f4] sm:text-2xl">
						{data.wordmark}
					</span>
					{data.nav.length > 0 ? (
						<nav className="hidden items-center gap-8 sm:flex">
							{data.nav.map((item) => (
								<span
									key={item.label}
									className={cn(
										'font-[family-name:var(--preview-mizu-body)] text-[11px] uppercase tracking-[0.2em]',
										item.current ? 'font-semibold text-[#f5d4c8]' : 'text-[#fff9f4]/70',
									)}
								>
									{item.label}
								</span>
							))}
						</nav>
					) : null}
					{listingPreview ? (
						<span className="w-5 sm:hidden" aria-hidden />
					) : (
						<Menu className="h-5 w-5 text-[#fff9f4]/80 sm:hidden" strokeWidth={1.5} />
					)}
				</header>

				<div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-10 sm:px-10 sm:pb-14">
					{data.hero.series ? (
						<p className="font-[family-name:var(--preview-mizu-body)] text-[11px] uppercase tracking-[0.35em] text-[#f5d4c8]/90">
							{data.hero.series}
						</p>
					) : null}
					<h1 className="mt-3 max-w-3xl font-[family-name:var(--preview-mizu-headline)] text-[clamp(2.5rem,7vw,4.75rem)] leading-[0.95] text-[#fff9f4]">
						{data.hero.title}
					</h1>
					{data.hero.location ? (
						<p className="mt-4 flex items-center gap-2 font-[family-name:var(--preview-mizu-body)] text-sm text-[#fff9f4]/80 sm:text-base">
							<MapPin className="h-4 w-4 shrink-0 text-[#c4785a]" strokeWidth={1.5} />
							{data.hero.location}
						</p>
					) : null}
					{data.booking.rating.trim() ? (
						<div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#fff9f4]/20 bg-[#fff9f4]/10 px-4 py-2 backdrop-blur-sm">
							<Star className="h-4 w-4 fill-[#c4785a] text-[#c4785a]" aria-hidden />
							<span className="font-[family-name:var(--preview-mizu-body)] text-sm text-[#fff9f4]">
								{data.booking.rating} · Guest favourite
							</span>
						</div>
					) : null}
				</div>
			</section>

			{galleryImages.length > 1 ? (
				<section className="relative -mt-6 z-10 px-5 sm:px-10">
					<div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
						{galleryImages.map((src, i) => (
							<button
								key={`${src}-${i}`}
								type="button"
								onClick={() => openGallery(src)}
								className={cn(
									'relative h-[220px] w-[min(72vw,320px)] shrink-0 snap-center overflow-hidden rounded-[1.5rem] bg-[#2a4549]/20 sm:h-[260px]',
									i === 0 && 'ring-2 ring-[#c4785a]/60 ring-offset-2 ring-offset-[#f3ebe3]',
								)}
							>
								<Image src={src} alt="" fill className="object-cover" sizes="320px" unoptimized />
							</button>
						))}
					</div>
					<p className="mt-3 font-[family-name:var(--preview-mizu-body)] text-[10px] uppercase tracking-[0.25em] text-[#1a2e35]/45">
						Scroll the gallery
					</p>
				</section>
			) : null}

			<main className="mx-auto max-w-6xl px-5 py-14 sm:px-10 sm:py-20">
				<div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:gap-12">
					<div className="min-w-0 flex-1 space-y-14">
						{(aboutLong || aboutShort) && (
							<section className="relative overflow-hidden rounded-[1.75rem] border border-[#6b9a8f]/15 bg-[#fff9f4] p-8 sm:p-10">
								<div className="absolute left-0 top-8 bottom-8 w-1 rounded-full bg-gradient-to-b from-[#c4785a] to-[#4d7c6f]" aria-hidden />
								{data.concept.eyebrow ? (
									<p className="pl-5 font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.28em] text-[#4d7c6f]">
										{data.concept.eyebrow}
									</p>
								) : null}
								{aboutShort ? (
									<h2 className="mt-4 pl-5 font-[family-name:var(--preview-mizu-headline)] text-3xl leading-tight text-[#1a2e35] sm:text-4xl">
										{aboutShort}
									</h2>
								) : null}
								{aboutLong ? (
									<p className="mt-5 max-w-2xl pl-5 font-[family-name:var(--preview-mizu-body)] text-base leading-relaxed text-[#1a2e35]/72 sm:text-lg">
										{aboutLong}
									</p>
								) : null}
							</section>
						)}

						{data.gallery.full.pullQuote.title.trim() || data.gallery.full.pullQuote.text.trim() ? (
							<blockquote className="border-l-2 border-[#c4785a]/50 py-2 pl-6">
								{data.gallery.full.pullQuote.title.trim() ? (
									<p className="font-[family-name:var(--preview-mizu-headline)] text-2xl italic text-[#1a2e35] sm:text-3xl">
										&ldquo;{data.gallery.full.pullQuote.title}&rdquo;
									</p>
								) : null}
								{data.gallery.full.pullQuote.text.trim() ? (
									<p className="mt-3 max-w-xl font-[family-name:var(--preview-mizu-body)] text-sm leading-relaxed text-[#1a2e35]/60">
										{data.gallery.full.pullQuote.text}
									</p>
								) : null}
							</blockquote>
						) : null}

						{data.amenities.length > 0 ? (
							<section>
								<p className="font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.28em] text-[#4d7c6f]">
									Amenities
								</p>
								<div className="mt-5 flex flex-wrap gap-2">
									{data.amenities.map((a) => (
										<span
											key={`${a.id}-${a.label}`}
											className="inline-flex items-center gap-2 rounded-full border border-[#6b9a8f]/20 bg-[#fff9f4] px-4 py-2.5"
										>
											<AmenityGlyph id={a.id} className="h-5 w-5 text-[#4d7c6f]" />
											<span className="font-[family-name:var(--preview-mizu-body)] text-xs font-medium text-[#1a2e35]">
												{a.label}
											</span>
										</span>
									))}
								</div>
							</section>
						) : null}

						<section>
							<p className="font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.28em] text-[#4d7c6f]">
								{data.location.eyebrow || 'Location'}
							</p>
							<div className="relative mt-5 aspect-[16/9] w-full overflow-hidden rounded-t-[2.5rem] rounded-b-2xl bg-[#2a4549]/10">
								{listingPreview && (data.location.mapCenter || data.location.mapEmbedSrc) ? (
									<BrandingPreviewMap
										title="Property location"
										center={data.location.mapCenter}
										embedSrc={data.location.mapEmbedSrc}
										className="absolute inset-0 h-full w-full border-0"
									/>
								) : data.location.mapImage.trim() ? (
									<Image
										src={data.location.mapImage}
										alt=""
										fill
										className="object-cover"
										sizes="(max-width:768px) 100vw, 62vw"
										unoptimized
									/>
								) : null}
							</div>
							<div className="mt-8 grid gap-6 sm:grid-cols-2">
								{data.location.columns.map((c) => (
									<div
										key={c.title}
										className="rounded-2xl border border-[#6b9a8f]/12 bg-[#fff9f4] p-5"
									>
										<h3 className="font-[family-name:var(--preview-mizu-headline)] text-lg text-[#1a2e35]">
											{c.title}
										</h3>
										<p className="mt-2 font-[family-name:var(--preview-mizu-body)] text-sm leading-relaxed text-[#1a2e35]/65">
											{c.text}
										</p>
									</div>
								))}
							</div>
						</section>

						{data.host.name.trim() ? (
							<section className="flex flex-col gap-6 overflow-hidden rounded-[1.75rem] bg-[#1a2e35] p-6 text-[#fff9f4] sm:flex-row sm:items-center sm:p-8">
								{data.host.imageSrc.trim() ? (
									<div className="relative mx-auto aspect-square w-full max-w-[200px] shrink-0 overflow-hidden rounded-[1.25rem] sm:mx-0 sm:max-w-[180px]">
										<Image src={data.host.imageSrc} alt="" fill className="object-cover" sizes="200px" unoptimized />
									</div>
								) : null}
								<div className="min-w-0 flex-1 text-center sm:text-left">
									{data.host.label ? (
										<p className="font-[family-name:var(--preview-mizu-body)] text-[10px] uppercase tracking-[0.25em] text-[#6b9a8f]">
											{data.host.label}
										</p>
									) : null}
									<p className="mt-2 font-[family-name:var(--preview-mizu-headline)] text-3xl">{data.host.name}</p>
									<p className="mt-2 font-[family-name:var(--preview-mizu-body)] text-sm text-[#fff9f4]/65">
										{hostRating}
									</p>
									<p className="mt-4 font-[family-name:var(--preview-mizu-body)] text-sm leading-relaxed text-[#fff9f4]/80">
										{hostBio}
									</p>
									{data.host.inquire ? (
										<button
											type="button"
											className="mt-5 rounded-full border border-[#fff9f4]/25 px-5 py-2.5 font-[family-name:var(--preview-mizu-body)] text-xs font-semibold uppercase tracking-wider text-[#fff9f4]"
										>
											{data.host.inquire}
										</button>
									) : null}
								</div>
							</section>
						) : null}
					</div>

					<aside className="w-full shrink-0 overflow-visible lg:sticky lg:top-8 lg:z-30 lg:w-[min(100%,400px)]">
						<MizuBookingPanel
							data={data}
							listingPreview={listingPreview}
							propertyRef={propertyRef}
							guestCap={guestCap}
							hostRating={hostRating}
						/>
					</aside>
				</div>
			</main>

			{data.gallery.large.src.trim() ? (
				<section className="mx-auto max-w-6xl px-5 pb-16 sm:px-10">
					<button
						type="button"
						onClick={() => openGallery(data.gallery.large.src.trim())}
						className="group relative block w-full overflow-hidden rounded-[2rem]"
					>
						<FillImg
							src={data.gallery.large.src}
							className="aspect-[21/9] w-full"
							sizes="(max-width: 1024px) 100vw, 1152px"
							imgClassName="transition duration-700 group-hover:scale-[1.03]"
						/>
						{data.gallery.large.caption ? (
							<p className="absolute bottom-4 left-5 font-[family-name:var(--preview-mizu-body)] text-[10px] uppercase tracking-[0.2em] text-white/85">
								{data.gallery.large.caption}
							</p>
						) : null}
					</button>
				</section>
			) : null}

			<footer className="border-t border-[#6b9a8f]/15 bg-[#1a2e35] px-5 py-12 text-[#fff9f4] sm:px-10">
				<div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="font-[family-name:var(--preview-mizu-headline)] text-2xl">{data.footer.wordmark}</p>
						{data.footer.tagline ? (
							<p className="mt-1 font-[family-name:var(--preview-mizu-body)] text-sm text-[#fff9f4]/55">
								{data.footer.tagline}
							</p>
						) : null}
					</div>
					{data.footer.links.length > 0 ? (
						<div className="flex flex-wrap gap-6 font-[family-name:var(--preview-mizu-body)] text-[11px] uppercase tracking-[0.18em] text-[#fff9f4]/55">
							{data.footer.links.map((l) => (
								<span key={l.label}>{l.label}</span>
							))}
						</div>
					) : null}
					<p className="font-[family-name:var(--preview-mizu-body)] text-xs text-[#fff9f4]/40">{data.footer.copyright}</p>
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
