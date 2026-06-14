'use client';

import Image from 'next/image';
import { DM_Sans, Fraunces } from 'next/font/google';
import { ArrowRight, MapPin, Menu, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import './kaze-booking-day-picker.css';
import { BrandingPreviewMap } from '@/components/google-maps';
import { cn, Input } from '@/components/ui';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph, BrandingHeroMedia, BrandingWordmark, FillImg } from './branding-preview-shared';
import { BrandingGuestExtrasSection } from './branding-guest-extras-section';
import { BrandingPrivacyAccess } from './branding-privacy-access';
import { BrandingRichTextBlock } from './branding-rich-text-block';
import { BrandingStayDetailsSection } from './branding-stay-details-section';
import { BrandingVideoSection } from './branding-video-section';
import { PhotoGalleryLightbox } from './photo-gallery-carousel';
import { formatStay, useBrandingStayBooking } from './use-branding-stay-booking';

const fraunces = Fraunces({
	subsets: ['latin'],
	variable: '--preview-kaze-headline',
	weight: ['400', '500', '600', '700'],
	display: 'swap',
});

const dmSans = DM_Sans({
	subsets: ['latin'],
	variable: '--preview-kaze-body',
	weight: ['400', '500', '600', '700'],
	display: 'swap',
});

function KazeSection({
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
			<h2 className="font-[family-name:var(--preview-kaze-headline)] text-2xl font-semibold tracking-[-0.02em] text-[#1C211C] sm:text-[1.75rem]">
				{title}
			</h2>
			{description ? (
				<p className="mt-2 max-w-2xl font-[family-name:var(--preview-kaze-body)] text-[15px] leading-relaxed text-[#5F665F]">
					{description}
				</p>
			) : null}
			{children ? <div className="mt-6">{children}</div> : null}
		</section>
	);
}

