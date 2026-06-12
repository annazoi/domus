'use client';

import Image from 'next/image';
import { Eye, ImageIcon, Maximize2, Sparkles, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	Button,
	ConfirmationDialog,
	ImageGalleryLightbox,
	Input,
	cn,
	useToast,
	type ImageGalleryOriginRect,
} from '@/components/ui';
import {
	PROPERTY_BRANDING_THEME_OPTIONS,
	PropertyBrandingTheme,
	brandingThemeToTemplateSlug,
} from '@/app/(pages)/templates/_constants/property-branding-theme';
import {
	useDeletePropertyLogo,
	usePatchPropertyBranding,
	useUploadPropertyLogo,
} from '@/features/property/hooks/use-property';
import type { Property } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type BrandingSectionProps = {
	initialProperty?: Property | null;
	propertyId?: string;
};

const cloudinaryDisplayUrl = (url: string) => {
	if (!url.includes('res.cloudinary.com/')) return url;
	return url
		.replace('/upload/', '/upload/f_auto,q_auto/')
		.replace(/\.(avif|webp|jpe?g|png)$/i, '');
};

export function BrandingSection({ initialProperty, propertyId: propertyIdProp }: BrandingSectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const logoInputRef = useRef<HTMLInputElement>(null);
	const logoTileRef = useRef<HTMLDivElement>(null);
	const { push } = useToast();
	const { mutateAsync: patchBranding, isPending: savingTheme } = usePatchPropertyBranding(propertyId);
	const { mutateAsync: uploadLogo, isPending: uploadingLogo } = useUploadPropertyLogo(propertyId);
	const { mutateAsync: removeLogo, isPending: deletingLogo } = useDeletePropertyLogo(propertyId);

	const [selected, setSelected] = useState<PropertyBrandingTheme>(
		initialProperty?.branding_theme ?? PropertyBrandingTheme.CANVAS,
	);
	const [logoUrl, setLogoUrl] = useState(initialProperty?.logo_url ?? '');
	const [logoAlt, setLogoAlt] = useState(initialProperty?.logo_alt ?? '');
	const [stagedLogoFile, setStagedLogoFile] = useState<File | null>(null);
	const [stagedLogoPreviewUrl, setStagedLogoPreviewUrl] = useState('');
	const [logoZoneOver, setLogoZoneOver] = useState(false);
	const [confirmRemoveLogoOpen, setConfirmRemoveLogoOpen] = useState(false);
	const [confirmDiscardStagedOpen, setConfirmDiscardStagedOpen] = useState(false);
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [galleryOrigin, setGalleryOrigin] = useState<ImageGalleryOriginRect | null>(null);

	useEffect(() => {
		if (initialProperty?.branding_theme) {
			setSelected(initialProperty.branding_theme);
		}
	}, [initialProperty?.id, initialProperty?.updated_at, initialProperty?.branding_theme]);

	useEffect(() => {
		setLogoUrl(initialProperty?.logo_url ?? '');
		setLogoAlt(initialProperty?.logo_alt ?? '');
		setStagedLogoFile(null);
		setStagedLogoPreviewUrl((previous) => {
			if (previous) URL.revokeObjectURL(previous);
			return '';
		});
	}, [initialProperty?.id, initialProperty?.updated_at, initialProperty?.logo_url, initialProperty?.logo_alt]);

	useEffect(
		() => () => {
			if (stagedLogoPreviewUrl) URL.revokeObjectURL(stagedLogoPreviewUrl);
		},
		[stagedLogoPreviewUrl],
	);

	const previewSlug = initialProperty?.slug?.trim();
	const saving = savingTheme || uploadingLogo || deletingLogo;
	const displayLogoUrl = stagedLogoPreviewUrl || (logoUrl ? cloudinaryDisplayUrl(logoUrl) : '');

	const addLogoFile = useCallback((file: File | null) => {
		if (!file || !file.type.startsWith('image/')) return;
		setStagedLogoFile(file);
		setStagedLogoPreviewUrl((previous) => {
			if (previous) URL.revokeObjectURL(previous);
			return URL.createObjectURL(file);
		});
	}, []);

	const clearStagedLogo = useCallback(() => {
		setStagedLogoFile(null);
		setStagedLogoPreviewUrl((previous) => {
			if (previous) URL.revokeObjectURL(previous);
			return '';
		});
	}, []);

	const openLogoPreview = useCallback(() => {
		if (!displayLogoUrl || !logoTileRef.current) return;
		const rect = logoTileRef.current.getBoundingClientRect();
		setGalleryOrigin({
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height,
		});
		setGalleryOpen(true);
	}, [displayLogoUrl]);

	const requestLogoDelete = useCallback(() => {
		if (stagedLogoFile) {
			setConfirmDiscardStagedOpen(true);
			return;
		}
		setConfirmRemoveLogoOpen(true);
	}, [stagedLogoFile]);

	const handleSave = async () => {
		if (!propertyId) {
			push({ title: 'Save Basic info first to create the property.', tone: 'error' });
			return;
		}
		try {
			if (stagedLogoFile) {
				const updated = await uploadLogo({ file: stagedLogoFile, alt: logoAlt });
				setLogoUrl(updated.logo_url ?? '');
				setLogoAlt(updated.logo_alt ?? '');
				clearStagedLogo();
			}
			const updated = await patchBranding({ branding_theme: selected, logo_alt: logoAlt.trim() || null });
			setLogoAlt(updated.logo_alt ?? '');
			push({ title: 'Branding saved.', tone: 'success' });
		} catch (err) {
			push({ title: err instanceof Error ? err.message : 'Could not save.', tone: 'error' });
		}
	};

	const handleRemoveLogo = async () => {
		if (!propertyId) return;
		try {
			const updated = await removeLogo();
			setLogoUrl(updated.logo_url ?? '');
			setLogoAlt(updated.logo_alt ?? '');
			clearStagedLogo();
			push({ title: 'Logo removed.', tone: 'success' });
		} catch (err) {
			push({ title: err instanceof Error ? err.message : 'Could not remove logo.', tone: 'error' });
		}
	};

	return (
		<PropertyFormSection id="branding" title="Branding">
			<p className="max-w-2xl text-sm leading-relaxed text-espresso/65">
				Choose a site template for this listing. Each design is fully customisable — swap photos, colors, and copy
				without touching code.
			</p>

			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dashboard-surface via-dashboard-inset to-dashboard-bg p-1 shadow-[var(--shadow-dashboard-panel)] ring-1 ring-dashboard-border">
				<div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-camel/10 blur-3xl" aria-hidden />
				<div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-espresso/[0.04] blur-3xl" aria-hidden />

				<div className="relative rounded-[1.35rem] bg-dashboard-panel/90 p-5 backdrop-blur-sm sm:p-6">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="min-w-0">
							<div className="flex items-center gap-2">
								<span className="flex h-7 w-7 items-center justify-center rounded-full bg-espresso text-white">
									<Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
								</span>
								<p className="text-sm font-medium tracking-tight text-espresso">Site logo</p>
							</div>
							<p className="mt-2 max-w-md text-sm leading-relaxed text-espresso/55">
								Your mark in the listing header. Horizontal SVG or PNG with a transparent background works best.
							</p>
						</div>
						
					</div>

					{!propertyId ? (
						<p className="mt-5 text-sm text-espresso/60">
							Save the property from Basic info first, then return here to add a logo.
						</p>
					) : (
						<div className="mt-5 space-y-4">
							<input
								ref={logoInputRef}
								id="property-logo-upload"
								type="file"
								accept="image/*"
								className="sr-only"
								onChange={(e) => {
									addLogoFile(e.target.files?.[0] ?? null);
									e.target.value = '';
								}}
							/>

							<div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
								<div
									className={cn(
										'group relative flex min-h-[196px] flex-col overflow-hidden rounded-2xl border-2 border-dashed transition duration-300',
										logoZoneOver
											? 'border-camel/50 bg-camel/[0.04]'
											: 'border-dashboard-border bg-dashboard-surface logo-canvas',
									)}
								>
									<div className="logo-canvas-checker absolute inset-0 opacity-80" aria-hidden />
									<div className="absolute inset-0 bg-gradient-to-br from-dashboard-surface/90 via-dashboard-inset/80 to-dashboard-bg/60" aria-hidden />

									<div
										role="button"
										tabIndex={0}
										aria-label={displayLogoUrl ? 'Replace logo file' : 'Upload logo file'}
										className="absolute inset-0 z-0 cursor-pointer"
										onClick={() => logoInputRef.current?.click()}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												logoInputRef.current?.click();
											}
										}}
										onDragOver={(e) => {
											e.preventDefault();
											setLogoZoneOver(true);
										}}
										onDragLeave={() => setLogoZoneOver(false)}
										onDrop={(e) => {
											e.preventDefault();
											setLogoZoneOver(false);
											addLogoFile(e.dataTransfer.files[0] ?? null);
										}}
									/>

									<div className="pointer-events-none relative z-[1] flex flex-1 items-center justify-center px-8 py-10">
										{displayLogoUrl ? (
											<div ref={logoTileRef} className="flex items-center justify-center">
												<Image
													src={displayLogoUrl}
													alt={logoAlt.trim() || initialProperty?.title || 'Property logo'}
													width={200}
													height={72}
													className="max-h-[72px] w-auto max-w-[min(100%,200px)] object-contain drop-shadow-sm transition duration-300 group-hover:scale-[1.02]"
													unoptimized
												/>
											</div>
										) : (
											<div className="flex flex-col items-center gap-3 text-center">
												<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashboard-border bg-dashboard-inset shadow-sm">
													<ImageIcon className="h-6 w-6 text-espresso/30" strokeWidth={1.5} />
												</div>
												<div>
													<p className="text-sm font-medium text-espresso/75">Drop your logo here</p>
													<p className="mt-1 text-xs text-espresso/40">or click to browse</p>
												</div>
											</div>
										)}
									</div>

									{displayLogoUrl ? (
										<div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition group-hover:opacity-100">
											<Button
												type="button"
												variant="ghostIcon"
												className="h-9 w-9 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm hover:bg-dashboard-surface"
												onClick={openLogoPreview}
												aria-label="View logo"
											>
												<Maximize2 className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												variant="ghostIcon"
												disabled={deletingLogo}
												className="h-9 w-9 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm hover:bg-dashboard-surface hover:text-red-600"
												onClick={requestLogoDelete}
												aria-label="Delete logo"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									) : null}

									<div
										className={cn(
											'pointer-events-none absolute inset-0 z-[2] flex items-center justify-center bg-camel/15 transition-opacity duration-200',
											logoZoneOver ? 'opacity-100' : 'opacity-0',
										)}
									>
										<span className="rounded-full border border-dashboard-border bg-dashboard-surface px-4 py-2 text-xs font-medium tracking-wide text-espresso shadow-sm">
											Release to upload
										</span>
									</div>
								</div>

								<div className="flex flex-col justify-between gap-4 rounded-2xl border border-dashboard-border bg-dashboard-inset/80 p-4 sm:p-5">
									<div className="space-y-3">
										<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-espresso/40">File</p>
										{displayLogoUrl ? (
											<div className="rounded-xl border border-dashboard-border bg-dashboard-surface px-3.5 py-3">
												<p className="truncate text-sm font-medium text-espresso">
													{stagedLogoFile?.name ?? 'Current logo'}
												</p>
												<p className="mt-0.5 text-xs text-espresso/45">Shown in listing header navigation</p>
											</div>
										) : (
											<div className="rounded-xl border border-dashed border-dashboard-border bg-dashboard-surface/70 px-3.5 py-3 text-sm text-dashboard-muted">
												No file selected yet
											</div>
										)}
										{stagedLogoFile ? (
											<p className="text-xs leading-relaxed text-espresso/55">
												<span className="font-medium text-espresso">{stagedLogoFile.name}</span> staged — hit Save branding
												below to publish.
											</p>
										) : null}
										<p className="text-xs leading-relaxed text-espresso/45">SVG, PNG, WebP · max recommended height 64px</p>
										{displayLogoUrl ? (
											<div className="space-y-1.5">
												<label htmlFor="logo-alt" className="text-xs font-medium text-espresso">
													Title
												</label>
												<Input
													id="logo-alt"
													type="text"
													value={logoAlt}
													onChange={(e) => setLogoAlt(e.target.value)}
													placeholder={initialProperty?.title ?? 'Describe the logo for screen readers'}
													className="text-sm"
												/>
												<p className="text-xs text-espresso/45">Used as the image alt on your listing site header.</p>
											</div>
										) : null}
									</div>
									<div className="flex flex-nowrap items-center gap-2">
										<Button
											type="button"
											variant="primary"
											className="shrink-0 rounded-full px-4"
											onClick={() => logoInputRef.current?.click()}
										>
											{displayLogoUrl ? 'Replace' : 'Browse'}
										</Button>
										{displayLogoUrl ? (
											<>
												<Button
													type="button"
													variant="cardRow"
													className="shrink-0 rounded-full px-4 max-w-fit flex items-center"
													onClick={openLogoPreview}
												>
													<Maximize2 className="mr-1.5 h-3.5 w-3.5" />
													View
												</Button>
												<Button
													type="button"
													variant="cardRow"
													className="shrink-0 rounded-full px-4 text-red-600 hover:text-red-700 max-w-fit flex items-center"
													onClick={requestLogoDelete}
													disabled={deletingLogo}
												>
													<Trash2 className="mr-1.5 h-3.5 w-3.5" />
													Delete
												</Button>
											</>
										) : null}
									</div>
								</div>
							</div>

						
						</div>
					)}
				</div>
			</div>

			<div className="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{PROPERTY_BRANDING_THEME_OPTIONS.map((option) => {
					const active = selected === option.id;
					return (
						<div
							key={option.id}
							className={cn(
								'flex flex-col overflow-hidden rounded-2xl border border-dashboard-border/60 bg-dashboard-inset transition',
								active ? 'border-camel ring-2 ring-camel/25' : 'border-dashboard-border hover:border-camel/30',
							)}
						>
							<div className="relative aspect-[4/5] w-full overflow-hidden bg-espresso/5">
								<Image
									src={option.image}
									alt={option.imageAlt}
									fill
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									className="object-cover"
								/>
								{active ? (
									<span className="absolute left-3 top-3 rounded-full bg-camel px-3 py-1 text-xs font-medium text-white">
										Selected
									</span>
								) : null}
							</div>
							<div className="flex flex-1 flex-col p-5 text-left">
								<p className="font-serif text-2xl tracking-tight text-espresso">{option.label}</p>
								<div className="mt-2 flex flex-wrap gap-2">
									{option.tags.map((tag) => (
										<span
											key={tag}
											className="rounded-full bg-espresso/[0.06] px-2.5 py-0.5 text-xs text-espresso/65"
										>
											{tag}
										</span>
									))}
								</div>
								<p className="mt-3 text-sm leading-relaxed text-espresso/55">{option.description}</p>
							</div>
							<div className="flex gap-2 px-4 pb-4 pt-1">
								<Button
									type="button"
									variant="cardRow"
									disabled={active}
									aria-pressed={active}
									onClick={() => setSelected(option.id)}
									className={cn(
										'flex max-w-fit justify-center text-center text-xs hover:!translate-y-0 active:!translate-y-0',
										active &&
											'pointer-events-none border-primary bg-primary text-white hover:border-primary hover:bg-primary disabled:opacity-100',
									)}
								>
									{active ? 'Selected' : 'Select'}
								</Button>
								<Button
									type="button"
									variant="cardRow"
									className="flex flex-1 justify-center gap-2 text-xs hover:!translate-y-0 active:!translate-y-0 max-w-fit"
									onClick={() => {
										const slug = brandingThemeToTemplateSlug(option.id);
										window.open(`/templates/${slug}`, '_blank', 'noopener,noreferrer');
									}}
								>
									<Eye className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
									Preview
								</Button>
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-2 flex flex-wrap justify-end gap-3 border-t border-dashboard-border pt-5">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : 'Save'}
				</Button>
				<Button
					type="button"
					variant="cardRow"
					disabled={!propertyId || !previewSlug}
					className="max-w-fit"
					onClick={() => {
						if (!previewSlug) return;
						window.open(`/${encodeURIComponent(previewSlug)}`, '_blank', 'noopener,noreferrer');
					}}
				>
					Preview listing
				</Button>
			</div>

			<ConfirmationDialog
				open={confirmRemoveLogoOpen}
				title="Delete logo?"
				description="The logo will be permanently removed from this property's branding site."
				confirmLabel="Delete"
				confirmVariant="danger"
				loading={deletingLogo}
				onCancel={() => setConfirmRemoveLogoOpen(false)}
				onConfirm={() => {
					void handleRemoveLogo().finally(() => setConfirmRemoveLogoOpen(false));
				}}
			/>
			<ConfirmationDialog
				open={confirmDiscardStagedOpen}
				title="Discard staged logo?"
				description="This file will be removed from the upload queue and will not be saved."
				confirmLabel="Discard"
				confirmVariant="danger"
				onCancel={() => setConfirmDiscardStagedOpen(false)}
				onConfirm={() => {
					clearStagedLogo();
					setConfirmDiscardStagedOpen(false);
				}}
			/>
			<ImageGalleryLightbox
				images={displayLogoUrl ? [displayLogoUrl] : []}
				open={galleryOpen}
				initialIndex={0}
				originRect={galleryOrigin}
				onClose={() => setGalleryOpen(false)}
			/>
		</PropertyFormSection>
	);
}
