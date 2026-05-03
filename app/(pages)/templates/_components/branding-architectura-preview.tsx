'use client';

import Image from 'next/image';
import { Manrope, Noto_Serif } from 'next/font/google';
import { ChevronDown, CircleUser, MapPin, Menu, Search, Star } from 'lucide-react';
import { cn } from '@/components/ui';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph, FillImg } from './branding-preview-shared';

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

export function ArchitecturaPreview({
	data,
	listingPreview,
}: {
	data: BrandingPreviewDemo;
	listingPreview?: boolean;
}) {
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