function KazeBookingPanel({
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
				: 'Add dates for pricing';
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
				'rounded-2xl border border-[#E5E8E5] bg-white p-6 shadow-[0_18px_48px_-24px_rgba(28,33,28,0.18)]',
				className,
			)}
		>
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="font-[family-name:var(--preview-kaze-body)] text-xs font-medium uppercase tracking-[0.14em] text-[#5F665F]">
						{data.booking.eyebrow}
					</p>
					{data.booking.price.trim() ? (
						<p className="mt-2 font-[family-name:var(--preview-kaze-headline)] text-[2rem] font-semibold leading-none text-[#1C211C]">
							{data.booking.price}
							<span className="ml-1 font-[family-name:var(--preview-kaze-body)] text-sm font-normal text-[#5F665F]">
								{data.booking.per}
							</span>
						</p>
					) : null}
				</div>
				{data.booking.rating.trim() ? (
					<div className="flex items-center gap-1 rounded-full bg-[#FAFAF8] px-2.5 py-1">
						<Star className="h-3.5 w-3.5 fill-[#C9944A] text-[#C9944A]" aria-hidden />
						<span className="font-[family-name:var(--preview-kaze-body)] text-xs font-semibold text-[#1C211C]">
							{data.booking.rating.split('·')[0]?.trim() || data.booking.rating}
						</span>
					</div>
				) : null}
			</div>

			<p className="mt-4 font-[family-name:var(--preview-kaze-body)] text-sm text-[#5F665F]">{priceHint}</p>
			{data.booking.guests.trim() ? (
				<p className="mt-1 font-[family-name:var(--preview-kaze-body)] text-xs text-[#5F665F]/80">{data.booking.guests}</p>
			) : null}

			<div ref={booking.stayPickerRef} className="relative z-20 mt-5">
				<div className="overflow-hidden rounded-xl border border-[#E5E8E5]">
					<div className="grid grid-cols-2 divide-x divide-[#E5E8E5]">
						<button
							type="button"
							onClick={() => booking.setStayPickerOpen(true)}
							className="cursor-pointer px-4 py-3 text-left transition hover:bg-[#FAFAF8]"
						>
							<span className="font-[family-name:var(--preview-kaze-body)] text-[11px] font-medium uppercase tracking-[0.12em] text-[#5F665F]">
								Check in
							</span>
							<span
								className={cn(
									'mt-1 block font-[family-name:var(--preview-kaze-body)] text-sm',
									checkInLabel ? 'font-semibold text-[#1C211C]' : 'font-normal text-[#5F665F]',
								)}
							>
								{checkInLabel ?? 'Add date'}
							</span>
						</button>
						<button
							type="button"
							onClick={() => booking.setStayPickerOpen(true)}
							className="cursor-pointer px-4 py-3 text-left transition hover:bg-[#FAFAF8]"
						>
							<span className="font-[family-name:var(--preview-kaze-body)] text-[11px] font-medium uppercase tracking-[0.12em] text-[#5F665F]">
								Check out
							</span>
							<span
								className={cn(
									'mt-1 block font-[family-name:var(--preview-kaze-body)] text-sm',
									checkOutLabel ? 'font-semibold text-[#1C211C]' : 'font-normal text-[#5F665F]',
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
						className="kaze-booking-day-picker absolute left-0 right-0 top-full z-50 mt-2 min-w-[min(100%,20rem)] rounded-xl border border-[#E5E8E5] bg-white p-4 shadow-[0_20px_50px_-16px_rgba(28,33,28,0.2)]"
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
							className="w-full font-[family-name:var(--preview-kaze-body)]"
						/>
						<div className="mt-3 flex gap-2 border-t border-[#E5E8E5] pt-3">
							<button
								type="button"
								onClick={booking.clearStayRange}
								disabled={!canClearDates}
								className="cursor-pointer flex-1 rounded-lg border border-[#E5E8E5] bg-white py-2.5 font-[family-name:var(--preview-kaze-body)] text-xs font-semibold text-[#1C211C] transition hover:border-[#C8CEC8] hover:bg-[#FAFAF8] disabled:cursor-not-allowed disabled:border-[#E5E8E5] disabled:bg-[#FAFAF8] disabled:text-[#5F665F]/45"
							>
								Clear
							</button>
							<button
								type="button"
								onClick={() => booking.setStayPickerOpen(false)}
								className="cursor-pointer flex-1 rounded-lg bg-[#2F5D44] py-2.5 font-[family-name:var(--preview-kaze-body)] text-xs font-semibold text-white transition hover:bg-[#244A36]"
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
					className="font-[family-name:var(--preview-kaze-body)] text-[11px] font-medium uppercase tracking-[0.12em] text-[#5F665F]"
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
					className="mt-2 rounded-xl border-[#E5E8E5] bg-[#FAFAF8]"
					variant="compact"
				/>
			</div>

			<button
				type="button"
				onClick={() => void booking.handleReserveClick()}
				disabled={reserveDisabled}
				className={cn(
					'mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2F5D44] py-3.5 font-[family-name:var(--preview-kaze-body)] text-sm font-semibold text-white transition hover:bg-[#244A36] disabled:cursor-not-allowed disabled:opacity-50',
				)}
			>
				<span>{booking.checkingAvailability ? 'Checking…' : data.booking.cta}</span>
				<ArrowRight className="h-4 w-4" aria-hidden />
			</button>
			{data.booking.disclaimer ? (
				<p className="mt-3 text-center font-[family-name:var(--preview-kaze-body)] text-[11px] leading-relaxed text-[#5F665F]/80">
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
	const heroVideo = data.hero.videoSrc?.trim() ?? '';
	const heroImageSrc = data.hero.imageSrc.trim();
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
				fraunces.variable,
				dmSans.variable,
				'min-h-screen bg-[#FAFAF8] font-[family-name:var(--preview-kaze-body)] text-[#1C211C] antialiased',
			)}
		>
			<header className="sticky top-0 z-40 border-b border-[#E5E8E5] bg-white/95 backdrop-blur-sm">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
					<BrandingWordmark
						wordmark={data.wordmark}
						logoSrc={data.logoSrc}
						logoAlt={data.logoAlt}
						className="font-[family-name:var(--preview-kaze-headline)] text-lg font-semibold text-[#1C211C] sm:text-xl"
					/>
					{data.nav.length > 0 ? (
						<nav className="hidden items-center gap-8 md:flex">
							{data.nav.map((item) => (
								<span
									key={item.label}
									className={cn(
										'font-[family-name:var(--preview-kaze-body)] text-sm font-medium',
										item.current ? 'text-[#2F5D44]' : 'text-[#5F665F] hover:text-[#1C211C]',
									)}
								>
									{item.label}
								</span>
							))}
						</nav>
					) : null}
					{listingPreview ? (
						<span className="w-5 md:hidden" aria-hidden />
					) : (
						<Menu className="h-5 w-5 text-[#1C211C] md:hidden" strokeWidth={1.75} />
					)}
				</div>
			</header>

			<section className="mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10">
				<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-10">
					<div className="min-w-0 space-y-4">
						{data.hero.series ? (
							<p className="font-[family-name:var(--preview-kaze-body)] text-xs font-semibold uppercase tracking-[0.16em] text-[#2F5D44]">
								{data.hero.series}
							</p>
						) : null}
						<h1 className="font-[family-name:var(--preview-kaze-headline)] text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-[#1C211C]">
							{data.hero.title}
						</h1>
						<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5F665F]">
							{data.hero.location ? (
								<span className="inline-flex items-center gap-1.5 text-[#1C211C]">
									<MapPin className="h-4 w-4 text-[#2F5D44]" strokeWidth={1.75} />
									{data.hero.location}
								</span>
							) : null}
							{data.booking.rating.trim() ? (
								<span className="inline-flex items-center gap-1.5">
									<Star className="h-4 w-4 fill-[#C9944A] text-[#C9944A]" aria-hidden />
									{data.booking.rating}
								</span>
							) : null}
							{data.privacyPolicy.html ? (
								<BrandingPrivacyAccess html={data.privacyPolicy.html} variant="architectura" />
							) : null}
						</div>
						{aboutShort ? (
							<p className="max-w-2xl pt-1 font-[family-name:var(--preview-kaze-body)] text-base leading-relaxed text-[#5F665F]">
								{aboutShort}
							</p>
						) : null}
					</div>

					<div className="overflow-hidden rounded-2xl bg-[#EEF1EE] lg:order-2">
						{heroVideo || heroImageSrc ? (
							<BrandingHeroMedia
								videoSrc={heroVideo}
								videoSource={data.hero.videoSource}
								imageSrc={heroImageSrc}
								className="aspect-[4/3] w-full lg:aspect-[5/4]"
								sizes="(max-width:1024px) 100vw, 420px"
								priority
								onImageClick={heroVideo ? undefined : () => openGallery(heroImageSrc)}
							/>
						) : (
							<div className="aspect-[4/3] w-full lg:aspect-[5/4]" aria-hidden />
						)}
					</div>

					<div className="lg:col-span-2 lg:hidden">
						<KazeBookingPanel
							data={data}
							listingPreview={listingPreview}
							propertyRef={propertyRef}
							guestCap={guestCap}
						/>
					</div>
				</div>
			</section>

			<div className="mx-auto max-w-6xl px-5 sm:px-8">
				<div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
					<div className="min-w-0 space-y-12 sm:space-y-14">
						{aboutLong ? (
							<KazeSection title="About this property" description={data.concept.eyebrow || undefined}>
								<p className="max-w-3xl font-[family-name:var(--preview-kaze-body)] text-[15px] leading-[1.8] text-[#5F665F]">
									{aboutLong}
								</p>
							</KazeSection>
						) : null}

						<KazeSection title="Property details">
							<BrandingStayDetailsSection stay={data.stay} variant="architectura" />
						</KazeSection>

						{data.welcome.html ? (
							<section className="rounded-2xl border border-[#E5E8E5] bg-[#F3F6F3] px-6 py-8 sm:px-9 sm:py-10">
								<BrandingRichTextBlock
									html={data.welcome.html}
									variant="architectura"
									className="font-[family-name:var(--preview-kaze-headline)] text-xl font-medium leading-[1.45] tracking-[-0.02em] text-[#1C211C] sm:text-[1.65rem] sm:leading-[1.4] [&_em]:text-[#2F5D44] [&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-[#2F5D44]"
								/>
							</section>
						) : null}

						<KazeSection title="Photo gallery" description="Explore the spaces included with your stay.">
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
						</KazeSection>

						{data.amenities.length > 0 ? (
							<KazeSection title="Amenities">
								<ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
									{data.amenities.map((a) => (
										<li key={`${a.id}-${a.label}`} className="flex gap-3">
											<AmenityGlyph id={a.id} className="mt-0.5 h-5 w-5 shrink-0 text-[#2F5D44]" />
											<div>
												<p className="font-[family-name:var(--preview-kaze-body)] text-sm font-semibold text-[#1C211C]">
													{a.label}
													{a.quantity ? ` · ${a.quantity}` : ''}
												</p>
												{a.description ? (
													<p className="mt-1 font-[family-name:var(--preview-kaze-body)] text-sm leading-relaxed text-[#5F665F]">
														{a.description}
													</p>
												) : null}
											</div>
										</li>
									))}
								</ul>
							</KazeSection>
						) : null}

						{data.videos.length > 0 ? (
							<KazeSection title="Video tour">
								<BrandingVideoSection videos={data.videos} variant="architectura" embedded />
							</KazeSection>
						) : null}

						{data.guestExtras.length > 0 ? (
							<KazeSection title="Optional extras">
								<BrandingGuestExtrasSection guestExtras={data.guestExtras} variant="architectura" embedded />
							</KazeSection>
						) : null}

						{data.houseRules.html ? (
							<KazeSection title="House rules">
								<BrandingRichTextBlock html={data.houseRules.html} variant="architectura" />
							</KazeSection>
						) : null}

						<KazeSection title="Location" description={data.location.eyebrow || undefined}>
							<div className="overflow-hidden rounded-xl bg-[#EEF1EE]">
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
										<h3 className="font-[family-name:var(--preview-kaze-body)] text-sm font-semibold text-[#1C211C]">
											{col.title}
										</h3>
										<p className="mt-2 font-[family-name:var(--preview-kaze-body)] text-sm leading-relaxed text-[#5F665F]">
											{col.text}
										</p>
									</div>
								))}
							</div>
						</KazeSection>

						{data.host.name.trim() ? (
							<KazeSection title="Your host">
								<div className="flex flex-col gap-5 sm:flex-row sm:items-start">
									{data.host.imageSrc.trim() ? (
										<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#EEF1EE]">
											<Image src={data.host.imageSrc} alt="" fill className="object-cover" sizes="64px" unoptimized />
										</div>
									) : null}
									<div className="min-w-0 flex-1">
										{data.host.label ? (
											<p className="font-[family-name:var(--preview-kaze-body)] text-xs font-medium uppercase tracking-[0.12em] text-[#2F5D44]">
												{data.host.label}
											</p>
										) : null}
										<p className="mt-1 font-[family-name:var(--preview-kaze-headline)] text-xl font-semibold text-[#1C211C]">
											{data.host.name}
										</p>
										{data.host.rating.trim() ? (
											<p className="mt-1 font-[family-name:var(--preview-kaze-body)] text-sm text-[#5F665F]">{data.host.rating}</p>
										) : null}
										{data.host.bio.trim() ? (
											<p className="mt-3 max-w-2xl font-[family-name:var(--preview-kaze-body)] text-[15px] leading-relaxed text-[#5F665F]">
												{data.host.bio}
											</p>
										) : null}
										{data.host.inquire ? (
											<button
												type="button"
												className="mt-4 inline-flex cursor-pointer items-center gap-1.5 font-[family-name:var(--preview-kaze-body)] text-sm font-semibold text-[#2F5D44] hover:text-[#244A36]"
											>
												{data.host.inquire}
												<ArrowRight className="h-4 w-4" aria-hidden />
											</button>
										) : null}
									</div>
								</div>
							</KazeSection>
						) : null}
					</div>

					<aside className="hidden lg:block">
						<div className="sticky top-24">
							<KazeBookingPanel
								data={data}
								listingPreview={listingPreview}
								propertyRef={propertyRef}
								guestCap={guestCap}
							/>
						</div>
					</aside>
				</div>
			</div>

			{data.gallery.full.src.trim() ? (
				<section className="mt-12 sm:mt-14">
					<button
						type="button"
						onClick={() => openGallery(data.gallery.full.src.trim())}
						className="group relative block w-full cursor-pointer"
					>
						<FillImg
							src={data.gallery.full.src}
							className="aspect-[21/9] max-h-[520px] w-full"
							sizes="100vw"
							imgClassName="transition duration-700 group-hover:scale-[1.01]"
						/>
						{data.gallery.full.caption ? (
							<p className="absolute bottom-4 left-5 font-[family-name:var(--preview-kaze-body)] text-xs font-medium text-white/90 sm:left-8">
								{data.gallery.full.caption}
							</p>
						) : null}
					</button>
				</section>
			) : null}

			<footer className="mt-14 border-t border-[#E5E8E5] bg-white sm:mt-16">
				<div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
					<div>
						<p className="font-[family-name:var(--preview-kaze-headline)] text-xl font-semibold text-[#1C211C]">
							{data.footer.wordmark}
						</p>
						{data.footer.tagline ? (
							<p className="mt-2 max-w-md font-[family-name:var(--preview-kaze-body)] text-sm text-[#5F665F]">
								{data.footer.tagline}
							</p>
						) : null}
					</div>
					{data.footer.links.length > 0 ? (
						<div className="flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--preview-kaze-body)] text-sm text-[#5F665F]">
							{data.footer.links.map((l) => (
								<span key={l.label}>{l.label}</span>
							))}
						</div>
					) : null}
				</div>
				<p className="mx-auto max-w-6xl px-5 pb-8 font-[family-name:var(--preview-kaze-body)] text-xs text-[#5F665F]/70 sm:px-8">
					{data.footer.copyright}
				</p>
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
