'use client';

import Image from 'next/image';
import { Camera, ImagePlus, Loader2, Maximize2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import {
	Button,
	ConfirmationDialog,
	ImageGalleryLightbox,
	cn,
	useToast,
	type ImageGalleryOriginRect,
} from '@/components/ui';

const cloudinaryDisplayUrl = (url: string) => {
	if (!url.includes('res.cloudinary.com/')) return url;
	return url
		.replace('/upload/', '/upload/f_auto,q_auto/')
		.replace(/\.(avif|webp|jpe?g|png)$/i, '');
};

function formatMemberSince(iso: string) {
	return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(iso));
}

type ProfileVisualIdentityProps = {
	firstName: string;
	lastName: string;
	email: string;
	memberSince: string;
	monogram: string;
	avatarUrl: string | null;
	bannerUrl: string | null;
	uploadingAvatar: boolean;
	deletingAvatar: boolean;
	uploadingBanner: boolean;
	deletingBanner: boolean;
	onUploadAvatar: (file: File) => Promise<unknown>;
	onDeleteAvatar: () => Promise<unknown>;
	onUploadBanner: (file: File) => Promise<unknown>;
	onDeleteBanner: () => Promise<unknown>;
};

export function ProfileVisualIdentity({
	firstName,
	lastName,
	email,
	memberSince,
	monogram,
	avatarUrl,
	bannerUrl,
	uploadingAvatar,
	deletingAvatar,
	uploadingBanner,
	deletingBanner,
	onUploadAvatar,
	onDeleteAvatar,
	onUploadBanner,
	onDeleteBanner,
}: ProfileVisualIdentityProps) {
	const { push } = useToast();
	const bannerInputRef = useRef<HTMLInputElement>(null);
	const logoInputRef = useRef<HTMLInputElement>(null);
	const bannerTileRef = useRef<HTMLDivElement>(null);
	const logoTileRef = useRef<HTMLDivElement>(null);

	const [bannerOver, setBannerOver] = useState(false);
	const [logoOver, setLogoOver] = useState(false);
	const [confirmRemoveBanner, setConfirmRemoveBanner] = useState(false);
	const [confirmRemoveLogo, setConfirmRemoveLogo] = useState(false);
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [galleryImages, setGalleryImages] = useState<string[]>([]);
	const [galleryOrigin, setGalleryOrigin] = useState<ImageGalleryOriginRect | null>(null);

	const displayBanner = bannerUrl ? cloudinaryDisplayUrl(bannerUrl) : '';
	const displayLogo = avatarUrl ? cloudinaryDisplayUrl(avatarUrl) : '';
	const bannerBusy = uploadingBanner || deletingBanner;
	const logoBusy = uploadingAvatar || deletingAvatar;
	const fullName = `${firstName} ${lastName}`.trim();

	const uploadFile = useCallback(
		async (file: File | null, kind: 'banner' | 'logo') => {
			if (!file || !file.type.startsWith('image/')) {
				push({ title: 'Choose a valid image file.', tone: 'error' });
				return;
			}
			try {
				if (kind === 'banner') await onUploadBanner(file);
				else await onUploadAvatar(file);
				push({ title: kind === 'banner' ? 'Banner updated' : 'Logo updated', tone: 'success' });
			} catch (err) {
				push({
					title: err instanceof Error ? err.message : `Could not upload ${kind}`,
					tone: 'error',
				});
			}
		},
		[onUploadAvatar, onUploadBanner, push],
	);

	const removeImage = async (kind: 'banner' | 'logo') => {
		try {
			if (kind === 'banner') await onDeleteBanner();
			else await onDeleteAvatar();
			push({ title: kind === 'banner' ? 'Banner removed' : 'Logo removed', tone: 'success' });
		} catch (err) {
			push({
				title: err instanceof Error ? err.message : `Could not remove ${kind}`,
				tone: 'error',
			});
		}
	};

	const openGallery = (url: string, tile: HTMLDivElement | null) => {
		if (!url || !tile) return;
		const rect = tile.getBoundingClientRect();
		setGalleryImages([url]);
		setGalleryOrigin({
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height,
		});
		setGalleryOpen(true);
	};

	return (
		<motion.div
			className="dashboard-panel overflow-hidden rounded-[1.35rem]"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
		>
			<input
				ref={bannerInputRef}
				type="file"
				accept="image/*"
				className="sr-only"
				onChange={(event) => {
					void uploadFile(event.target.files?.[0] ?? null, 'banner');
					event.target.value = '';
				}}
			/>
			<input
				ref={logoInputRef}
				type="file"
				accept="image/*"
				className="sr-only"
				onChange={(event) => {
					void uploadFile(event.target.files?.[0] ?? null, 'logo');
					event.target.value = '';
				}}
			/>

			<div
				ref={bannerTileRef}
				className={cn(
					'group/banner relative isolate min-h-[11.5rem] overflow-hidden sm:min-h-[13.5rem]',
					!displayBanner && 'profile-banner-empty',
				)}
			>
				{displayBanner ? (
					<Image src={displayBanner} alt="Profile banner" fill className="object-cover" unoptimized priority />
				) : (
					<>
						<div
							className="absolute inset-0"
							style={{
								background:
									'radial-gradient(ellipse 90% 80% at 15% 20%, color-mix(in srgb, var(--color-camel) 18%, transparent), transparent 65%), radial-gradient(ellipse 70% 60% at 85% 80%, color-mix(in srgb, var(--color-espresso) 10%, transparent), transparent 60%)',
							}}
						/>
						<div className="profile-banner-stripes pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
					</>
				)}

				<div className="profile-canvas-grain pointer-events-none absolute inset-0 opacity-[0.22]" aria-hidden />
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dashboard-panel via-dashboard-panel/25 to-transparent" />

				<div
					role="button"
					tabIndex={0}
					aria-label={displayBanner ? 'Replace banner image' : 'Upload banner image'}
					className="absolute inset-0 z-[1] cursor-pointer"
					onClick={() => bannerInputRef.current?.click()}
					onKeyDown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							bannerInputRef.current?.click();
						}
					}}
					onDragOver={(event) => {
						event.preventDefault();
						setBannerOver(true);
					}}
					onDragLeave={() => setBannerOver(false)}
					onDrop={(event) => {
						event.preventDefault();
						setBannerOver(false);
						void uploadFile(event.dataTransfer.files[0] ?? null, 'banner');
					}}
				/>

				{!displayBanner ? (
					<div className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center gap-3 px-6 text-center">
						<motion.span
							className="flex h-11 w-11 items-center justify-center rounded-full border border-dashboard-border/80 bg-dashboard-surface/90 text-camel shadow-sm backdrop-blur-sm"
							animate={{ y: bannerOver ? -2 : 0 }}
							transition={{ duration: 0.2 }}
						>
							<ImagePlus className="h-5 w-5" strokeWidth={1.5} />
						</motion.span>
						<div>
							<p className="text-sm font-medium text-espresso/80">
								{bannerBusy ? 'Uploading cover…' : 'Add a cover image'}
							</p>
							<p className="mt-1 text-xs text-espresso/45">Drag wide imagery here · 1600×400 recommended</p>
						</div>
					</div>
				) : null}

				<div
					className={cn(
						'pointer-events-none absolute inset-0 z-[2] flex items-center justify-center bg-espresso/20 transition-opacity duration-200',
						bannerOver ? 'opacity-100' : 'opacity-0 group-hover/banner:opacity-100',
					)}
				>
					<span className="rounded-full border border-white/20 bg-dashboard-panel/90 px-4 py-2 text-xs font-medium tracking-wide text-espresso shadow-lg backdrop-blur-md">
						{bannerBusy ? 'Working…' : 'Release to replace cover'}
					</span>
				</div>

				<div className="pointer-events-none absolute right-4 top-4 z-[3]">
					<span className="inline-flex rounded-full border border-dashboard-border/70 bg-dashboard-panel/85 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-espresso/55 backdrop-blur-sm">
						Since {formatMemberSince(memberSince)}
					</span>
				</div>

				{displayBanner ? (
					<div className="absolute right-4 top-14 z-[4] flex gap-1.5 opacity-0 transition duration-200 group-hover/banner:opacity-100">
						<Button
							type="button"
							variant="ghostIcon"
							disabled={bannerBusy}
							className="pointer-events-auto h-9 rounded-full border border-dashboard-border/80 bg-dashboard-panel/95 px-3 text-xs text-espresso shadow-sm backdrop-blur-sm hover:bg-dashboard-surface"
							onClick={(event) => {
								event.stopPropagation();
								bannerInputRef.current?.click();
							}}
						>
							<Camera className="mr-1.5 h-3.5 w-3.5" />
							Replace
						</Button>
						<Button
							type="button"
							variant="ghostIcon"
							disabled={bannerBusy}
							className="pointer-events-auto h-9 w-9 rounded-full border border-dashboard-border/80 bg-dashboard-panel/95 text-espresso shadow-sm backdrop-blur-sm hover:text-red-600"
							onClick={(event) => {
								event.stopPropagation();
								openGallery(displayBanner, bannerTileRef.current);
							}}
							aria-label="View banner"
						>
							<Maximize2 className="h-4 w-4" />
						</Button>
						<Button
							type="button"
							variant="ghostIcon"
							disabled={bannerBusy}
							className="pointer-events-auto h-9 w-9 rounded-full border border-dashboard-border/80 bg-dashboard-panel/95 text-espresso shadow-sm backdrop-blur-sm hover:text-red-600"
							onClick={(event) => {
								event.stopPropagation();
								setConfirmRemoveBanner(true);
							}}
							aria-label="Remove banner"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				) : null}
			</div>

			<div className="relative px-5 pb-7 pt-0 sm:px-8 sm:pb-8">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div className="flex min-w-0 items-end gap-4 sm:gap-5">
						<div
							ref={logoTileRef}
							className={cn(
								'group/logo relative -mt-12 shrink-0 sm:-mt-14',
								logoOver && 'scale-[1.02]',
								'transition-transform duration-300',
							)}
						>
							<div
								role="button"
								tabIndex={0}
								aria-label={displayLogo ? 'Replace logo image' : 'Upload logo image'}
								className="relative h-[5.5rem] w-[5.5rem] cursor-pointer overflow-hidden rounded-full border-[3px] border-dashboard-panel shadow-[0_16px_48px_-20px_rgba(154,133,112,0.65)] sm:h-24 sm:w-24"
								onClick={() => logoInputRef.current?.click()}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										logoInputRef.current?.click();
									}
								}}
								onDragOver={(event) => {
									event.preventDefault();
									setLogoOver(true);
								}}
								onDragLeave={() => setLogoOver(false)}
								onDrop={(event) => {
									event.preventDefault();
									setLogoOver(false);
									void uploadFile(event.dataTransfer.files[0] ?? null, 'logo');
								}}
							>
								{displayLogo ? (
									<Image src={displayLogo} alt="Profile logo" fill className="object-cover" unoptimized />
								) : (
									<>
										<div className="logo-canvas-checker absolute inset-0" />
										<div className="absolute inset-0 flex items-center justify-center bg-dashboard-surface/75 font-serif text-2xl tracking-tight text-camel sm:text-3xl">
											{monogram}
										</div>
									</>
								)}

								<div
									className={cn(
										'absolute inset-0 flex items-center justify-center bg-espresso/45 transition-opacity duration-200',
										logoOver || logoBusy ? 'opacity-100' : 'opacity-0 group-hover/logo:opacity-100',
									)}
								>
									{logoBusy ? (
										<Loader2 className="h-5 w-5 animate-spin text-white" />
									) : (
										<span className="flex flex-col items-center gap-1 text-white">
											<Camera className="h-4 w-4" />
											<span className="text-[10px] font-medium uppercase tracking-[0.14em]">Logo</span>
										</span>
									)}
								</div>
							</div>

							{displayLogo ? (
								<div className="absolute -right-1 -top-1 z-10 flex gap-0.5 opacity-0 transition group-hover/logo:opacity-100">
									<Button
										type="button"
										variant="ghostIcon"
										disabled={logoBusy}
										className="h-7 w-7 rounded-full border border-dashboard-border bg-dashboard-panel text-espresso shadow-sm hover:bg-dashboard-surface"
										onClick={(event) => {
											event.stopPropagation();
											openGallery(displayLogo, logoTileRef.current);
										}}
										aria-label="View logo"
									>
										<Maximize2 className="h-3 w-3" />
									</Button>
									<Button
										type="button"
										variant="ghostIcon"
										disabled={logoBusy}
										className="h-7 w-7 rounded-full border border-dashboard-border bg-dashboard-panel text-espresso shadow-sm hover:text-red-600"
										onClick={(event) => {
											event.stopPropagation();
											setConfirmRemoveLogo(true);
										}}
										aria-label="Remove logo"
									>
										<Trash2 className="h-3 w-3" />
									</Button>
								</div>
							) : null}
						</div>

						<div className="min-w-0 pb-0.5">
							<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-camel">Your account</p>
							<h2 className="mt-1 break-words font-serif text-3xl tracking-tight text-espresso md:text-[2.35rem]">
								{fullName}
							</h2>
							<p className="mt-2 text-sm text-espresso/60">{email}</p>
						</div>
					</div>

					<div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
						<p className="text-[10px] font-medium uppercase tracking-[0.18em] text-espresso/40">Visual identity</p>
						<div className="flex gap-2">
							<span
								className={cn(
									'rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide',
									displayLogo ? 'bg-camel/15 text-camel' : 'bg-dashboard-inset text-espresso/45',
								)}
							>
								Logo {displayLogo ? 'set' : 'empty'}
							</span>
							<span
								className={cn(
									'rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide',
									displayBanner ? 'bg-camel/15 text-camel' : 'bg-dashboard-inset text-espresso/45',
								)}
							>
								Cover {displayBanner ? 'set' : 'empty'}
							</span>
						</div>
					</div>
				</div>

				<p className="mt-5 max-w-xl text-xs leading-relaxed text-espresso/45">
					Click or drag directly on the cover and logo to update them. PNG with transparency works best for your
					mark; wide photography or texture suits the banner.
				</p>
			</div>

			<ConfirmationDialog
				open={confirmRemoveBanner}
				title="Remove cover image?"
				description="Your profile header will return to the default gradient."
				confirmLabel="Remove"
				confirmVariant="danger"
				loading={deletingBanner}
				onCancel={() => setConfirmRemoveBanner(false)}
				onConfirm={() => {
					setConfirmRemoveBanner(false);
					void removeImage('banner');
				}}
			/>

			<ConfirmationDialog
				open={confirmRemoveLogo}
				title="Remove logo?"
				description="Your initials will show until you upload a new logo."
				confirmLabel="Remove"
				confirmVariant="danger"
				loading={deletingAvatar}
				onCancel={() => setConfirmRemoveLogo(false)}
				onConfirm={() => {
					setConfirmRemoveLogo(false);
					void removeImage('logo');
				}}
			/>

			<ImageGalleryLightbox
				open={galleryOpen}
				onClose={() => setGalleryOpen(false)}
				images={galleryImages}
				initialIndex={0}
				originRect={galleryOrigin}
			/>
		</motion.div>
	);
}
