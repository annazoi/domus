'use client';

import Image from 'next/image';
import { Syne, Lora } from 'next/font/google';
import { ArrowRight, MapPin, Menu, Plus, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { BrandingPreviewMap } from '@/components/google-maps';
import { cn, Input } from '@/components/ui';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph, BrandingWordmark, FillImg } from './branding-preview-shared';
import { PhotoGalleryLightbox } from './photo-gallery-carousel';
import { formatStay, useBrandingStayBooking } from './use-branding-stay-booking';

const syne = Syne({
	subsets: ['latin'],
	variable: '--preview-hikari-display',
	weight: ['400', '500', '600', '700', '800'],
	display: 'swap',
});

const lora = Lora({
	subsets: ['latin'],
	variable: '--preview-hikari-body',
	weight: ['400', '500', '600'],
	display: 'swap',
});

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

			<div ref={booking.stayPickerRef} className="relative mt-6 [--rdp-accent-color:#0a0a0a] [--rdp-accent-background-color:rgba(10,10,10,0.08)]">
				<div className="grid grid-cols-2 gap-px bg-[#0a0a0a]/10">
					<button
						type="button"
						onClick={() => booking.setStayPickerOpen(true)}
						className="bg-[#fcfcfa] p-4 text-left"
					>
						<p className="font-[family-name:var(--preview-hikari-body)] text-[9px] uppercase tracking-[0.2em] text-[#0a0a0a]/40">In</p>
						<p className="cursor-pointer mt-1 font-[family-name:var(--preview-hikari-display)] text-sm font-semibold">
							{booking.stayRange?.from ? formatStay(booking.stayRange.from) : data.booking.arrival || '—'}
						</p>
					</button>
					<button
						type="button"
						onClick={() => booking.setStayPickerOpen(true)}
						className="bg-[#fcfcfa] p-4 text-left"
					>
						<p className="font-[family-name:var(--preview-hikari-body)] text-[9px] uppercase tracking-[0.2em] text-[#0a0a0a]/40">Out</p>
						<p className="cursor-pointer mt-1 font-[family-name:var(--preview-hikari-display)] text-sm font-semibold">
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
				disabled={listingPreview && (!propertyRef || !booking.stayRange?.from || !booking.stayRange?.to || booking.checkingAvailability)}
				className="cursor-pointer group mt-8 flex w-full items-center justify-between bg-[#0a0a0a] px-5 py-4 font-[family-name:var(--preview-hikari-display)] text-sm font-semibold uppercase tracking-[0.2em] text-[#fcfcfa] transition hover:bg-[#d4a853] hover:text-[#0a0a0a] disabled:opacity-50"
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
	const propertyRef = useMemo(
		() => (listingPreview ? (data.propertyRef ?? '').trim() : ''),
		[listingPreview, data.propertyRef],
	);
	const guestCap = useMemo(() => {
		const m = data.booking.guests.match(/^(\d+)/);
		const n = m ? parseInt(m[1], 10) : data.booking.maxGuests;
		return Math.min(Math.max(1, data.booking.maxGuests), Math.max(1, n));
	}, [data.booking.guests, data.booking.maxGuests]);
	const hostBio = data.host.bio.trim() || 'Thoughtful hosting with an eye for light, space, and the quiet details.';

	const openGallery = (src: string) => {
		const index = galleryImages.findIndex((img) => img === src);
		setGalleryIndex(index >= 0 ? index : 0);
		setGalleryOpen(true);
	};

	return (
		<div
			className={cn(
				syne.variable,
				lora.variable,
				'min-h-screen bg-[#fcfcfa] font-[family-name:var(--preview-hikari-body)] text-[#0a0a0a] antialiased selection:bg-[#d4a853]/30',
			)}
		>
			<div className="pointer-events-none fixed inset-0 z-0 opacity-[0.35]" aria-hidden>
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a06_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a06_1px,transparent_1px)] bg-[size:48px_48px]" />
			</div>

			<header className="relative z-20 border-b border-[#0a0a0a]/8">
				<div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 sm:px-10">
					<BrandingWordmark
						wordmark={data.wordmark}
						logoSrc={data.logoSrc}
						logoAlt={data.logoAlt}
						className="font-[family-name:var(--preview-hikari-display)] text-sm font-bold uppercase tracking-[0.35em]"
					/>
					{data.nav.length > 0 ? (
						<nav className="hidden items-center gap-10 sm:flex">
							{data.nav.map((item) => (
								<span
									key={item.label}
									className={cn(
										'font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.25em]',
										item.current ? 'font-semibold text-[#0a0a0a]' : 'text-[#0a0a0a]/40',
									)}
								>
									{item.label}
								</span>
							))}
						</nav>
					) : null}
					{listingPreview ? <span className="w-5 sm:hidden" aria-hidden /> : <Menu className="h-5 w-5 sm:hidden" strokeWidth={1.25} />}
				</div>
			</header>

			<main className="relative z-10">
				<section className="mx-auto grid max-w-[1400px] lg:grid-cols-[minmax(0,42%)_1fr] lg:min-h-[calc(100vh-73px)]">
					<div className="flex flex-col justify-between px-5 py-12 sm:px-10 lg:py-16 lg:pr-8">
						<div>
							{data.hero.series ? (
								<p className="font-[family-name:var(--preview-hikari-body)] text-[11px] uppercase tracking-[0.4em] text-[#d4a853]">
									{data.hero.series}
								</p>
							) : null}
							<h1 className="mt-6 font-[family-name:var(--preview-hikari-display)] text-[clamp(2.75rem,8vw,5.5rem)] font-extrabold leading-[0.92] tracking-[-0.04em]">
								{data.hero.title}
							</h1>
							<div className="mt-8 flex items-center gap-3">
								<div className="h-px w-10 shrink-0 bg-[#d4a853]" aria-hidden />
								{data.hero.location ? (
									<p className="flex items-center gap-2 font-[family-name:var(--preview-hikari-body)] text-sm text-[#0a0a0a]/55">
										<MapPin className="h-4 w-4 text-[#0a0a0a]" strokeWidth={1.25} />
										{data.hero.location}
									</p>
								) : null}
							</div>
						</div>
						{(aboutShort || aboutLong) && (
							<div className="mt-12 max-w-md border-l-2 border-[#d4a853] pl-6 lg:mt-0">
								{data.concept.eyebrow ? (
									<p className="font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.3em] text-[#0a0a0a]/40">
										{data.concept.eyebrow}
									</p>
								) : null}
								{aboutShort ? (
									<p className="mt-3 font-[family-name:var(--preview-hikari-body)] text-lg leading-relaxed text-[#0a0a0a]/75">
										{aboutShort}
									</p>
								) : null}
							</div>
						)}
					</div>

					<div className="relative min-h-[50vh] lg:min-h-0">
						{heroSrc ? (
							<button type="button" onClick={() => openGallery(heroSrc)} className="relative block h-full min-h-[50vh] w-full lg:min-h-full">
								<Image src={heroSrc} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 58vw" priority unoptimized />
								<div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#fcfcfa]/20 lg:to-[#fcfcfa]/40" aria-hidden />
							</button>
						) : null}
						{galleryImages.length > 2 ? (
							<div className="absolute bottom-6 right-6 hidden gap-2 lg:flex">
								{galleryImages.slice(1, 4).map((src, i) => (
									<button
										key={`${src}-${i}`}
										type="button"
										onClick={() => openGallery(src)}
										className="relative h-20 w-16 overflow-hidden border-2 border-[#fcfcfa] shadow-lg"
									>
										<Image src={src} alt="" fill className="object-cover" sizes="64px" unoptimized />
									</button>
								))}
							</div>
						) : null}
					</div>
				</section>

				<section className="border-t border-[#0a0a0a]/8 bg-white">
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

							{data.gallery.full.pullQuote.title.trim() ? (
								<blockquote className="max-w-xl">
									<p className="font-[family-name:var(--preview-hikari-display)] text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
										{data.gallery.full.pullQuote.title}
									</p>
									{data.gallery.full.pullQuote.text.trim() ? (
										<p className="mt-4 font-[family-name:var(--preview-hikari-body)] text-sm text-[#0a0a0a]/50">
											{data.gallery.full.pullQuote.text}
										</p>
									) : null}
								</blockquote>
							) : null}

							{data.amenities.length > 0 ? (
								<div>
									<p className="mb-8 font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.35em] text-[#0a0a0a]/40">
										Amenities
									</p>
									<ul className="divide-y divide-[#0a0a0a]/8">
										{data.amenities.map((a) => (
											<li key={`${a.id}-${a.label}`} className="flex items-center gap-5 py-5">
												<AmenityGlyph id={a.id} className="h-6 w-6 shrink-0 text-[#0a0a0a]/70" />
												<span className="font-[family-name:var(--preview-hikari-display)] text-sm font-semibold uppercase tracking-wider">
													{a.label}
												</span>
												<Plus className="ml-auto h-4 w-4 text-[#d4a853]/80" aria-hidden />
											</li>
										))}
									</ul>
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
								<div className="flex flex-col gap-6 border border-[#0a0a0a]/10 p-8 sm:flex-row sm:items-center">
									{data.host.imageSrc.trim() ? (
										<div className="relative h-24 w-24 shrink-0 overflow-hidden bg-[#0a0a0a]/5">
											<Image src={data.host.imageSrc} alt="" fill className="object-cover grayscale" sizes="96px" unoptimized />
										</div>
									) : null}
									<div>
										{data.host.label ? (
											<p className="font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.25em] text-[#0a0a0a]/40">
												{data.host.label}
											</p>
										) : null}
										<p className="mt-2 font-[family-name:var(--preview-hikari-display)] text-2xl font-bold">{data.host.name}</p>
										<p className="mt-1 font-[family-name:var(--preview-hikari-body)] text-xs text-[#d4a853]">{data.host.rating}</p>
										<p className="mt-3 max-w-lg font-[family-name:var(--preview-hikari-body)] text-sm leading-relaxed text-[#0a0a0a]/65">
											{hostBio}
										</p>
									</div>
								</div>
							) : null}
						</div>

						<aside className="lg:sticky lg:top-8 lg:self-start">
							<HikariBookingPanel
								data={data}
								listingPreview={listingPreview}
								propertyRef={propertyRef}
								guestCap={guestCap}
							/>
						</aside>
					</div>
				</section>

				{data.gallery.large.src.trim() ? (
					<section className="border-t border-[#0a0a0a]/8">
						<button
							type="button"
							onClick={() => openGallery(data.gallery.large.src.trim())}
							className="group relative block w-full"
						>
							<FillImg
								src={data.gallery.large.src}
								className="aspect-[21/8] w-full"
								sizes="100vw"
								imgClassName="transition duration-1000 group-hover:scale-[1.02] grayscale group-hover:grayscale-0"
							/>
							{data.gallery.large.caption ? (
								<p className="absolute bottom-6 left-6 font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.3em] text-white">
									{data.gallery.large.caption}
								</p>
							) : null}
						</button>
					</section>
				) : null}
			</main>

			<footer className="relative z-10 border-t border-[#0a0a0a] bg-[#0a0a0a] px-5 py-8 text-[#fcfcfa] sm:px-10">
				<div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<p className="font-[family-name:var(--preview-hikari-display)] text-sm font-bold uppercase tracking-[0.3em]">
						{data.footer.wordmark}
					</p>
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
