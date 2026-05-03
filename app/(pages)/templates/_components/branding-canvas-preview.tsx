'use client';

import Image from 'next/image';
import { cn } from '@/components/ui';
import { MapPin, Menu, Star } from 'lucide-react';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph, FillImg } from './branding-preview-shared';

export function CanvasPreview({
	data,
	listingPreview,
}: {
	data: BrandingPreviewDemo;
	listingPreview?: boolean;
}) {
	const aboutLong = [data.concept.paragraphs[0], data.concept.paragraphs[1]].filter(Boolean).join(' ').trim();
	const showAboutLong = Boolean(aboutLong);
	const aboutShort = data.concept.title.trim();

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
					</div>
				</section>

				<div className="mx-auto max-w-6xl px-6 py-14 sm:px-10">
					{data.concept.eyebrow ? (
						<span className="text-[10px] uppercase tracking-widest text-[#6B705C]">{data.concept.eyebrow}</span>
					) : null}
					{showAboutLong ? (
						<p
							className={cn(
								'font-[family-name:var(--font-serif)] text-2xl leading-tight text-[#1A1A1A] sm:text-3xl',
								data.concept.eyebrow ? 'mt-2' : '',
								aboutShort ? 'mb-6' : '',
							)}
						>
							{aboutLong}
						</p>
					) : null}
					{aboutShort ? (
						<p
							className={cn(
								showAboutLong
									? 'max-w-2xl text-sm leading-relaxed text-[#1A1A1A]/65'
									: 'font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A] sm:text-3xl',
								!showAboutLong && data.concept.eyebrow ? 'mt-2' : '',
							)}
						>
							{data.concept.title}
						</p>
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
