'use client';

import Image from 'next/image';
import { MapPin, Menu, Star } from 'lucide-react';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';
import { AmenityGlyph } from './branding-preview-shared';

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
								<div className="relative mt-6 aspect-[21/10] w-full overflow-hidden rounded-2xl bg-[#d8d6d2] grayscale">
									{listingPreview && data.location.mapEmbedSrc ? (
										<iframe
											title="Property location"
											src={data.location.mapEmbedSrc}
											className="absolute inset-0 h-full w-full border-0"
											loading="lazy"
											referrerPolicy="no-referrer-when-downgrade"
											allowFullScreen
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

						<aside className="w-full shrink-0 lg:sticky lg:top-24 lg:mt-[-5.5rem] lg:w-[min(100%,340px)]">
							<div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-7">
								{listingPreview ? (
									<>
										<p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]/45">
											{data.booking.eyebrow}
										</p>
										<div className="mt-6 grid grid-cols-2 gap-4 border-t border-black/[0.06] pt-6">
											<div>
												<p className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">
													Check in
												</p>
												<p className="mt-1.5 text-sm font-medium">{data.booking.arrival || '—'}</p>
											</div>
											<div className="text-right">
												<p className="text-[9px] font-semibold uppercase tracking-wider text-[#1A1A1A]/40">
													Check out
												</p>
												<p className="mt-1.5 text-sm font-medium">{data.booking.departure || '—'}</p>
											</div>
										</div>
										<p className="mt-5 border-t border-black/[0.06] pt-5 text-sm text-[#1A1A1A]/75">{data.booking.guests}</p>
										{data.booking.price.trim() ? (
											<p className="mt-4 font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A]">
												{data.booking.price}{' '}
												<span className="text-sm font-normal text-[#1A1A1A]/45">{data.booking.per}</span>
											</p>
										) : null}
										<button
											type="button"
											className="mt-6 w-full rounded-xl bg-[#5c6149] py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#4d523e]"
										>
											{data.booking.cta}
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
