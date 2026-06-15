'use client';

import Image from 'next/image';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { ArrowRight, Droplets, MapPin, Menu, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import './mizu-booking-day-picker.css';
import { BrandingPreviewMap } from '@/components/google-maps';
import { cn, Input } from '@/components/ui';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph, BrandingHeroMedia, BrandingHostProfileLink, BrandingWordmark, FillImg } from './branding-preview-shared';
import { BrandingGuestExtrasSection } from './branding-guest-extras-section';
import { BrandingPrivacyAccess } from './branding-privacy-access';
import { BrandingRichTextBlock } from './branding-rich-text-block';
import { BrandingStayDetailsSection } from './branding-stay-details-section';
import { BrandingVideoSection } from './branding-video-section';
import { PhotoGalleryLightbox } from './photo-gallery-carousel';
import { formatStay, useBrandingStayBooking } from './use-branding-stay-booking';

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

function MizuSection({
	title,
	description,
	children,
	className,
}: {
	title: string;
	description?: string;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<section className={cn('scroll-mt-24', className)}>
			<div className="flex items-end gap-3">
				<h2 className="font-[family-name:var(--preview-mizu-headline)] text-[clamp(1.75rem,4vw,2.25rem)] leading-none text-[#1a2e35]">
					{title}
				</h2>
				<span className="mb-1 hidden h-px flex-1 bg-gradient-to-r from-[#c4785a]/50 to-[#4d7c6f]/30 sm:block" aria-hidden />
			</div>
			{description ? (
				<p className="mt-3 max-w-2xl font-[family-name:var(--preview-mizu-body)] text-[15px] leading-relaxed text-[#1a2e35]/65">
					{description}
				</p>
			) : null}
			{children ? <div className="mt-6">{children}</div> : null}
		</section>
	);
}

