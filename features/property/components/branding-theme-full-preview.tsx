'use client';

import Image from 'next/image';
import { Manrope, Noto_Serif } from 'next/font/google';
import {
	ChevronDown,
	CircleUser,
	Flame,
	MapPin,
	Menu,
	Search,
	Star,
	UtensilsCrossed,
	Waves,
	Wifi,
	Wine,
	Sparkles,
} from 'lucide-react';
import { cn } from '@/components/ui';
import type { PropertyBrandingTheme } from '@/features/property/constants/property-branding-theme';
import { PropertyBrandingTheme as Theme } from '@/features/property/constants/property-branding-theme';
import type { BrandingPreviewDemo } from './branding-preview-demo';
import { getBrandingPreviewDemo } from './branding-preview-demo';

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

function AmenityGlyph({
	id,
	className,
}: {
	id: BrandingPreviewDemo['amenities'][number]['id'];
	className?: string;
}) {
	const iconClass = cn('h-8 w-8', className);
	switch (id) {
		case 'pool':
			return <Waves strokeWidth={1.25} className={iconClass} />;
		case 'fire':
			return <Flame strokeWidth={1.25} className={iconClass} />;
		case 'utensils':
			return <UtensilsCrossed strokeWidth={1.25} className={iconClass} />;
		case 'spa':
			return <Sparkles strokeWidth={1.25} className={iconClass} />;
		case 'wine':
			return <Wine strokeWidth={1.25} className={iconClass} />;
		case 'wifi':
			return <Wifi strokeWidth={1.25} className={iconClass} />;
		default:
			return null;
	}
}

function FillImg({
	src,
	className,
	sizes,
	imgClassName,
}: {
	src: string;
	className: string;
	sizes: string;
	imgClassName?: string;
}) {
	if (!src.trim()) return null;
	return (
		<div className={cn('relative overflow-hidden', className)}>
			<Image src={src} alt="" fill className={cn('object-cover', imgClassName)} sizes={sizes} unoptimized />
		</div>
	);
}

