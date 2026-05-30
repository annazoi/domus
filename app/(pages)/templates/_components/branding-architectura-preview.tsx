'use client';

import Image from 'next/image';
import { Figtree, Shippori_Mincho } from 'next/font/google';
import { ArrowUpRight, MapPin, Menu, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { BrandingPreviewMap } from '@/components/google-maps';
import { cn, Input } from '@/components/ui';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph, FillImg } from './branding-preview-shared';
import { PhotoGalleryLightbox } from './photo-gallery-carousel';
import { formatStay, useBrandingStayBooking } from './use-branding-stay-booking';

const shippori = Shippori_Mincho({
	subsets: ['latin'],
	variable: '--preview-kaze-headline',
	weight: ['400', '500', '600', '700'],
	display: 'swap',
});

const figtree = Figtree({
	subsets: ['latin'],
	variable: '--preview-kaze-body',
	weight: ['300', '400', '500', '600', '700'],
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
	const calendarMonth = booking.stayRange?.from ?? booking.stayRange?.to ?? new Date();

	return (
		<div className="rounded-2xl border border-[#1c2430]/8 bg-white/80 shadow-[0_24px_64px_-32px_rgba(28,36,48,0.35)] backdrop-blur-md">
			<div className="border-b border-[#1c2430]/6 px-6 py-5">
				<p className="font-[family-name:var(--preview-kaze-body)] text-[10px] font-medium uppercase tracking-[0.32em] text-[#6b8f9e]">
					{data.booking.eyebrow}
				</p>
				<div className="mt-3 flex items-end justify-between gap-4">
					{data.booking.price.trim() ? (
						<p className="font-[family-name:var(--preview-kaze-headline)] text-[2.25rem] leading-none text-[#1c2430]">
							{data.booking.price}
							<span className="ml-1 font-[family-name:var(--preview-kaze-body)] text-sm font-normal text-[#1c2430]/45">
								{data.booking.per}
							</span>
						</p>
					) : null}
					{data.booking.rating.trim() ? (
						<div className="flex items-center gap-1.5 rounded-full bg-[#eef1f4] px-3 py-1.5">
							<Star className="h-3.5 w-3.5 fill-[#c9b8a8] text-[#c9b8a8]" aria-hidden />
							<span className="font-[family-name:var(--preview-kaze-body)] text-xs font-medium text-[#1c2430]/70">
								{data.booking.rating}
							</span>
						</div>
					) : null}
				</div>
			</div>

			<div className="overflow-visible px-6 py-5">
				<p className="font-[family-name:var(--preview-kaze-body)] text-sm text-[#1c2430]/55">{priceHint}</p>

				<div ref={booking.stayPickerRef} className="relative z-20 mt-5">
					<div className="grid grid-cols-2 gap-3">
						<button
							type="button"
							onClick={() => booking.setStayPickerOpen(true)}
							className="rounded-xl border border-[#1c2430]/10 bg-[#fafbfc] px-4 py-3.5 text-left transition hover:border-[#6b8f9e]/40"
						>
							<span className="font-[family-name:var(--preview-kaze-body)] text-[9px] font-medium uppercase tracking-[0.22em] text-[#1c2430]/40">
								Arrive
							</span>
							<span className="cursor-pointer mt-1 block font-[family-name:var(--preview-kaze-body)] text-sm font-medium text-[#1c2430]">
								{booking.stayRange?.from ? formatStay(booking.stayRange.from) : data.booking.arrival || 'Add date'}
							</span>
						</button>
						<button
							type="button"
							onClick={() => booking.setStayPickerOpen(true)}
							className="rounded-xl border border-[#1c2430]/10 bg-[#fafbfc] px-4 py-3.5 text-left transition hover:border-[#6b8f9e]/40"
						>
							<span className="font-[family-name:var(--preview-kaze-body)] text-[9px] font-medium uppercase tracking-[0.22em] text-[#1c2430]/40">
								Depart
							</span>
							<span className="cursor-pointer mt-1 block font-[family-name:var(--preview-kaze-body)] text-sm font-medium text-[#1c2430]">
								{booking.stayRange?.to ? formatStay(booking.stayRange.to) : data.booking.departure || 'Add date'}
							</span>
						</button>
					</div>
					{booking.stayPickerOpen ? (
						<div
							role="dialog"
							aria-label="Select stay dates"
							className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-[#1c2430]/10 bg-white p-4 shadow-[0_20px_50px_-16px_rgba(28,36,48,0.35)]"
						>
							<DayPicker
								mode="range"
								min={1}
								defaultMonth={calendarMonth}
								selected={booking.stayRange}
								onSelect={(range) => {
									booking.setStayRange(range);
									if (range?.from && range?.to) void booking.checkAvailabilityForDates(range.from, range.to);
								}}
								disabled={listingPreview ? booking.dayDisabled : undefined}
								numberOfMonths={1}
								className={cn(
									'w-full font-[family-name:var(--preview-kaze-body)]',
									'[--rdp-accent-color:#6b8f9e]',
									'[--rdp-accent-background-color:rgba(107,143,158,0.14)]',
									'[--rdp-day-height:2.35rem]',
									'[--rdp-day-width:2.35rem]',
									'[--rdp-day_button-height:2.1rem]',
									'[--rdp-day_button-width:2.1rem]',
									'[--rdp-day_button-border-radius:0.5rem]',
									'[--rdp-nav_button-height:2rem]',
									'[--rdp-nav_button-width:2rem]',
									'[--rdp-today-color:#1c2430]',
									'[--rdp-outside-opacity:0.35]',
									'[--rdp-disabled-opacity:0.35]',
									'[&_.rdp-month]:w-full',
									'[&_.rdp-month_grid]:w-full',
									'[&_.rdp-month_caption]:mb-2',
									'[&_.rdp-caption_label]:text-sm [&_.rdp-caption_label]:font-semibold [&_.rdp-caption_label]:text-[#1c2430]',
									'[&_.rdp-weekday]:text-[10px] [&_.rdp-weekday]:font-medium [&_.rdp-weekday]:uppercase [&_.rdp-weekday]:tracking-[0.18em] [&_.rdp-weekday]:text-[#1c2430]/45',
									'[&_.rdp-button_previous]:rounded-lg [&_.rdp-button_next]:rounded-lg',
									'[&_.rdp-button_previous]:border [&_.rdp-button_next]:border',
									'[&_.rdp-button_previous]:border-[#1c2430]/10 [&_.rdp-button_next]:border-[#1c2430]/10',
									'[&_.rdp-day_button]:text-sm [&_.rdp-day_button]:font-medium [&_.rdp-day_button]:text-[#1c2430]',
									'[&_.rdp-day_button]:transition-colors [&_.rdp-day_button]:duration-150',
									'[&_.rdp-day_button:hover:not(:disabled)]:bg-[#eef1f4]',
								)}
							/>
							<button
								type="button"
								onClick={() => booking.setStayPickerOpen(false)}
								className="cursor-pointer mt-3 w-full rounded-lg bg-[#1c2430] py-2.5 font-[family-name:var(--preview-kaze-body)] text-xs font-semibold uppercase tracking-widest text-[#fafbfc]"
							>
								Confirm
							</button>
						</div>
					) : null}
				</div>

				<div className="mt-5">
					<label
						htmlFor={booking.guestFieldId}
						className="font-[family-name:var(--preview-kaze-body)] text-[9px] font-medium uppercase tracking-[0.22em] text-[#1c2430]/40"
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
						className="mt-2 rounded-xl border-[#1c2430]/10 bg-[#fafbfc]"
						variant="compact"
					/>
				</div>

				<button
					type="button"
					onClick={() => void booking.handleReserveClick()}
					disabled={listingPreview && (!propertyRef || !booking.stayRange?.from || !booking.stayRange?.to || booking.checkingAvailability)}
					className="cursor-pointer group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c2430] py-4 font-[family-name:var(--preview-kaze-body)] text-sm font-semibold tracking-wide text-[#fafbfc] transition hover:bg-[#6b8f9e] disabled:opacity-50"
				>
					<span>{booking.checkingAvailability ? 'Checking…' : data.booking.cta}</span>
					<ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
				</button>
				{data.booking.disclaimer ? (
					<p className="mt-3 text-center font-[family-name:var(--preview-kaze-body)] text-[11px] text-[#1c2430]/35">
						{data.booking.disclaimer}
					</p>
				) : null}
			</div>
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
				shippori.variable,
				figtree.variable,
				'min-h-screen bg-[#eef1f4] font-[family-name:var(--preview-kaze-body)] text-[#1c2430] antialiased selection:bg-[#6b8f9e]/25',
			)}
		>
			<div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
				<div className="absolute -left-1/4 top-0 h-[60vh] w-[70vw] rounded-full bg-[#6b8f9e]/10 blur-[120px]" />
				<div className="absolute -right-1/4 bottom-0 h-[50vh] w-[60vw] rounded-full bg-[#c9b8a8]/15 blur-[100px]" />
				<div
					className="absolute inset-0 opacity-[0.4]"
					style={{
						backgroundImage:
							'radial-gradient(circle at 1px 1px, rgba(28,36,48,0.06) 1px, transparent 0)',
						backgroundSize: '28px 28px',
					}}
				/>
			</div>

			<header className="relative z-30">
				<div className="mx-auto flex max-w-[1360px] items-center justify-between px-5 py-6 sm:px-10">
					<span className="font-[family-name:var(--preview-kaze-headline)] text-lg tracking-wide text-[#1c2430] sm:text-xl">
						{data.wordmark}
					</span>
					{data.nav.length > 0 ? (
						<nav className="hidden items-center gap-8 md:flex">
							{data.nav.map((item) => (
								<span
									key={item.label}
									className={cn(
										'font-[family-name:var(--preview-kaze-body)] text-[10px] font-medium uppercase tracking-[0.28em]',
										item.current ? 'text-[#6b8f9e]' : 'text-[#1c2430]/40',
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

			<section className="relative z-10 px-5 sm:px-10">
				<div className="relative mx-auto max-w-[1360px] overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
					<div className="relative min-h-[62vh] sm:min-h-[72vh]">
						{data.hero.imageSrc.trim() ? (
							<button
								type="button"
								onClick={() => openGallery(data.hero.imageSrc.trim())}
								className="relative block h-full min-h-[62vh] w-full sm:min-h-[72vh]"
							>
								<Image
									src={data.hero.imageSrc}
									alt=""
									fill
									className="object-cover"
									sizes="100vw"
									priority
									unoptimized
								/>
								<div
									className="absolute inset-0 bg-gradient-to-t from-[#1c2430]/85 via-[#1c2430]/25 to-[#1c2430]/10"
									aria-hidden
								/>
							</button>
						) : (
							<div className="min-h-[62vh] bg-[#d5dce3] sm:min-h-[72vh]" aria-hidden />
						)}

						<div className="absolute inset-x-0 bottom-0 px-6 pb-8 sm:px-10 sm:pb-12 lg:px-14 lg:pb-14">
							{data.hero.series ? (
								<p className="font-[family-name:var(--preview-kaze-body)] text-[10px] font-medium uppercase tracking-[0.38em] text-[#c9b8a8]">
									{data.hero.series}
								</p>
							) : null}
							<h1 className="mt-3 max-w-3xl font-[family-name:var(--preview-kaze-headline)] text-[clamp(2.25rem,6vw,4.25rem)] leading-[1.08] text-[#fafbfc]">
								{data.hero.title}
							</h1>
							<div className="mt-6 flex flex-wrap items-center gap-4">
								{data.hero.location ? (
									<p className="flex items-center gap-2 rounded-full border border-[#fafbfc]/20 bg-[#fafbfc]/10 px-4 py-2 font-[family-name:var(--preview-kaze-body)] text-sm text-[#fafbfc]/90 backdrop-blur-sm">
										<MapPin className="h-3.5 w-3.5 text-[#c9b8a8]" strokeWidth={1.5} />
										{data.hero.location}
									</p>
								) : null}
								{aboutShort ? (
									<p className="max-w-md font-[family-name:var(--preview-kaze-body)] text-sm leading-relaxed text-[#fafbfc]/65">
										{aboutShort}
									</p>
								) : null}
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="relative z-10 px-5 py-16 sm:px-10 sm:py-24">
				<div className="mx-auto grid max-w-[1360px] gap-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
					<div className="space-y-20">
						{aboutLong ? (
							<div className="max-w-2xl">
								{data.concept.eyebrow ? (
									<p className="font-[family-name:var(--preview-kaze-body)] text-[10px] font-medium uppercase tracking-[0.35em] text-[#6b8f9e]">
										{data.concept.eyebrow}
									</p>
								) : null}
								<p className="mt-5 font-[family-name:var(--preview-kaze-headline)] text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.35] text-[#1c2430]">
									{aboutLong}
								</p>
							</div>
						) : null}

						<div className="grid gap-4 sm:grid-cols-12">
							{data.gallery.large.src.trim() ? (
								<button
									type="button"
									onClick={() => openGallery(data.gallery.large.src.trim())}
									className="group overflow-hidden rounded-2xl sm:col-span-7"
								>
									<FillImg
										src={data.gallery.large.src}
										className="aspect-[4/5] w-full sm:aspect-[5/6]"
										sizes="(max-width:640px) 100vw, 45vw"
										imgClassName="transition duration-700 group-hover:scale-[1.03]"
									/>
									{data.gallery.large.caption ? (
										<p className="mt-3 font-[family-name:var(--preview-kaze-body)] text-[10px] uppercase tracking-[0.28em] text-[#1c2430]/40">
											{data.gallery.large.caption}
										</p>
									) : null}
								</button>
							) : null}
							<div className="grid gap-4 sm:col-span-5">
								{data.gallery.stack[0].src.trim() ? (
									<button
										type="button"
										onClick={() => openGallery(data.gallery.stack[0].src.trim())}
										className="group overflow-hidden rounded-2xl"
									>
										<FillImg
											src={data.gallery.stack[0].src}
											className="aspect-[4/3] w-full"
											sizes="300px"
											imgClassName="transition duration-700 group-hover:scale-[1.03]"
										/>
									</button>
								) : null}
								{data.gallery.stack[1].src.trim() ? (
									<button
										type="button"
										onClick={() => openGallery(data.gallery.stack[1].src.trim())}
										className="group overflow-hidden rounded-2xl"
									>
										<FillImg
											src={data.gallery.stack[1].src}
											className="aspect-square w-full"
											sizes="300px"
											imgClassName="transition duration-700 group-hover:scale-[1.03]"
										/>
									</button>
								) : null}
							</div>
						</div>

						{data.gallery.full.pullQuote.title.trim() || data.gallery.full.pullQuote.text.trim() ? (
							<div className="relative overflow-hidden rounded-2xl bg-[#1c2430] px-8 py-10 text-[#fafbfc] sm:px-12 sm:py-14">
								<div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#6b8f9e]/20 blur-2xl" aria-hidden />
								{data.gallery.full.pullQuote.title.trim() ? (
									<p className="relative font-[family-name:var(--preview-kaze-headline)] text-2xl leading-snug sm:text-3xl">
										{data.gallery.full.pullQuote.title}
									</p>
								) : null}
								{data.gallery.full.pullQuote.text.trim() ? (
									<p className="relative mt-4 max-w-lg font-[family-name:var(--preview-kaze-body)] text-sm leading-relaxed text-[#fafbfc]/60">
										{data.gallery.full.pullQuote.text}
									</p>
								) : null}
							</div>
						) : null}

						{data.amenities.length > 0 ? (
							<div>
								<p className="font-[family-name:var(--preview-kaze-body)] text-[10px] font-medium uppercase tracking-[0.35em] text-[#6b8f9e]">
									Amenities
								</p>
								<ul className="mt-8 grid gap-3 sm:grid-cols-2">
									{data.amenities.map((a) => (
										<li
											key={`${a.id}-${a.label}`}
											className="flex items-center gap-4 rounded-xl border border-[#1c2430]/8 bg-white/60 px-5 py-4 backdrop-blur-sm"
										>
											<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef1f4]">
												<AmenityGlyph id={a.id} className="h-5 w-5 text-[#6b8f9e]" />
											</span>
											<span className="font-[family-name:var(--preview-kaze-body)] text-sm font-medium text-[#1c2430]/80">
												{a.label}
											</span>
										</li>
									))}
								</ul>
							</div>
						) : null}

						<div>
							<p className="font-[family-name:var(--preview-kaze-body)] text-[10px] font-medium uppercase tracking-[0.35em] text-[#6b8f9e]">
								{data.location.eyebrow}
							</p>
							<div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#1c2430]/5">
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
									<div key={col.title} className="rounded-xl border border-[#1c2430]/6 bg-white/50 p-6">
										<h3 className="font-[family-name:var(--preview-kaze-headline)] text-lg text-[#1c2430]">{col.title}</h3>
										<p className="mt-2 font-[family-name:var(--preview-kaze-body)] text-sm leading-relaxed text-[#1c2430]/60">
											{col.text}
										</p>
									</div>
								))}
							</div>
						</div>

						{data.host.name.trim() ? (
							<div className="flex flex-col gap-6 rounded-2xl border border-[#1c2430]/8 bg-white/70 p-8 backdrop-blur-sm sm:flex-row sm:items-center">
								{data.host.imageSrc.trim() ? (
									<div className="relative mx-auto aspect-square w-28 shrink-0 overflow-hidden rounded-full sm:mx-0">
										<Image src={data.host.imageSrc} alt="" fill className="object-cover" sizes="112px" unoptimized />
									</div>
								) : null}
								<div>
									{data.host.label ? (
										<p className="font-[family-name:var(--preview-kaze-body)] text-[10px] font-medium uppercase tracking-[0.28em] text-[#6b8f9e]">
											{data.host.label}
										</p>
									) : null}
									<p className="mt-2 font-[family-name:var(--preview-kaze-headline)] text-2xl text-[#1c2430]">{data.host.name}</p>
									<p className="mt-1 font-[family-name:var(--preview-kaze-body)] text-xs text-[#c9b8a8]">{data.host.rating}</p>
									<p className="mt-4 max-w-lg font-[family-name:var(--preview-kaze-body)] text-sm leading-relaxed text-[#1c2430]/65">
										{hostBio}
									</p>
									{data.host.inquire ? (
										<button
											type="button"
											className="mt-5 inline-flex items-center gap-1.5 font-[family-name:var(--preview-kaze-body)] text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6b8f9e] transition hover:text-[#1c2430]"
										>
											{data.host.inquire}
											<ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
										</button>
									) : null}
								</div>
							</div>
						) : null}
					</div>

					<aside className="overflow-visible lg:sticky lg:top-8 lg:z-30 lg:self-start">
						<KazeBookingPanel
							data={data}
							listingPreview={listingPreview}
							propertyRef={propertyRef}
							guestCap={guestCap}
						/>
					</aside>
				</div>
			</section>

			{data.gallery.full.src.trim() ? (
				<section className="relative z-10 px-5 pb-16 sm:px-10 sm:pb-24">
					<button
						type="button"
						onClick={() => openGallery(data.gallery.full.src.trim())}
						className="group relative mx-auto block max-w-[1360px] overflow-hidden rounded-[2rem]"
					>
						<FillImg
							src={data.gallery.full.src}
							className="aspect-[21/9] w-full"
							sizes="100vw"
							imgClassName="transition duration-1000 group-hover:scale-[1.02]"
						/>
						<div className="absolute inset-0 bg-[#1c2430]/15 transition group-hover:bg-[#1c2430]/5" aria-hidden />
					</button>
				</section>
			) : null}

			<footer className="relative z-10 border-t border-[#1c2430]/8 px-5 py-12 sm:px-10">
				<div className="mx-auto flex max-w-[1360px] flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="font-[family-name:var(--preview-kaze-headline)] text-2xl text-[#1c2430]">{data.footer.wordmark}</p>
						{data.footer.tagline ? (
							<p className="mt-1 font-[family-name:var(--preview-kaze-body)] text-sm text-[#1c2430]/45">{data.footer.tagline}</p>
						) : null}
					</div>
					{data.footer.links.length > 0 ? (
						<div className="flex flex-wrap gap-8 font-[family-name:var(--preview-kaze-body)] text-[10px] font-medium uppercase tracking-[0.22em] text-[#1c2430]/35">
							{data.footer.links.map((l) => (
								<span key={l.label}>{l.label}</span>
							))}
						</div>
					) : null}
					<p className="font-[family-name:var(--preview-kaze-body)] text-xs text-[#1c2430]/30">{data.footer.copyright}</p>
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