function MizuBookingPanel({
	data,
	listingPreview,
	propertyRef,
	guestCap,
	className,
}: {
	data: BrandingPreviewDemo;
	listingPreview?: boolean;
	propertyRef: string;
	guestCap: number;
	className?: string;
}) {
	const booking = useBrandingStayBooking({ listingPreview, propertyRef, guestCap });
	const priceHint = booking.checkingAvailability
		? 'Checking availability…'
		: booking.stayRange?.from && booking.stayRange?.to && booking.availabilityMsg
			? booking.availabilityMsg
			: data.booking.price.trim()
				? `${data.booking.price} ${data.booking.per}`
				: 'Choose dates to see your total';
	const checkInLabel = booking.stayRange?.from ? formatStay(booking.stayRange.from) : null;
	const checkOutLabel = booking.stayRange?.to ? formatStay(booking.stayRange.to) : null;
	const calendarMonth = booking.stayRange?.from ?? booking.stayRange?.to ?? new Date();
	const datesSelected = Boolean(booking.stayRange?.from && booking.stayRange?.to);
	const canClearDates = Boolean(booking.stayRange?.from || booking.stayRange?.to);
	const reserveDisabled =
		listingPreview && (!propertyRef || !datesSelected || booking.checkingAvailability);

	return (
		<div
			className={cn(
				'rounded-2xl border border-[#6b9a8f]/20 bg-[#fff9f4] p-6 shadow-[0_20px_50px_-24px_rgba(26,46,53,0.22)]',
				className,
			)}
		>
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="flex items-center gap-1.5 font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4d7c6f]">
						<Droplets className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
						{data.booking.eyebrow}
					</p>
					{data.booking.price.trim() ? (
						<p className="mt-2 font-[family-name:var(--preview-mizu-headline)] text-[2rem] leading-none text-[#1a2e35]">
							{data.booking.price}
							<span className="ml-1 font-[family-name:var(--preview-mizu-body)] text-sm font-normal text-[#1a2e35]/50">
								{data.booking.per}
							</span>
						</p>
					) : null}
				</div>
				{data.booking.rating.trim() ? (
					<div className="flex items-center gap-1 rounded-full bg-[#f3ebe3] px-2.5 py-1">
						<Star className="h-3.5 w-3.5 fill-[#c4785a] text-[#c4785a]" aria-hidden />
						<span className="font-[family-name:var(--preview-mizu-body)] text-xs font-semibold text-[#1a2e35]">
							{data.booking.rating.split('·')[0]?.trim() || data.booking.rating}
						</span>
					</div>
				) : null}
			</div>

			<p className="mt-4 font-[family-name:var(--preview-mizu-body)] text-sm text-[#1a2e35]/70">{priceHint}</p>
			{data.booking.guests.trim() ? (
				<p className="mt-1 font-[family-name:var(--preview-mizu-body)] text-xs text-[#1a2e35]/50">{data.booking.guests}</p>
			) : null}

			<div ref={booking.stayPickerRef} className="relative z-20 mt-5">
				<div className="overflow-hidden rounded-xl border border-[#6b9a8f]/20">
					<div className="grid grid-cols-2 divide-x divide-[#6b9a8f]/15">
						<button
							type="button"
							onClick={() => booking.setStayPickerOpen(true)}
							className="cursor-pointer px-4 py-3 text-left transition hover:bg-[#f3ebe3]/60"
						>
							<span className="font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1a2e35]/45">
								Check in
							</span>
							<span
								className={cn(
									'mt-1 block font-[family-name:var(--preview-mizu-body)] text-sm',
									checkInLabel ? 'font-medium text-[#1a2e35]' : 'font-normal text-[#1a2e35]/50',
								)}
							>
								{checkInLabel ?? 'Add date'}
							</span>
						</button>
						<button
							type="button"
							onClick={() => booking.setStayPickerOpen(true)}
							className="cursor-pointer px-4 py-3 text-left transition hover:bg-[#f3ebe3]/60"
						>
							<span className="font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1a2e35]/45">
								Check out
							</span>
							<span
								className={cn(
									'mt-1 block font-[family-name:var(--preview-mizu-body)] text-sm',
									checkOutLabel ? 'font-medium text-[#1a2e35]' : 'font-normal text-[#1a2e35]/50',
								)}
							>
								{checkOutLabel ?? 'Add date'}
							</span>
						</button>
					</div>
				</div>
				{booking.stayPickerOpen ? (
					<div
						role="dialog"
						aria-label="Select stay dates"
						className="mizu-booking-day-picker absolute left-0 right-0 top-full z-50 mt-2 min-w-[min(100%,20rem)] rounded-xl border border-[#6b9a8f]/20 bg-white p-4 shadow-[0_20px_50px_-16px_rgba(26,46,53,0.25)]"
					>
						<DayPicker
							mode="range"
							min={1}
							excludeDisabled
							defaultMonth={calendarMonth}
							selected={booking.stayRange}
							onSelect={(range) => {
								booking.setStayRange(range);
								if (range?.from && range?.to) void booking.checkAvailabilityForDates(range.from, range.to);
							}}
							disabled={booking.dayDisabled}
							numberOfMonths={1}
							className="w-full font-[family-name:var(--preview-mizu-body)]"
						/>
						<div className="mt-3 flex gap-2 border-t border-[#6b9a8f]/15 pt-3">
							<button
								type="button"
								onClick={booking.clearStayRange}
								disabled={!canClearDates}
								className="cursor-pointer flex-1 rounded-lg border border-[#6b9a8f]/20 bg-white py-2.5 font-[family-name:var(--preview-mizu-body)] text-xs font-semibold text-[#1a2e35] transition hover:bg-[#f3ebe3]/60 disabled:cursor-not-allowed disabled:text-[#1a2e35]/40"
							>
								Clear
							</button>
							<button
								type="button"
								onClick={() => booking.setStayPickerOpen(false)}
								className="cursor-pointer flex-1 rounded-lg bg-[#4d7c6f] py-2.5 font-[family-name:var(--preview-mizu-body)] text-xs font-semibold text-white transition hover:bg-[#3d665b]"
							>
								Apply
							</button>
						</div>
					</div>
				) : null}
			</div>

			<div className="mt-4">
				<label
					htmlFor={booking.guestFieldId}
					className="font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1a2e35]/45"
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
					className="mt-2 border-[#6b9a8f]/20 bg-[#f3ebe3]/40"
					variant="compact"
				/>
			</div>

			<button
				type="button"
				onClick={() => void booking.handleReserveClick()}
				disabled={reserveDisabled}
				className={cn(
					'mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#4d7c6f] py-3.5 font-[family-name:var(--preview-mizu-body)] text-sm font-semibold text-white transition hover:bg-[#3d665b] disabled:cursor-not-allowed disabled:opacity-50',
				)}
			>
				<span>{booking.checkingAvailability ? 'Checking…' : data.booking.cta}</span>
				<ArrowRight className="h-4 w-4" aria-hidden />
			</button>
			{data.booking.disclaimer ? (
				<p className="mt-3 text-center font-[family-name:var(--preview-mizu-body)] text-[11px] leading-relaxed text-[#1a2e35]/45">
					{data.booking.disclaimer}
				</p>
			) : null}
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
	const heroVideo = data.hero.videoSrc?.trim() ?? '';
	const heroImageSrc = data.hero.imageSrc.trim() || data.gallery.large.src.trim();
	const galleryImages = useMemo(
		() =>
			[
				heroImageSrc,
				data.gallery.large.src.trim(),
				data.gallery.stack[0].src.trim(),
				data.gallery.stack[1].src.trim(),
				data.gallery.full.src.trim(),
			].filter(Boolean),
		[heroImageSrc, data.gallery],
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
			<section className="relative min-h-[min(72vh,780px)] w-full overflow-hidden">
				<div className="absolute inset-0 z-0">
					{heroVideo || heroImageSrc ? (
						<BrandingHeroMedia
							videoSrc={heroVideo}
							videoSource={data.hero.videoSource}
							imageSrc={heroImageSrc}
							className="size-full min-h-full"
							sizes="100vw"
							priority
							onImageClick={heroVideo ? undefined : () => openGallery(heroImageSrc)}
						/>
					) : (
						<div className="size-full min-h-full bg-[#2a4549]" aria-hidden />
					)}
				</div>
				<div
					className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#1a2e35]/90 via-[#1a2e35]/40 to-[#1a2e35]/10"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(196,120,90,0.2),transparent)]"
					aria-hidden
				/>

				<header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-6 sm:px-10">
					<BrandingWordmark
						wordmark={data.wordmark}
						logoSrc={data.logoSrc}
						logoAlt={data.logoAlt}
						className="font-[family-name:var(--preview-mizu-headline)] text-xl tracking-wide text-[#fff9f4] sm:text-2xl"
					/>
					<div className="flex items-center gap-5 sm:gap-8">
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
					</div>
				</header>

				<div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-16 sm:px-10 sm:pb-20">
					{data.hero.series ? (
						<p className="font-[family-name:var(--preview-mizu-body)] text-[11px] uppercase tracking-[0.35em] text-[#f5d4c8]/90">
							{data.hero.series}
						</p>
					) : null}
					<h1 className="mt-3 max-w-3xl font-[family-name:var(--preview-mizu-headline)] text-[clamp(2.25rem,6vw,4.25rem)] leading-[0.95] text-[#fff9f4]">
						{data.hero.title}
					</h1>
					<div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
						{data.hero.location ? (
							<p className="flex items-center gap-2 font-[family-name:var(--preview-mizu-body)] text-sm text-[#fff9f4]/85 sm:text-base">
								<MapPin className="h-4 w-4 shrink-0 text-[#c4785a]" strokeWidth={1.5} />
								{data.hero.location}
							</p>
						) : null}
						{data.booking.rating.trim() ? (
							<p className="flex items-center gap-1.5 font-[family-name:var(--preview-mizu-body)] text-sm text-[#fff9f4]/85">
								<Star className="h-4 w-4 fill-[#c4785a] text-[#c4785a]" aria-hidden />
								{data.booking.rating}
							</p>
						) : null}
						{data.privacyPolicy.html ? (
							<BrandingPrivacyAccess html={data.privacyPolicy.html} variant="mizu" />
						) : null}
					</div>
				</div>
			</section>

			<div className="relative z-10 -mt-10 rounded-t-[2rem] bg-[#fff9f4] sm:-mt-14 sm:rounded-t-[2.5rem]">
				<div className="mx-auto max-w-6xl px-5 pt-10 sm:px-10 sm:pt-12">
					<div className="lg:hidden">
						<MizuBookingPanel
							data={data}
							listingPreview={listingPreview}
							propertyRef={propertyRef}
							guestCap={guestCap}
						/>
					</div>
				</div>

				<div className="mx-auto max-w-6xl px-5 pb-16 sm:px-10 sm:pb-20">
					<div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 lg:pt-4">
						<div className="min-w-0 space-y-12 sm:space-y-14">
							{(aboutLong || aboutShort) && (
								<section>
									{data.concept.eyebrow ? (
										<p className="font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.28em] text-[#4d7c6f]">
											{data.concept.eyebrow}
										</p>
									) : null}
									{aboutShort ? (
										<h2 className="mt-3 max-w-2xl font-[family-name:var(--preview-mizu-headline)] text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.05] text-[#1a2e35]">
											{aboutShort}
										</h2>
									) : null}
									{aboutLong ? (
										<p className="mt-5 max-w-3xl font-[family-name:var(--preview-mizu-body)] text-[15px] leading-[1.8] text-[#1a2e35]/72 sm:text-base">
											{aboutLong}
										</p>
									) : null}
								</section>
							)}

							{data.welcome.html ? (
								<section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#f3ebe3] via-[#fff9f4] to-[#f3ebe3] px-6 py-8 sm:px-9 sm:py-10">
									<div
										className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#c4785a] to-[#4d7c6f]"
										aria-hidden
									/>
									<BrandingRichTextBlock
										html={data.welcome.html}
										variant="mizu"
										className="font-[family-name:var(--preview-mizu-headline)] text-xl font-medium leading-[1.45] tracking-[-0.01em] text-[#1a2e35] sm:text-[1.75rem] sm:leading-[1.35] [&_em]:text-[#4d7c6f] [&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-[#4d7c6f]"
									/>
								</section>
							) : null}

							<MizuSection title="Property details">
								<BrandingStayDetailsSection stay={data.stay} variant="mizu" />
							</MizuSection>

							<MizuSection title="Photo gallery" description="Spaces and views included with your stay.">
								<div className="grid gap-3 sm:grid-cols-12">
									{data.gallery.large.src.trim() ? (
										<button
											type="button"
											onClick={() => openGallery(data.gallery.large.src.trim())}
											className="group cursor-pointer overflow-hidden rounded-xl sm:col-span-7"
										>
											<FillImg
												src={data.gallery.large.src}
												className="aspect-[4/5] w-full sm:aspect-[5/6]"
												sizes="(max-width:640px) 100vw, 45vw"
												imgClassName="transition duration-500 group-hover:scale-[1.02]"
											/>
										</button>
									) : null}
									<div className="grid gap-3 sm:col-span-5">
										{data.gallery.stack[0].src.trim() ? (
											<button
												type="button"
												onClick={() => openGallery(data.gallery.stack[0].src.trim())}
												className="group cursor-pointer overflow-hidden rounded-xl"
											>
												<FillImg
													src={data.gallery.stack[0].src}
													className="aspect-[4/3] w-full"
													sizes="300px"
													imgClassName="transition duration-500 group-hover:scale-[1.02]"
												/>
											</button>
										) : null}
										{data.gallery.stack[1].src.trim() ? (
											<button
												type="button"
												onClick={() => openGallery(data.gallery.stack[1].src.trim())}
												className="group cursor-pointer overflow-hidden rounded-xl"
											>
												<FillImg
													src={data.gallery.stack[1].src}
													className="aspect-square w-full"
													sizes="300px"
													imgClassName="transition duration-500 group-hover:scale-[1.02]"
												/>
											</button>
										) : null}
									</div>
								</div>
								{data.gallery.full.src.trim() ? (
									<button
										type="button"
										onClick={() => openGallery(data.gallery.full.src.trim())}
										className="group mt-3 block w-full cursor-pointer overflow-hidden rounded-xl"
									>
										<FillImg
											src={data.gallery.full.src}
											className="aspect-[21/9] w-full"
											sizes="100vw"
											imgClassName="transition duration-700 group-hover:scale-[1.01]"
										/>
										{data.gallery.full.caption ? (
											<p className="mt-2 font-[family-name:var(--preview-mizu-body)] text-xs text-[#1a2e35]/50">
												{data.gallery.full.caption}
											</p>
										) : null}
									</button>
								) : null}
							</MizuSection>

							{data.amenities.length > 0 ? (
								<MizuSection title="Amenities">
									<ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
										{data.amenities.map((a) => (
											<li key={`${a.id}-${a.label}`} className="flex gap-3">
												<AmenityGlyph id={a.id} className="mt-0.5 h-5 w-5 shrink-0 text-[#4d7c6f]" />
												<div>
													<p className="font-[family-name:var(--preview-mizu-body)] text-sm font-medium text-[#1a2e35]">
														{a.label}
														{a.quantity ? ` · ${a.quantity}` : ''}
													</p>
													{a.description ? (
														<p className="mt-1 font-[family-name:var(--preview-mizu-body)] text-sm leading-relaxed text-[#1a2e35]/65">
															{a.description}
														</p>
													) : null}
												</div>
											</li>
										))}
									</ul>
								</MizuSection>
							) : null}

							{data.videos.length > 0 ? (
								<MizuSection title="Video tour">
									<BrandingVideoSection videos={data.videos} variant="mizu" embedded />
								</MizuSection>
							) : null}

							{data.guestExtras.length > 0 ? (
								<MizuSection title="Optional extras">
									<BrandingGuestExtrasSection guestExtras={data.guestExtras} variant="mizu" embedded />
								</MizuSection>
							) : null}

							{data.houseRules.html ? (
								<MizuSection title="House rules">
									<BrandingRichTextBlock html={data.houseRules.html} variant="mizu" />
								</MizuSection>
							) : null}

							<MizuSection title="Location" description={data.location.eyebrow || undefined}>
								<div className="overflow-hidden rounded-xl bg-[#f3ebe3]">
									<div className="relative aspect-[16/10] w-full">
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
								</div>
								<div className="mt-6 grid gap-6 sm:grid-cols-2">
									{data.location.columns.map((col) => (
										<div key={col.title}>
											<h3 className="font-[family-name:var(--preview-mizu-headline)] text-lg text-[#1a2e35]">
												{col.title}
											</h3>
											<p className="mt-2 font-[family-name:var(--preview-mizu-body)] text-sm leading-relaxed text-[#1a2e35]/65">
												{col.text}
											</p>
										</div>
									))}
								</div>
							</MizuSection>

							{data.host.name.trim() ? (
								<MizuSection title="Your host">
									<BrandingHostProfileLink
										hostName={data.host.host_name}
										listingPreview={listingPreview}
										className="rounded-2xl transition hover:bg-[#c4785a]/5"
									>
										<div className="flex flex-col gap-5 p-1 sm:flex-row sm:items-start">
											{data.host.imageSrc.trim() ? (
												<div className="relative mx-auto h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-[#c4785a]/40 ring-offset-2 ring-offset-[#fff9f4] transition group-hover/host:ring-[#c4785a]/70 sm:mx-0">
													<Image src={data.host.imageSrc} alt="" fill className="object-cover" sizes="80px" unoptimized />
												</div>
											) : null}
											<div className="min-w-0 flex-1 text-center sm:text-left">
												{data.host.label ? (
													<p className="font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4d7c6f]">
														{data.host.label}
													</p>
												) : null}
												<p className="mt-1 font-[family-name:var(--preview-mizu-headline)] text-2xl text-[#1a2e35] transition group-hover/host:text-[#c4785a]">
													{data.host.name}
												</p>
												{data.host.rating.trim() ? (
													<p className="mt-1 font-[family-name:var(--preview-mizu-body)] text-sm text-[#1a2e35]/65">
														{data.host.rating}
													</p>
												) : null}
												{data.host.bio.trim() ? (
													<p className="mt-3 max-w-2xl font-[family-name:var(--preview-mizu-body)] text-[15px] leading-relaxed text-[#1a2e35]/72">
														{data.host.bio}
													</p>
												) : null}
												{data.host.inquire ? (
													<span className="mt-4 inline-flex items-center gap-1.5 font-[family-name:var(--preview-mizu-body)] text-sm font-semibold text-[#c4785a] transition group-hover/host:text-[#a86145]">
														{data.host.inquire}
														<ArrowRight className="h-4 w-4" aria-hidden />
													</span>
												) : null}
											</div>
										</div>
									</BrandingHostProfileLink>
								</MizuSection>
							) : null}
						</div>

						<aside className="hidden lg:block">
							<div className="sticky top-8">
								<MizuBookingPanel
									data={data}
									listingPreview={listingPreview}
									propertyRef={propertyRef}
									guestCap={guestCap}
								/>
							</div>
						</aside>
					</div>
				</div>
			</div>

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
