'use client';

import Image from 'next/image';
import { Monitor, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Select, Skeleton } from '@/components/ui';
import { useProperties } from '@/features/property/hooks/use-property';
import type { Property } from '@/features/property/interfaces/property.interface';

function htmlToPlainText(html: string): string {
	if (!html) return '';
	if (typeof document !== 'undefined') {
		const doc = new DOMParser().parseFromString(html, 'text/html');
		const t = doc.body.textContent ?? '';
		return t.replace(/\s+/g, ' ').trim();
	}
	return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function excerpt(text: string, max: number) {
	const t = text.trim();
	if (t.length <= max) return t;
	return `${t.slice(0, max).trimEnd()}…`;
}

function coverUrl(p: Property) {
	const cover = p.images.find((i) => i.is_cover) ?? p.images[0];
	return cover?.document?.url ?? null;
}

function labelPropertyType(raw: string) {
	if (!raw) return 'Stay';
	return raw
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function WebsiteBuilderClient() {
	const { data: properties = [], isLoading } = useProperties();
	const [selectedId, setSelectedId] = useState('');

	useEffect(() => {
		if (!properties.length) {
			setSelectedId('');
			return;
		}
		const still = properties.some((p) => p.id === selectedId);
		if (!selectedId || !still) setSelectedId(properties[0]!.id);
	}, [properties, selectedId]);

	const current = useMemo(
		() => properties.find((p) => p.id === selectedId) ?? null,
		[properties, selectedId],
	);

	const [asymmetric, setAsymmetric] = useState(true);
	const [verticalPad, setVerticalPad] = useState(120);
	const [imageShare, setImageShare] = useState(58);
	const [view, setView] = useState<'desktop' | 'mobile'>('desktop');

	const previewMax = view === 'desktop' ? 'min(100%, 56rem)' : 'min(100%, 22rem)';

	const body = current
		? excerpt(
				htmlToPlainText(current.short_description?.trim() || current.description || ''),
				320,
			)
		: '';
	const img = current ? coverUrl(current) : null;
	const kicker = current
		? [labelPropertyType(current.property_type), current.city].filter(Boolean).join(' · ')
		: '';
	const chip = current ? (current.city || labelPropertyType(current.property_type)) : '';

	return (
		<div className="flex min-h-[calc(100vh-6rem)] flex-col gap-0 rounded-2xl border border-black/[0.06] bg-white/50 shadow-sm lg:flex-row">
			<aside className="flex w-full shrink-0 flex-col gap-8 border-b border-black/[0.06] p-5 lg:w-[min(100%,18rem)] lg:border-b-0 lg:border-r lg:p-6">
				<div>
					<p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]/45">Current page</p>
					{isLoading ? (
						<Skeleton className="mt-2 h-10 w-full bg-black/10" />
					) : (
						<Select
							variant="compact"
							className="mt-2"
							value={selectedId}
							onChange={(e) => setSelectedId(e.target.value)}
							disabled={!properties.length}
							aria-label="Property page preview"
						>
							{properties.length === 0 ? (
								<option value="">No properties yet</option>
							) : (
								properties.map((p) => (
									<option key={p.id} value={p.id}>
										Property detail - {p.title}
									</option>
								))
							)}
						</Select>
					)}
				</div>

				<div className="space-y-4">
					<p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]/45">Layout</p>
					<label className="flex cursor-pointer items-center gap-3 text-sm text-[#1A1A1A]/85">
						<Checkbox checked={asymmetric} onChange={(e) => setAsymmetric(e.target.checked)} className="accent-camel" />
						Asymmetric image
					</label>
					<div>
						<div className="flex justify-between text-xs text-[#1A1A1A]/50">
							<span>Vertical padding</span>
							<span className="font-medium tabular-nums text-camel">{verticalPad}px</span>
						</div>
						<input
							type="range"
							min={48}
							max={180}
							value={verticalPad}
							onChange={(e) => setVerticalPad(Number(e.target.value))}
							className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-camel"
						/>
					</div>
					<div>
						<div className="flex justify-between text-xs text-[#1A1A1A]/50">
							<span>Image emphasis</span>
							<span className="font-medium tabular-nums text-camel">{imageShare}%</span>
						</div>
						<input
							type="range"
							min={42}
							max={68}
							value={imageShare}
							onChange={(e) => setImageShare(Number(e.target.value))}
							className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-camel"
						/>
					</div>
				</div>

				<div className="mt-auto space-y-2 border-t border-black/[0.06] pt-6">
					<Button type="button" variant="primarySm" className="w-full" disabled={!current}>
						Publish changes
					</Button>
					<Button type="button" variant="cardRow" className="w-full justify-center text-xs">
						Open live site
					</Button>
				</div>
			</aside>

			<div className="relative flex min-h-[28rem] flex-1 flex-col bg-[#EBE9E4]">
				<div className="flex flex-1 items-center justify-center overflow-auto p-4 md:p-8">
					{!isLoading && !current ? (
						<p className="max-w-sm text-center text-sm text-[#1A1A1A]/55">
							Add a property to preview how it will look on your site.
						</p>
					) : isLoading ? (
						<div className="w-full max-w-3xl space-y-4">
							<Skeleton className="h-10 w-40 bg-black/10" />
							<Skeleton className="h-6 w-80 max-w-full bg-black/10" />
							<Skeleton className="h-56 w-full rounded-xl bg-black/10" />
						</div>
					) : current ? (
						<div
							className="relative w-full transition-[max-width] duration-300 ease-out"
							style={{ maxWidth: previewMax }}
						>
							<div
								className="overflow-hidden rounded-xl bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]"
								style={asymmetric ? { paddingBottom: '2.5rem' } : undefined}
							>
								<div
									className="flex flex-col gap-6 md:flex-row md:items-stretch"
									style={{
										paddingTop: verticalPad,
										paddingBottom: asymmetric ? verticalPad * 0.65 : verticalPad,
										paddingLeft: view === 'mobile' ? '1.25rem' : '2.5rem',
										paddingRight: view === 'mobile' ? '1.25rem' : '2.5rem',
									}}
								>
									<div
										className="flex min-w-0 flex-col justify-center md:pr-4"
										style={{ flex: `1 1 ${100 - imageShare}%` }}
									>
										<p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-camel">{kicker}</p>
										<h2 className="mt-3 font-serif text-2xl leading-tight tracking-tight text-[#1A1A1A] md:text-3xl">
											{current.title}
										</h2>
										<p className="mt-2 text-xs text-[#1A1A1A]/45">
											{current.max_guests} guests · {current.bedrooms} bedrooms · {current.beds} beds ·{' '}
											{current.bathrooms} baths
										</p>
										<p className="mt-4 text-sm leading-relaxed text-[#1A1A1A]/65">{body}</p>
										<button
											type="button"
											className="mt-6 inline-flex w-fit items-center gap-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-camel transition hover:text-camel-dark"
										>
											Check availability <span aria-hidden>→</span>
										</button>
									</div>
									<div
										className="relative min-h-[200px] shrink-0 md:min-h-[280px]"
										style={{
											flex: `1 1 ${imageShare}%`,
											transform: asymmetric ? 'translateY(12px)' : undefined,
										}}
									>
										<div className="relative overflow-hidden rounded-lg">
											{img ? (
												<Image
													src={img}
													alt=""
													width={960}
													height={1200}
													unoptimized
													className="h-auto max-h-[min(52vh,420px)] w-full object-cover md:max-h-none md:min-h-[300px]"
													sizes="(max-width: 768px) 100vw, 480px"
												/>
											) : (
												<div className="flex min-h-[200px] w-full items-center justify-center bg-camel/10 text-sm text-[#1A1A1A]/45 md:min-h-[300px]">
													No photo yet
												</div>
											)}
										</div>
										{chip ? (
											<div className="absolute bottom-3 left-3 max-w-[85%] rounded bg-white px-3 py-2 shadow-sm">
												<p className="truncate text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-camel">
													{chip}
												</p>
											</div>
										) : null}
									</div>
								</div>
							</div>
						</div>
					) : null}
				</div>

				<div className="flex shrink-0 justify-center border-t border-black/[0.06] bg-[#F7F5F2]/90 px-4 py-3 backdrop-blur-sm">
					<div className="inline-flex rounded-full border border-black/[0.08] bg-white/90 p-1 shadow-sm">
						<button
							type="button"
							onClick={() => setView('desktop')}
							className={[
								'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide transition',
								view === 'desktop' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/55 hover:text-[#1A1A1A]',
							].join(' ')}
						>
							<Monitor className="h-4 w-4" aria-hidden />
							Desktop
						</button>
						<button
							type="button"
							onClick={() => setView('mobile')}
							className={[
								'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide transition',
								view === 'mobile' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/55 hover:text-[#1A1A1A]',
							].join(' ')}
						>
							<Smartphone className="h-4 w-4" aria-hidden />
							Mobile
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
