'use client';

import Image from 'next/image';
import { Fraunces, IBM_Plex_Sans } from 'next/font/google';
import { MapPin, Menu, Star, Wind } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { BrandingPreviewMap } from '@/components/google-maps';
import { cn, Input } from '@/components/ui';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph, FillImg } from './branding-preview-shared';
import { PhotoGalleryLightbox } from './photo-gallery-carousel';
import { formatStay, useBrandingStayBooking } from './use-branding-stay-booking';

const fraunces = Fraunces({
	subsets: ['latin'],
	variable: '--preview-kaze-headline',
	weight: ['400', '500', '600', '700'],
	display: 'swap',
});

const ibmPlex = IBM_Plex_Sans({
	subsets: ['latin'],
	variable: '--preview-kaze-body',
	weight: ['300', '400', '500', '600'],
	display: 'swap',
});

function KazeBookingPanel({
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
		? 'Checking availability…'
		: booking.stayRange?.from && booking.stayRange?.to && booking.availabilityMsg
			? booking.availabilityMsg
			: data.booking.price.trim()
				? `${data.booking.price} ${data.booking.per}`
				: 'Select your dates';

	return (
		<div className="bg-[#f7f4ef] p-8 border border-[#b54a32] shadow-[8px_8px_0_#b54a32]">
			<div className="flex items-center gap-2 text-[#b54a32]">
				<Wind className="h-4 w-4" strokeWidth={1.5} aria-hidden />
				<p className="font-[family-name:var(--preview-kaze-body)] text-[10px] font-semibold uppercase tracking-[0.28em]">
					{data.booking.eyebrow}
				</p>
			</div>
			{data.booking.price.trim() ? (
				<p className="mt-4 font-[family-name:var(--preview-kaze-headline)] text-4xl italic text-[#121110]">
					{data.booking.price}
					<span className="not-italic font-[family-name:var(--preview-kaze-body)] text-sm text-[#121110]/45">
						{' '}
						{data.booking.per}
					</span>
				</p>
			) : null}
			{data.booking.rating.trim() ? (
				<p className="mt-2 flex items-center gap-1.5 font-[family-name:var(--preview-kaze-body)] text-sm text-[#121110]/65">
					<Star className="h-4 w-4 fill-[#b54a32] text-[#b54a32]" aria-hidden />
					{data.booking.rating}
				</p>
			) : null}

			<p className="mt-6 border-t border-[#121110]/10 pt-5 font-[family-name:var(--preview-kaze-body)] text-sm text-[#121110]/60">
				{priceHint}
			</p>

			<div ref={booking.stayPickerRef} className="relative mt-6 [--rdp-accent-color:#b54a32] [--rdp-accent-background-color:rgba(181,74,50,0.12)]">
				<div className="space-y-3">
					<button
						type="button"
						onClick={() => booking.setStayPickerOpen(true)}
						className="flex w-full items-center justify-between border-b-2 border-[#121110] py-3 text-left"
					>
						<span className="font-[family-name:var(--preview-kaze-body)] text-[10px] uppercase tracking-widest text-[#121110]/45">
							Arrival
						</span>
						<span className="font-[family-name:var(--preview-kaze-headline)] text-lg text-[#121110]">
							{booking.stayRange?.from ? formatStay(booking.stayRange.from) : data.booking.arrival || 'Add date'}
						</span>
					</button>
					<button
						type="button"
						onClick={() => booking.setStayPickerOpen(true)}
						className="flex w-full items-center justify-between border-b-2 border-[#121110] py-3 text-left"
					>
						<span className="font-[family-name:var(--preview-kaze-body)] text-[10px] uppercase tracking-widest text-[#121110]/45">
							Departure
						</span>
						<span className="font-[family-name:var(--preview-kaze-headline)] text-lg text-[#121110]">
							{booking.stayRange?.to ? formatStay(booking.stayRange.to) : data.booking.departure || 'Add date'}
						</span>
					</button>
				</div>
				{booking.stayPickerOpen ? (
					<div
						role="dialog"
						aria-label="Select stay dates"
						className="absolute inset-x-0 top-full z-30 mt-2 border-2 border-[#121110] bg-white p-3 shadow-xl"
					>
						<DayPicker
							mode="range"
							min={1}
							selected={booking.stayRange}
							onSelect={(range) => {
								booking.setStayRange(range);
								if (range?.from && range?.to) void booking.checkAvailabilityForDates(range.from, range.to);
							}}
							disabled={listingPreview ? booking.dayDisabled : undefined}
							numberOfMonths={1}
						/>
						<button
							type="button"
							onClick={() => booking.setStayPickerOpen(false)}
							className="mt-2 w-full bg-[#121110] py-2 font-[family-name:var(--preview-kaze-body)] text-xs font-semibold uppercase tracking-widest text-[#f7f4ef]"
						>
							Confirm
						</button>
					</div>
				) : null}
			</div>

			<div className="mt-6">
				<label htmlFor={booking.guestFieldId} className="font-[family-name:var(--preview-kaze-body)] text-[10px] uppercase tracking-widest text-[#121110]/45">
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
					className="mt-2 rounded-none border-2 border-[#121110]/15"
					variant="compact"
				/>
			</div>

			<button
				type="button"
				onClick={() => void booking.handleReserveClick()}
				disabled={listingPreview && (!propertyRef || !booking.stayRange?.from || !booking.stayRange?.to || booking.checkingAvailability)}
				className="mt-8 w-full border-2 border-[#121110] bg-[#b54a32] py-4 font-[family-name:var(--preview-kaze-body)] text-sm font-semibold uppercase tracking-[0.2em] text-[#f7f4ef] transition hover:bg-[#121110] disabled:opacity-50"
			>
				{booking.checkingAvailability ? 'Checking…' : data.booking.cta}
			</button>
			{data.booking.disclaimer ? (
				<p className="mt-3 text-center font-[family-name:var(--preview-kaze-body)] text-[11px] text-[#121110]/40">
					{data.booking.disclaimer}
				</p>
			) : null}
		</div>
	);
}

export function ArchitecturaPreview({
	data,
	listingPreview,
}: {
	data: BrandingPreviewDemo;
	listingPreview?: boolean;
}) {
	const aboutLong = [data.concept.paragraphs[0], data.concept.paragraphs[1]].filter(Boolean).join(' ').trim();
	const aboutShort = data.concept.title.trim();
	const galleryImages = useMemo(
		() =>
			[
				data.hero.imageSrc.trim(),
				data.gallery.large.src.trim(),
				data.gallery.stack[0].src.trim(),
				data.gallery.stack[1].src.trim(),
				data.gallery.full.src.trim(),
			].filter(Boolean),
		[data.hero.imageSrc, data.gallery],
	);
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [galleryIndex, setGalleryIndex] = useState(0);
	const propertyRef = useMemo(() => data.footer.tagline.replace(/^\//, '').trim(), [data.footer.tagline]);
	const guestCap = useMemo(() => {
		const m = data.booking.guests.match(/^(\d+)/);
		const n = m ? parseInt(m[1], 10) : data.booking.maxGuests;
		return Math.min(Math.max(1, data.booking.maxGuests), Math.max(1, n));
	}, [data.booking.guests, data.booking.maxGuests]);
	const hostBio =
		data.host.bio.trim() ||
		'Editorial hospitality with mountain air, slow mornings, and a concierge eye for the exceptional.';

	const openGallery = (src: string) => {
		const index = galleryImages.findIndex((img) => img === src);
		setGalleryIndex(index >= 0 ? index : 0);
		setGalleryOpen(true);
	};

	return (
		<div
			className={cn(
				fraunces.variable,
				ibmPlex.variable,
				'bg-[#121110] font-[family-name:var(--preview-kaze-body)] text-[#f7f4ef] antialiased selection:bg-[#b54a32]/40',
			)}
		>
			<div
				className="pointer-events-none fixed inset-0 opacity-[0.07]"
				style={{
					backgroundImage:
						'repeating-linear-gradient(-12deg, transparent, transparent 40px, #f7f4ef 40px, #f7f4ef 41px)',
				}}
				aria-hidden
			/>

			<header className="relative z-20 border-b border-[#f7f4ef]/10">
				<div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-12">
					<span className="font-[family-name:var(--preview-kaze-headline)] text-xl italic tracking-tight sm:text-2xl">
						{data.wordmark}
					</span>
					{data.nav.length > 0 ? (
						<nav className="hidden gap-10 md:flex">
							{data.nav.map((item) => (
								<span
									key={item.label}
									className={cn(
										'font-[family-name:var(--preview-kaze-body)] text-[10px] uppercase tracking-[0.25em]',
										item.current ? 'font-semibold text-[#b54a32]' : 'text-[#f7f4ef]/50',
									)}
								>
									{item.label}
								</span>
							))}
						</nav>
					) : null}
					{listingPreview ? <span className="w-5 md:hidden" aria-hidden /> : <Menu className="h-5 w-5 md:hidden" strokeWidth={1.5} />}
				</div>
			</header>

			<section className="relative overflow-hidden">
				<div className="mx-auto grid max-w-[1440px] lg:grid-cols-12">
					<div className="relative z-10 flex flex-col justify-end px-5 pb-12 pt-16 sm:px-12 lg:col-span-5 lg:min-h-[75vh] lg:pb-20 lg:pt-24">
						{data.hero.series ? (
							<p className="font-[family-name:var(--preview-kaze-body)] text-[11px] uppercase tracking-[0.4em] text-[#b54a32]">
								{data.hero.series}
							</p>
						) : null}
						<h1 className="mt-4 font-[family-name:var(--preview-kaze-headline)] text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">
							{data.hero.title}
						</h1>
						{data.hero.location ? (
							<p className="mt-6 flex items-center gap-2 font-[family-name:var(--preview-kaze-body)] text-sm text-[#f7f4ef]/65">
								<MapPin className="h-4 w-4 text-[#b54a32]" strokeWidth={1.5} />
								{data.hero.location}
							</p>
						) : null}
						{aboutShort ? (
							<p className="mt-8 max-w-sm font-[family-name:var(--preview-kaze-body)] text-base leading-relaxed text-[#f7f4ef]/55">
								{aboutShort}
							</p>
						) : null}
					</div>
					<div className="relative min-h-[45vh] lg:col-span-7 lg:min-h-[75vh]">
						{data.hero.imageSrc.trim() ? (
							<button
								type="button"
								onClick={() => openGallery(data.hero.imageSrc.trim())}
								className="relative block h-full min-h-[45vh] w-full lg:min-h-[75vh]"
								style={{ clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)' }}
							>
								<Image
									src={data.hero.imageSrc}
									alt=""
									fill
									className="object-cover"
									sizes="(max-width:1024px) 100vw, 60vw"
									priority
									unoptimized
								/>
								<div className="absolute inset-0 bg-gradient-to-r from-[#121110] via-transparent to-transparent" aria-hidden />
							</button>
						) : (
							<div className="min-h-[45vh] bg-[#1e1d1b] lg:min-h-[75vh]" aria-hidden />
						)}
					</div>
				</div>
			</section>

			<section className="relative z-10 bg-[#f7f4ef] text-[#121110]">
				<div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-12 sm:py-24">
					<div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
						<div className="space-y-20 lg:col-span-7">
							{aboutLong ? (
								<div>
									{data.concept.eyebrow ? (
										<p className="font-[family-name:var(--preview-kaze-body)] text-[10px] font-semibold uppercase tracking-[0.35em] text-[#b54a32]">
											{data.concept.eyebrow}
										</p>
									) : null}
									<p className="mt-6 font-[family-name:var(--preview-kaze-headline)] text-3xl leading-snug sm:text-4xl lg:text-[2.75rem]">
										{aboutLong}
									</p>
								</div>
							) : null}

							<div className="grid gap-4 sm:grid-cols-12 sm:items-end">
								{data.gallery.large.src.trim() ? (
									<button
										type="button"
										onClick={() => openGallery(data.gallery.large.src.trim())}
										className="sm:col-span-8"
									>
										<FillImg
											src={data.gallery.large.src}
											className="aspect-[4/5] w-full"
											sizes="(max-width:640px) 100vw, 50vw"
											imgClassName="grayscale-[30%] contrast-110"
										/>
										{data.gallery.large.caption ? (
											<p className="mt-3 font-[family-name:var(--preview-kaze-body)] text-[10px] uppercase tracking-widest text-[#121110]/40">
												{data.gallery.large.caption}
											</p>
										) : null}
									</button>
								) : null}
								<div className="grid gap-4 sm:col-span-4 sm:translate-y-8">
									{data.gallery.stack[0].src.trim() ? (
										<button type="button" onClick={() => openGallery(data.gallery.stack[0].src.trim())}>
											<FillImg src={data.gallery.stack[0].src} className="aspect-square w-full" sizes="200px" />
										</button>
									) : null}
									{data.gallery.stack[1].src.trim() ? (
										<button type="button" onClick={() => openGallery(data.gallery.stack[1].src.trim())}>
											<FillImg src={data.gallery.stack[1].src} className="aspect-[3/4] w-full" sizes="200px" />
										</button>
									) : null}
								</div>
							</div>

							{data.gallery.full.pullQuote.title.trim() || data.gallery.full.pullQuote.text.trim() ? (
								<div className="border-l-4 border-[#b54a32] py-2 pl-8">
									{data.gallery.full.pullQuote.title.trim() ? (
										<p className="font-[family-name:var(--preview-kaze-headline)] text-2xl italic leading-snug sm:text-3xl">
											{data.gallery.full.pullQuote.title}
										</p>
									) : null}
									{data.gallery.full.pullQuote.text.trim() ? (
										<p className="mt-4 max-w-lg font-[family-name:var(--preview-kaze-body)] text-sm leading-relaxed text-[#121110]/55">
											{data.gallery.full.pullQuote.text}
										</p>
									) : null}
								</div>
							) : null}

							{data.amenities.length > 0 ? (
								<div>
									<p className="font-[family-name:var(--preview-kaze-body)] text-[10px] font-semibold uppercase tracking-[0.35em] text-[#b54a32]">
										Curated amenities
									</p>
									<ol className="mt-8 space-y-0">
										{data.amenities.map((a, i) => (
											<li
												key={`${a.id}-${a.label}`}
												className="flex items-center gap-6 border-t border-[#121110]/10 py-6"
											>
												<span className="font-[family-name:var(--preview-kaze-headline)] text-3xl italic text-[#121110]/15">
													{String(i + 1).padStart(2, '0')}
												</span>
												<AmenityGlyph id={a.id} className="h-7 w-7 shrink-0 text-[#b54a32]" />
												<span className="font-[family-name:var(--preview-kaze-body)] text-sm font-medium uppercase tracking-wider">
													{a.label}
												</span>
											</li>
										))}
									</ol>
								</div>
							) : null}

							<div>
								<p className="font-[family-name:var(--preview-kaze-body)] text-[10px] font-semibold uppercase tracking-[0.35em] text-[#b54a32]">
									{data.location.eyebrow}
								</p>
								<div className="relative mt-6 aspect-video w-full overflow-hidden bg-[#121110]/5">
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
								<div className="mt-8 grid gap-8 sm:grid-cols-2">
									{data.location.columns.map((col) => (
										<div key={col.title}>
											<h3 className="font-[family-name:var(--preview-kaze-headline)] text-xl font-semibold">{col.title}</h3>
											<p className="mt-2 font-[family-name:var(--preview-kaze-body)] text-sm leading-relaxed text-[#121110]/65">
												{col.text}
											</p>
										</div>
									))}
								</div>
							</div>

							{data.host.name.trim() ? (
								<div className="grid gap-6 bg-[#121110] p-8 text-[#f7f4ef] sm:grid-cols-[140px_1fr] sm:items-center">
									{data.host.imageSrc.trim() ? (
										<div className="relative mx-auto aspect-square w-full max-w-[140px] overflow-hidden sm:mx-0">
											<Image src={data.host.imageSrc} alt="" fill className="object-cover" sizes="140px" unoptimized />
										</div>
									) : null}
									<div>
										{data.host.label ? (
											<p className="font-[family-name:var(--preview-kaze-body)] text-[10px] uppercase tracking-[0.3em] text-[#b54a32]">
												{data.host.label}
											</p>
										) : null}
										<p className="mt-2 font-[family-name:var(--preview-kaze-headline)] text-2xl italic">{data.host.name}</p>
										<p className="mt-1 font-[family-name:var(--preview-kaze-body)] text-xs text-[#f7f4ef]/55">{data.host.rating}</p>
										<p className="mt-4 font-[family-name:var(--preview-kaze-body)] text-sm leading-relaxed text-[#f7f4ef]/75">
											{hostBio}
										</p>
										{data.host.inquire ? (
											<button
												type="button"
												className="mt-5 border border-[#f7f4ef]/30 px-4 py-2 font-[family-name:var(--preview-kaze-body)] text-[10px] uppercase tracking-widest"
											>
												{data.host.inquire}
											</button>
										) : null}
									</div>
								</div>
							) : null}
						</div>

						<aside className="lg:col-span-5 lg:sticky lg:top-8 lg:self-start">
							<KazeBookingPanel
								data={data}
								listingPreview={listingPreview}
								propertyRef={propertyRef}
								guestCap={guestCap}
							/>
						</aside>
					</div>
				</div>
			</section>

			{data.gallery.full.src.trim() ? (
				<section className="relative">
					<button
						type="button"
						onClick={() => openGallery(data.gallery.full.src.trim())}
						className="relative block w-full"
					>
						<FillImg src={data.gallery.full.src} className="aspect-[24/9] w-full" sizes="100vw" />
						<div className="absolute inset-0 bg-[#121110]/30" aria-hidden />
					</button>
				</section>
			) : null}

			<footer className="border-t border-[#f7f4ef]/10 px-5 py-12 sm:px-12">
				<div className="mx-auto flex max-w-[1440px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="font-[family-name:var(--preview-kaze-headline)] text-3xl italic">{data.footer.wordmark}</p>
						{data.footer.tagline ? (
							<p className="mt-2 font-[family-name:var(--preview-kaze-body)] text-sm text-[#f7f4ef]/45">{data.footer.tagline}</p>
						) : null}
					</div>
					{data.footer.links.length > 0 ? (
						<div className="flex flex-wrap gap-8 font-[family-name:var(--preview-kaze-body)] text-[10px] uppercase tracking-[0.2em] text-[#f7f4ef]/40">
							{data.footer.links.map((l) => (
								<span key={l.label}>{l.label}</span>
							))}
						</div>
					) : null}
					<p className="font-[family-name:var(--preview-kaze-body)] text-xs text-[#f7f4ef]/30">{data.footer.copyright}</p>
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
