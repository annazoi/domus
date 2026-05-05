'use client';

import Image from 'next/image';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { MapPin, Menu, Star } from 'lucide-react';
import { Input } from '@/components/ui';
import { ApiRoutes } from '@/config/api/routes';
import { BrandingPreviewMap } from '@/components/google-maps';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph } from './branding-preview-shared';
import { DayPicker, type DateRange } from 'react-day-picker';

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

export function CanvasPreview({
	data,
	listingPreview,
}: {
	data: BrandingPreviewDemo;
	listingPreview?: boolean;
}) {
	const aboutLong = [data.concept.paragraphs[0], data.concept.paragraphs[1]].filter(Boolean).join(' ').trim();
	const aboutShort = data.concept.title.trim();

	const leftHero = data.hero.imageSrc.trim() || data.gallery.large.src.trim();
	const rightTop = data.hero.imageSrc.trim() ? data.gallery.large.src.trim() : data.gallery.stack[0].src.trim();
	const rightBot = data.hero.imageSrc.trim()
		? data.gallery.stack[0].src.trim() || data.gallery.stack[1].src.trim()
		: data.gallery.stack[1].src.trim() || data.gallery.stack[0].src.trim();
	const hasGallery = Boolean(leftHero || rightTop || rightBot);
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
	const [allowedDateKeys, setAllowedDateKeys] = useState<Set<string>>(new Set());
	const checkAvailabilityAbortRef = useRef<AbortController | null>(null);
	const todayStart = useMemo(() => startOfToday(), []);
	const propertyRef = useMemo(() => data.footer.tagline.replace(/^\//, '').trim(), [data.footer.tagline]);

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
			checkAvailabilityAbortRef.current?.abort();
			const ac = new AbortController();
			checkAvailabilityAbortRef.current = ac;
			setCheckingAvailability(true);
			setAvailabilityMsg(null);
			try {
				const check_in = toDateParam(from);
				const check_out = toDateParam(to);
				const res = await fetch(
					`/api${ApiRoutes.properties.checkAvailability(propertyRef, check_in, check_out, guestCount)}`,
					{ signal: ac.signal },
				);
				const data = (await res.json()) as { isAvailable?: boolean; totalPrice?: number | null; message?: string };
				if (!res.ok) {
					setAvailabilityMsg(data.message ?? 'Could not check availability.');
					return;
				}
				setAvailabilityMsg(
					data.isAvailable
						? `Available${typeof data.totalPrice === 'number' ? ` · Total $${data.totalPrice}` : ''}`
						: 'Not available for selected dates.',
				);
			} catch (e) {
				if (e instanceof DOMException && e.name === 'AbortError') return;
				setAvailabilityMsg('Could not check availability.');
			} finally {
				if (checkAvailabilityAbortRef.current === ac) setCheckingAvailability(false);
			}
		},
		[propertyRef, guestCount],
	);

	const handleCheckAvailability = () => {
		if (!stayRange?.from || !stayRange?.to) return;
		void checkAvailabilityForDates(stayRange.from, stayRange.to);
	};

	return (
		<div className="bg-[#F4F2EE] text-[#1A1A1A] antialiased selection:bg-[#5c6149]/12">
			<header className="sticky top-0 z-30 border-b border-black/[0.05] bg-[#F4F2EE]/95 px-4 py-3 backdrop-blur-md sm:px-8">
				<div className="mx-auto flex max-w-6xl items-center justify-between">
					<span className="truncate font-[family-name:var(--font-serif)] text-lg tracking-tight">{data.wordmark}</span>
					{data.nav.length > 0 ? (
						<nav className="hidden gap-8 text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/50 sm:flex">
							{data.nav.map((item) => (
								<span key={item.label} className={item.current ? 'font-semibold text-[#5c6149]' : ''}>
									{item.label}
								</span>
							))}
						</nav>
					) : (
						<span className="hidden sm:block" />
					)}
					{listingPreview ? <span className="w-5 sm:hidden" aria-hidden /> : <Menu className="h-5 w-5 text-[#1A1A1A]/35 sm:hidden" />}
				</div>
			</header>

			<main>
				<div className="mx-auto max-w-6xl px-4 pt-6 sm:px-8 sm:pt-8">
					{hasGallery ? (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:gap-4">
							{leftHero ? (
								<div className="relative aspect-[4/5] min-h-[220px] overflow-hidden rounded-2xl bg-[#e0ded9] sm:col-span-7 sm:min-h-[280px] lg:min-h-[360px]">
									<Image src={leftHero} alt="" fill className="object-cover" sizes="(max-width:640px)100vw,58vw" unoptimized />
								</div>
							) : (
								<div className="hidden sm:col-span-7 sm:block" aria-hidden />
							)}
							<div className="grid grid-cols-2 gap-3 sm:col-span-5 sm:grid-cols-1 sm:grid-rows-2 sm:gap-4">
								{rightTop ? (
									<div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-[#e0ded9] sm:min-h-0 sm:flex-1">
										<Image src={rightTop} alt="" fill className="object-cover" sizes="40vw" unoptimized />
									</div>
								) : null}
								{rightBot && rightBot !== rightTop ? (
									<div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-[#e0ded9] sm:min-h-0 sm:flex-1">
										<Image src={rightBot} alt="" fill className="object-cover" sizes="40vw" unoptimized />
									</div>
								) : null}
							</div>
						</div>
					) : null}
				</div>

				<div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-8 sm:pt-12">
					<div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
						<div className="min-w-0 flex-1 space-y-14 lg:max-w-[62%]">
							<section>
								<span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]/45">About</span>
								<h1 className="mt-3 font-[family-name:var(--font-serif)] text-3xl leading-tight tracking-tight sm:text-4xl lg:text-[2.5rem]">
									{data.hero.title}
								</h1>
								{data.hero.location ? (
									<p className="mt-3 flex items-center gap-2 text-sm text-[#1A1A1A]/50">
										<MapPin className="h-4 w-4 shrink-0 text-[#5c6149]" />
										{data.hero.location}
									</p>
								) : null}
								{aboutLong ? (
									<p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[#1A1A1A]/70">{aboutLong}</p>
								) : null}
								{aboutShort ? (
									<p className="mt-4 max-w-xl text-sm leading-relaxed text-[#1A1A1A]/55">{aboutShort}</p>
								) : null}
							</section>

							{data.amenities.length > 0 ? (
								<section>
									<span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]/45">Amenities</span>
									<div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
										{data.amenities.map((a) => (
											<div key={`${a.id}-${a.label}`} className="flex flex-col items-center gap-3 text-center">
												<AmenityGlyph id={a.id} className="text-[#1A1A1A]/70" />
												<span className="text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]">
													{a.label}
												</span>
											</div>
										))}
									</div>
								</section>
							) : null}

							<section>
								<span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]/45">Location</span>
								<div className="relative mt-6 aspect-[21/10] w-full overflow-hidden rounded-2xl">
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
											className="object-cover opacity-90"
											sizes="(max-width:768px)100vw,62vw"
											unoptimized
										/>
									) : null}
								</div>
								<div className="mt-8 grid gap-8 sm:grid-cols-2">
									{data.location.columns.map((c) => (
										<div key={c.title}>
											<h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A]/55">
												{c.title}
											</h3>
											<p className="mt-2 text-sm leading-relaxed text-[#1A1A1A]/75">{c.text}</p>
										</div>
									))}
								</div>
							</section>

							{data.gallery.full.src.trim() && !listingPreview ? (
								<div className="relative aspect-[21/9] overflow-hidden rounded-2xl">
									<Image src={data.gallery.full.src} alt="" fill className="object-cover" sizes="100vw" unoptimized />
									{(data.gallery.full.pullQuote.title || data.gallery.full.pullQuote.text) && (
										<div className="absolute bottom-4 left-4 max-w-sm rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-sm">
											{data.gallery.full.pullQuote.title ? (
												<p className="font-[family-name:var(--font-serif)] text-lg">{data.gallery.full.pullQuote.title}</p>
											) : null}
											{data.gallery.full.pullQuote.text ? (
												<p className="mt-1 text-xs text-[#1A1A1A]/60">{data.gallery.full.pullQuote.text}</p>
											) : null}
										</div>
									)}
								</div>
							) : null}
						</div>

						<aside className="w-full min-w-0 shrink-0 lg:sticky lg:top-24 lg:mt-[-2.5rem] lg:w-[min(100%,440px)]">
							<div className="min-w-0 overflow-x-clip rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-7">
								{listingPreview ? (
									<>
										<p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]/45">
											{/* {data.booking.eyebrow} */}
										</p>
										{/* <p className="mt-4 min-h-[1.35rem] text-sm font-medium leading-snug text-[#1A1A1A]"> */}
										<p className="text-[10px] font-medium uppercase leading-snug tracking-[0.2em] text-[#1A1A1A]">
											{checkingAvailability
												? 'Checking...'
												: stayRange?.from && stayRange?.to && availabilityMsg
													? availabilityMsg
													: 'Pick your stay dates - pricing appears here.'}
										</p>
										<div
											ref={stayPickerRef}
											className="relative mt-5 min-w-0 border-t border-black/[0.06] pt-6 [--rdp-accent-color:#5c6149] [--rdp-accent-background-color:rgba(92,97,73,0.12)]"
										>
											<div className="grid grid-cols-2 gap-2">
												<div>
													<p className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">
														Check in
													</p>
													<button
														type="button"
														onClick={() => setStayPickerOpen(true)}
														aria-expanded={stayPickerOpen}
														aria-haspopup="dialog"
														className="mt-1 w-full rounded-lg border border-black/10 bg-white px-2.5 py-3 text-left text-xs font-medium tabular-nums text-[#1A1A1A] outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-[#5c6149]/30"
													>
														{stayRange?.from ? formatStay(stayRange.from) : 'Add date'}
													</button>
												</div>
												<div>
													<p className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">
														Check out
													</p>
													<button
														type="button"
														onClick={() => setStayPickerOpen(true)}
														aria-expanded={stayPickerOpen}
														aria-haspopup="dialog"
														className="mt-1 w-full rounded-lg border border-black/10 bg-white px-2.5 py-3 text-left text-xs font-medium tabular-nums text-[#1A1A1A] outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-[#5c6149]/30"
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
														<button type="button" onClick={() => setStayPickerOpen(false)} className="mt-2 w-fit rounded-lg border border-black/10 bg-white px-2.5 py-2 text-left text-xs font-medium tabular-nums text-[#1A1A1A] outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-[#5c6149]/30">Apply</button>
														<button type="button" onClick={() => setStayRange(undefined)} className="mt-2 w-fit rounded-lg border border-black/10 bg-white px-2.5 py-2 text-left text-xs font-medium tabular-nums text-[#1A1A1A] outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-[#5c6149]/30">Clear</button>
													</div>
												</div>
											) : null}
										</div>
										<div className="mt-5">
											<label
												htmlFor={guestFieldId}
												className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40"
											>
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

										{/* <p className="mt-5 border-t border-black/[0.06] pt-5 text-sm text-[#1A1A1A]/75">{data.booking.guests}</p> */}
										{data.booking.price.trim() ? (
											<p className="mt-4 font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A]">
												{data.booking.price}{' '}
												<span className="text-sm font-normal text-[#1A1A1A]/45">{data.booking.per}</span>
											</p>
										) : null}
										<button
											type="button"
											onClick={handleCheckAvailability}
											disabled={!propertyRef || !stayRange?.from || !stayRange?.to || checkingAvailability}
											className="mt-6 w-full cursor-pointer rounded-xl bg-[#5c6149] py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#4d523e] disabled:cursor-not-allowed disabled:opacity-60"
										>
											{checkingAvailability ? 'Checking...' : 'RESERVE'}
										</button>
									</>
								) : (
									<>
										<div className="flex flex-wrap items-end justify-between gap-4">
											<div>
												<p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/45">{data.booking.eyebrow}</p>
												<p className="mt-1 font-[family-name:var(--font-serif)] text-3xl">
													{data.booking.price}{' '}
													<span className="text-sm font-normal text-[#1A1A1A]/45">{data.booking.per}</span>
												</p>
											</div>
											<div className="flex items-center gap-1 text-sm">
												<Star className="h-4 w-4 fill-[#5c6149] text-[#5c6149]" />
												<span className="font-semibold">{data.booking.rating}</span>
											</div>
										</div>
										<div className="mt-6 space-y-3 border-t border-black/[0.06] pt-6 text-sm text-[#1A1A1A]/70">
											<div className="flex justify-between">
												<span>{data.booking.lines[0].label}</span>
												<span>{data.booking.lines[0].value}</span>
											</div>
											<div className="flex justify-between">
												<span>{data.booking.lines[1].label}</span>
												<span>{data.booking.lines[1].value}</span>
											</div>
											<div className="flex justify-between border-t border-black/[0.06] pt-3 font-semibold text-[#1A1A1A]">
												<span>{data.booking.totalLabel}</span>
												<span>{data.booking.total}</span>
											</div>
										</div>
										<button
											type="button"
											className="mt-6 w-full rounded-xl bg-[#5c6149] py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#4d523e]"
										>
											{data.booking.cta}
										</button>
										<p className="mt-3 text-center text-[10px] text-[#1A1A1A]/40">{data.booking.disclaimer}</p>
										<div className="mt-6 flex items-center gap-3 border-t border-black/[0.06] pt-6">
											{data.host.imageSrc.trim() ? (
												<div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#eee]">
													<Image src={data.host.imageSrc} alt="" fill className="object-cover" sizes="44px" unoptimized />
												</div>
											) : null}
											<div className="min-w-0">
												<p className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40">{data.host.label}</p>
												<p className="truncate text-sm font-medium">{data.host.name}</p>
											</div>
											<button
												type="button"
												className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[#5c6149]"
											>
												{data.host.inquire}
											</button>
										</div>
									</>
								)}
							</div>
						</aside>
					</div>
				</div>
			</main>

			<footer className="border-t border-black/[0.06] px-4 py-10 sm:px-8">
				<div className="mx-auto flex max-w-6xl flex-col gap-4 text-[10px] uppercase tracking-[0.15em] text-[#1A1A1A]/40 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<span className="font-[family-name:var(--font-serif)] text-sm font-semibold tracking-normal text-[#1A1A1A]">
							{data.footer.wordmark}
						</span>
						{data.footer.tagline ? <span className="ml-2">{data.footer.tagline}</span> : null}
					</div>
					{data.footer.links.length > 0 ? (
						<div className="flex flex-wrap gap-6">
							{data.footer.links.map((l) => (
								<span key={l.label}>{l.label}</span>
							))}
						</div>
					) : null}
					<p>{data.footer.copyright}</p>
				</div>
			</footer>
		</div>
	);
}