function ArchitecturaPreview({ data, listingPreview }: { data: BrandingPreviewDemo; listingPreview?: boolean }) {
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
							<h2 className="mb-6 font-[family-name:var(--preview-arch-headline)] text-2xl font-semibold leading-tight text-[#1b1c1a] sm:text-3xl lg:text-4xl">
								{data.concept.title}
							</h2>
							<div className="max-w-2xl space-y-4 text-base leading-relaxed text-[#55433d] sm:text-lg">
								{data.concept.paragraphs[0] ? <p>{data.concept.paragraphs[0]}</p> : null}
								{data.concept.paragraphs[1] ? <p>{data.concept.paragraphs[1]}</p> : null}
							</div>
						</section>

						<section className="space-y-12">
							{data.gallery.large.src.trim() ||
							data.gallery.stack[0].src.trim() ||
							data.gallery.stack[1].src.trim() ? (
								<div className="grid grid-cols-12 items-end gap-4">
									{data.gallery.large.src.trim() ? (
										<div className="col-span-12 sm:col-span-8">
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
										</div>
									) : null}
									{data.gallery.stack[0].src.trim() || data.gallery.stack[1].src.trim() ? (
										<div className="col-span-12 grid gap-4 sm:col-span-4 sm:translate-y-6">
											<FillImg
												src={data.gallery.stack[0].src}
												className="aspect-square w-full rounded-sm"
												sizes="200px"
											/>
											<FillImg
												src={data.gallery.stack[1].src}
												className="aspect-[3/4] w-full rounded-sm"
												sizes="200px"
											/>
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
							{listingPreview && data.location.mapEmbedSrc ? (
								<div className="relative aspect-video w-full overflow-hidden rounded-sm bg-[#efeeeb] grayscale contrast-125">
									<iframe
										title="Property location"
										src={data.location.mapEmbedSrc}
										className="absolute inset-0 h-full w-full border-0"
										loading="lazy"
										referrerPolicy="no-referrer-when-downgrade"
										allowFullScreen
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
					</div>

					<div className="lg:col-span-5">
						<div className="lg:sticky lg:top-24">
							<div className="border border-[#dbc1b9]/30 bg-white p-6 shadow-[0_20px_50px_rgba(27,28,26,0.06)] sm:p-8 lg:p-10">
								{listingPreview ? (
									<>
										<span className="font-[family-name:var(--preview-arch-body)] text-[10px] uppercase tracking-widest text-[#944528]">
											{data.booking.eyebrow}
										</span>
										<div className="mt-6 space-y-6 border-t border-[#dbc1b9]/40 pt-6">
											<div className="grid grid-cols-2 gap-4 border-b border-[#dbc1b9]/40 pb-4">
												<div>
													<span className="text-[9px] uppercase tracking-tighter text-[#1b1c1a]/50">
														Check-in
													</span>
													<p className="mt-1 text-sm font-medium">{data.booking.arrival}</p>
												</div>
												<div className="text-right">
													<span className="text-[9px] uppercase tracking-tighter text-[#1b1c1a]/50">
														Check-out
													</span>
													<p className="mt-1 text-sm font-medium">{data.booking.departure}</p>
												</div>
											</div>
											<div>
												<span className="text-[9px] uppercase tracking-tighter text-[#1b1c1a]/50">
													Capacity
												</span>
												<p className="mt-1 text-sm font-medium">{data.booking.guests}</p>
											</div>
										</div>
										<button
											type="button"
											className="mt-8 w-full rounded-sm bg-[#944528] py-4 font-[family-name:var(--preview-arch-body)] text-[11px] uppercase tracking-widest text-white transition hover:bg-[#b35c3d]"
										>
											{data.booking.cta}
										</button>
									</>
								) : (
									<>
										<div className="mb-8 flex items-baseline justify-between gap-4">
											<div>
												<span className="font-[family-name:var(--preview-arch-body)] text-[10px] uppercase tracking-widest text-[#944528]">
													{data.booking.eyebrow}
												</span>
												<h3 className="mt-1 font-[family-name:var(--preview-arch-headline)] text-2xl font-bold sm:text-3xl">
													{data.booking.price}{' '}
													<span className="text-sm font-normal text-[#1b1c1a]/40">{data.booking.per}</span>
												</h3>
											</div>
											<div className="flex items-center gap-1 text-sm">
												<Star className="h-4 w-4 fill-current text-[#944528]" aria-hidden />
												<span className="font-semibold">{data.booking.rating}</span>
											</div>
										</div>
										<div className="mb-8 space-y-6">
											<div className="grid grid-cols-2 gap-4 border-b border-[#dbc1b9]/40 pb-4">
												<div>
													<span className="text-[9px] uppercase tracking-tighter text-[#1b1c1a]/50">
														Arrival
													</span>
													<p className="mt-1 text-sm font-medium">{data.booking.arrival}</p>
												</div>
												<div className="text-right">
													<span className="text-[9px] uppercase tracking-tighter text-[#1b1c1a]/50">
														Departure
													</span>
													<p className="mt-1 text-sm font-medium">{data.booking.departure}</p>
												</div>
											</div>
											<div className="border-b border-[#dbc1b9]/40 pb-4">
												<span className="text-[9px] uppercase tracking-tighter text-[#1b1c1a]/50">
													Curated For
												</span>
												<div className="mt-1 flex items-center justify-between text-sm font-medium">
													<span>{data.booking.guests}</span>
													<ChevronDown className="h-4 w-4 opacity-50" />
												</div>
											</div>
										</div>
										<div className="mb-8 space-y-3 text-sm text-[#55433d]">
											<div className="flex justify-between">
												<span>{data.booking.lines[0].label}</span>
												<span>{data.booking.lines[0].value}</span>
											</div>
											<div className="flex justify-between">
												<span>{data.booking.lines[1].label}</span>
												<span>{data.booking.lines[1].value}</span>
											</div>
											<div className="flex justify-between border-t border-[#dbc1b9]/25 pt-3 font-bold text-[#1b1c1a]">
												<span>{data.booking.totalLabel}</span>
												<span>{data.booking.total}</span>
											</div>
										</div>
										<button
											type="button"
											className="w-full rounded-sm bg-[#944528] py-4 font-[family-name:var(--preview-arch-body)] text-[11px] uppercase tracking-widest text-white transition hover:bg-[#b35c3d]"
										>
											{data.booking.cta}
										</button>
										<p className="mt-4 text-center font-[family-name:var(--preview-arch-body)] text-[10px] uppercase tracking-widest text-[#1b1c1a]/40">
											{data.booking.disclaimer}
										</p>
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
		</div>
	);
}

function CanvasPreview({ data, listingPreview }: { data: BrandingPreviewDemo; listingPreview?: boolean }) {
	return (
		<div className="bg-[#F7F5F2] text-[#1A1A1A] antialiased selection:bg-[#6B705C]/15">
			<header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/[0.06] bg-[#F7F5F2]/95 px-4 py-4 backdrop-blur-md sm:px-8">
				<span className="truncate font-[family-name:var(--font-serif)] text-lg tracking-tight text-[#1A1A1A]">
					{data.wordmark}
				</span>
				{data.nav.length > 0 ? (
					<nav className="hidden gap-8 text-xs uppercase tracking-[0.2em] sm:flex">
						{data.nav.map((item) => (
							<span key={item.label} className={item.current ? 'font-semibold text-[#6B705C]' : 'text-[#1A1A1A]/55'}>
								{item.label}
							</span>
						))}
					</nav>
				) : (
					<span className="hidden sm:block" />
				)}
				{listingPreview ? <span className="w-5 sm:hidden" aria-hidden /> : <Menu className="h-5 w-5 text-[#1A1A1A]/45 sm:hidden" />}
			</header>

			<main>
				<section className="grid gap-0 lg:grid-cols-2">
					<div className="relative min-h-[240px] lg:min-h-[320px]">
						{data.hero.imageSrc.trim() ? (
							<Image
								src={data.hero.imageSrc}
								alt=""
								fill
								className="object-cover"
								sizes="(max-width: 1024px) 100vw, 50vw"
								unoptimized
							/>
						) : (
							<div className="absolute inset-0 bg-[#dcdad6]" aria-hidden />
						)}
						<div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent lg:bg-gradient-to-r" aria-hidden />
					</div>
					<div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:py-16">
						{data.hero.series ? (
							<p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-[#6B705C]">{data.hero.series}</p>
						) : null}
						<h1 className="mt-3 font-[family-name:var(--font-serif)] text-3xl leading-tight tracking-tight sm:text-4xl">
							{data.hero.title}
						</h1>
						{data.hero.location ? (
							<p className="mt-4 flex items-center gap-2 text-sm text-[#1A1A1A]/50">
								<MapPin className="h-4 w-4 text-[#6B705C]" />
								{data.hero.location}
							</p>
						) : null}
						{data.concept.paragraphs[0] ? (
							<p className="mt-6 text-sm leading-relaxed text-[#1A1A1A]/65">{data.concept.paragraphs[0]}</p>
						) : null}
					</div>
				</section>

				<div className="mx-auto max-w-6xl px-6 py-14 sm:px-10">
					{data.concept.eyebrow ? (
						<span className="text-[10px] uppercase tracking-widest text-[#6B705C]">{data.concept.eyebrow}</span>
					) : null}
					<h2 className="mt-2 font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A] sm:text-3xl">{data.concept.title}</h2>
					{data.concept.paragraphs[1] ? (
						<p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#1A1A1A]/65">{data.concept.paragraphs[1]}</p>
					) : null}

					{data.gallery.large.src.trim() ||
					data.gallery.stack[0].src.trim() ||
					data.gallery.stack[1].src.trim() ? (
						<div className="mt-12 grid gap-8 lg:grid-cols-12">
							{data.gallery.large.src.trim() ? (
								<div className="lg:col-span-7">
									<FillImg
										src={data.gallery.large.src}
										className="aspect-[4/5] rounded-xl bg-black/5"
										sizes="(max-width: 1024px) 100vw, 58vw"
									/>
									{data.gallery.large.caption ? (
										<p className="mt-3 text-[10px] uppercase tracking-widest text-[#1A1A1A]/40">
											{data.gallery.large.caption}
										</p>
									) : null}
								</div>
							) : null}
							{data.gallery.stack[0].src.trim() || data.gallery.stack[1].src.trim() ? (
								<div className="flex flex-col gap-4 lg:col-span-5">
									<FillImg
										src={data.gallery.stack[0].src}
										className="aspect-[5/4] rounded-xl"
										sizes="400px"
									/>
									<FillImg
										src={data.gallery.stack[1].src}
										className="aspect-[4/5] rounded-xl"
										sizes="400px"
									/>
								</div>
							) : null}
						</div>
					) : null}

					{data.gallery.full.src.trim() ? (
						<div className="relative mt-10 h-[200px] overflow-hidden rounded-xl sm:h-[260px]">
							<Image src={data.gallery.full.src} alt="" fill className="object-cover" sizes="100vw" unoptimized />
							{data.gallery.full.pullQuote.title || data.gallery.full.pullQuote.text ? (
								<div className="absolute bottom-4 left-4 max-w-sm rounded-lg bg-white/95 p-4 shadow-lg backdrop-blur-sm">
									{data.gallery.full.pullQuote.title ? (
										<h3 className="font-[family-name:var(--font-serif)] text-lg text-[#1A1A1A]">
											{data.gallery.full.pullQuote.title}
										</h3>
									) : null}
									{data.gallery.full.pullQuote.text ? (
										<p className="mt-1 text-xs leading-relaxed text-[#1A1A1A]/65">{data.gallery.full.pullQuote.text}</p>
									) : null}
								</div>
							) : null}
						</div>
					) : null}

					{data.amenities.length > 0 ? (
						<section className="mt-14">
							<span className="text-[10px] uppercase tracking-widest text-[#6B705C]">Amenities</span>
							<div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-3">
								{data.amenities.map((a) => (
									<div key={a.label} className="flex flex-col gap-2">
										<AmenityGlyph id={a.id} className="text-[#6B705C]" />
										<span className="text-xs font-medium text-[#1A1A1A]">{a.label}</span>
									</div>
								))}
							</div>
						</section>
					) : null}

					<section className="mt-14">
						<span className="text-[10px] uppercase tracking-widest text-[#6B705C]">{data.location.eyebrow}</span>
						{listingPreview && data.location.mapEmbedSrc ? (
							<div className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl bg-[#cfcfcd] grayscale contrast-125">
								<iframe
									title="Property location"
									src={data.location.mapEmbedSrc}
									className="absolute inset-0 h-full w-full border-0"
									loading="lazy"
									referrerPolicy="no-referrer-when-downgrade"
									allowFullScreen
								/>
							</div>
						) : (
							<div className="relative mt-4 aspect-video overflow-hidden rounded-xl bg-[#cfcfcd]">
								{data.location.mapImage.trim() ? (
									<Image
										src={data.location.mapImage}
										alt=""
										fill
										className="object-cover opacity-90"
										sizes="100vw"
										unoptimized
									/>
								) : null}
								<div className="absolute inset-0 flex items-center justify-center bg-black/25">
									{data.location.coords ? (
										<p className="font-[family-name:var(--font-serif)] text-lg text-white">{data.location.coords}</p>
									) : listingPreview ? null : (
										<p className="font-[family-name:var(--font-serif)] text-lg text-white">—</p>
									)}
								</div>
							</div>
						)}
						<div className="mt-6 grid gap-6 sm:grid-cols-2">
							{data.location.columns.map((c) => (
								<div key={c.title}>
									<h5 className="font-medium text-[#1A1A1A]">{c.title}</h5>
									<p className="mt-1 text-sm text-[#1A1A1A]/60">{c.text}</p>
								</div>
							))}
						</div>
					</section>

					<div className="mt-14 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm sm:p-8">
						{listingPreview ? (
							<>
								<p className="text-[10px] uppercase tracking-widest text-[#6B705C]">{data.booking.eyebrow}</p>
								<div className="mt-4 grid grid-cols-2 gap-4 border-t border-black/[0.06] pt-6 text-sm">
									<div>
										<p className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/45">Check-in</p>
										<p className="mt-1 font-medium">{data.booking.arrival}</p>
									</div>
									<div className="text-right">
										<p className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/45">Check-out</p>
										<p className="mt-1 font-medium">{data.booking.departure}</p>
									</div>
								</div>
								<p className="mt-4 text-sm text-[#1A1A1A]/80">{data.booking.guests}</p>
								<button
									type="button"
									className="mt-6 w-full rounded-full bg-[#6B705C] py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#5a5f4e]"
								>
									{data.booking.cta}
								</button>
							</>
						) : (
							<>
								<div className="flex flex-wrap items-end justify-between gap-4">
									<div>
										<p className="text-[10px] uppercase tracking-widest text-[#6B705C]">{data.booking.eyebrow}</p>
										<p className="mt-1 font-[family-name:var(--font-serif)] text-3xl text-[#1A1A1A]">
											{data.booking.price}{' '}
											<span className="text-sm font-normal text-[#1A1A1A]/45">{data.booking.per}</span>
										</p>
									</div>
									<div className="flex items-center gap-1 text-sm">
										<Star className="h-4 w-4 fill-[#6B705C] text-[#6B705C]" />
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
									className="mt-6 w-full rounded-full bg-[#6B705C] py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#5a5f4e]"
								>
									{data.booking.cta}
								</button>
								<p className="mt-3 text-center text-[10px] text-[#1A1A1A]/45">{data.booking.disclaimer}</p>
								<div className="mt-6 flex items-center gap-3 border-t border-black/[0.06] pt-6">
									<div className="relative h-11 w-11 overflow-hidden rounded-full">
										<Image src={data.host.imageSrc} alt="" fill className="object-cover" sizes="44px" unoptimized />
									</div>
									<div>
										<p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/45">{data.host.label}</p>
										<p className="text-sm font-medium">{data.host.name}</p>
									</div>
									<button type="button" className="ml-auto text-xs font-semibold uppercase tracking-wide text-[#6B705C]">
										{data.host.inquire}
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			</main>

			<footer className="mt-12 border-t border-black/[0.06] px-6 py-10 sm:px-10">
				<div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
					<div>
						<span className="font-[family-name:var(--font-serif)] font-semibold">{data.footer.wordmark}</span>
						{data.footer.tagline ? (
							<span className="ml-2 text-[10px] uppercase tracking-[0.15em] text-[#1A1A1A]/40">{data.footer.tagline}</span>
						) : null}
					</div>
					{data.footer.links.length > 0 ? (
						<div className="flex gap-8 text-[10px] uppercase tracking-[0.12em] text-[#1A1A1A]/45">
							{data.footer.links.map((l) => (
								<span key={l.label}>{l.label}</span>
							))}
						</div>
					) : null}
					<p className="text-[10px] uppercase tracking-[0.12em] text-[#1A1A1A]/35">{data.footer.copyright}</p>
				</div>
			</footer>
		</div>
	);
}

export type BrandingThemeFullPreviewProps = {
	theme: PropertyBrandingTheme;
	/** Override demo copy and imagery when wiring real property data. */
	data?: BrandingPreviewDemo;
	className?: string;
	/** Omit demo pricing, nav, map photos, and decorative filler — show listing fields only. */
	listingPreview?: boolean;
};

export function BrandingThemeFullPreview({
	theme,
	data: dataProp,
	className,
	listingPreview,
}: BrandingThemeFullPreviewProps) {
	const data = dataProp ?? getBrandingPreviewDemo(theme);

	return (
		<div className={cn('min-h-0', className)}>
			{theme === Theme.ARCHITECTURA ? (
				<ArchitecturaPreview data={data} listingPreview={listingPreview} />
			) : (
				<CanvasPreview data={data} listingPreview={listingPreview} />
			)}
		</div>
	);
}
