'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImageIcon, Maximize2, Trash2 } from 'lucide-react';
import { Button, ImageGalleryLightbox, Textarea, useToast, type ImageGalleryOriginRect } from '@/components/ui';
import {
	useDeletePropertyImage,
	useReorderPropertyImages,
	useUploadPropertyImages,
} from '@/features/property-images/hooks/use-property-images';
import type { PropertyImage } from '@/features/property-images/interfaces/property-image.interfaces';
import type { Property } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type StagedImage = {
	id: string;
	file: File;
	previewUrl: string;
	description: string;
};

type ImagesSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	/** Set after Basic info creates the property (create flow). */
	propertyId?: string;
};

/** Cover first, then remaining by `order` - every image appears exactly once. */
function displayImages(images: PropertyImage[]) {
	if (!images.length) return [];
	const byOrder = [...images].sort((a, b) => a.order - b.order);
	const cover = byOrder.find((i) => i.is_cover) ?? byOrder[0];
	return [cover, ...byOrder.filter((i) => i.id !== cover.id)];
}

export function ImagesSection({
	mode,
	initialProperty,
	propertyId: propertyIdProp,
}: ImagesSectionProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [fileZoneOver, setFileZoneOver] = useState(false);
	const [images, setImages] = useState<PropertyImage[]>(initialProperty?.images ?? []);
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const { push } = useToast();
	const [staged, setStaged] = useState<StagedImage[]>([]);
	const stagedPreviewUrlsRef = useRef(new Set<string>());
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const { mutateAsync: uploadImages, isPending: uploading } = useUploadPropertyImages(propertyId);
	const { mutateAsync: reorderImages, isPending: reordering } = useReorderPropertyImages(propertyId);
	const { mutateAsync: removeImage, isPending: deleting } = useDeletePropertyImage(propertyId);
	const saving = uploading || reordering || deleting;

	const ordered = useMemo(() => displayImages(images), [images]);
	const galleryUrls = useMemo(
		() => ordered.map((image) => image.document?.url ?? '').filter(Boolean),
		[ordered],
	);
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [galleryIndex, setGalleryIndex] = useState(0);
	const [galleryOrigin, setGalleryOrigin] = useState<ImageGalleryOriginRect | null>(null);

	const openGallery = useCallback(
		(imageId: string, origin: ImageGalleryOriginRect) => {
			const index = ordered.findIndex((image) => image.id === imageId);
			if (index < 0) return;
			setGalleryIndex(index);
			setGalleryOrigin(origin);
			setGalleryOpen(true);
		},
		[ordered],
	);

	const revokePreview = useCallback((url: string) => {
		URL.revokeObjectURL(url);
		stagedPreviewUrlsRef.current.delete(url);
	}, []);

	const addFiles = useCallback(
		(fileList: FileList | File[]) => {
			const next = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
			if (!next.length) return;
			setStaged((previous) => {
				const added: StagedImage[] = next.map((file) => {
					const previewUrl = URL.createObjectURL(file);
					stagedPreviewUrlsRef.current.add(previewUrl);
					return {
						id: crypto.randomUUID(),
						file,
						previewUrl,
						description: '',
					};
				});
				return [...previous, ...added];
			});
		},
		[],
	);

	const removeStaged = useCallback(
		(id: string) => {
			setStaged((previous) => {
				const item = previous.find((s) => s.id === id);
				if (item) revokePreview(item.previewUrl);
				return previous.filter((s) => s.id !== id);
			});
		},
		[revokePreview],
	);

	const setStagedDescription = useCallback((id: string, description: string) => {
		setStaged((previous) => previous.map((s) => (s.id === id ? { ...s, description } : s)));
	}, []);

	useEffect(
		() => () => {
			stagedPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
			stagedPreviewUrlsRef.current.clear();
		},
		[],
	);

	const handleSave = async () => {
		if (!propertyId) {
			push({ title: 'Save Basic info first to create the property.', tone: 'error' });
			return;
		}
		if (!staged.length) {
			push({ title: 'Select one or more images to upload.', tone: 'error' });
			return;
		}
		try {
			const created = await uploadImages({
				files: staged.map((s) => s.file),
				descriptions: staged.map((s) => s.description),
			});
			staged.forEach((s) => revokePreview(s.previewUrl));
			setStaged([]);
			setImages((previous) => [...previous, ...created].sort((a, b) => a.order - b.order));
			push({ title: 'Images uploaded.', tone: 'success' });
		} catch (submitError) {
			push({ title: submitError instanceof Error ? submitError.message : 'Could not upload images.', tone: 'error' });
		}
	};

	const onDrop = async (targetImageId: string) => {
		if (!draggingId || draggingId === targetImageId || !propertyId) return;
		const from = images.findIndex((item) => item.id === draggingId);
		const to = images.findIndex((item) => item.id === targetImageId);
		if (from < 0 || to < 0) return;

		const next = [...images];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		const normalized = next.map((item, index) => ({ ...item, order: index }));
		const coverImageId = normalized.find((image) => image.is_cover)?.id;

		try {
			const reordered = await reorderImages({
				reorder_ids: normalized.map((image) => image.id),
				cover_image_id: coverImageId,
			});
			setImages(reordered);
		} catch (submitError) {
			push({ title: submitError instanceof Error ? submitError.message : 'Could not reorder images.', tone: 'error' });
		}
	};

	const onSetCover = async (imageId: string) => {
		if (!propertyId) return;
		try {
			const reordered = await reorderImages({
				reorder_ids: images.map((image) => image.id),
				cover_image_id: imageId,
			});
			setImages(reordered);
			push({ title: 'Cover image updated.', tone: 'success' });
		} catch (submitError) {
			push({ title: submitError instanceof Error ? submitError.message : 'Could not update cover image.', tone: 'error' });
		}
	};

	const onDelete = async (imageId: string) => {
		try {
			await removeImage(imageId);
			setImages((previous) => previous.filter((image) => image.id !== imageId));
			push({ title: 'Image removed.', tone: 'success' });
		} catch (submitError) {
			push({ title: submitError instanceof Error ? submitError.message : 'Could not remove image.', tone: 'error' });
		}
	};

	return (
		<PropertyFormSection id="images" title="Images">
			<div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
				<div className="min-w-0 flex-1 space-y-8">
					<header className="flex flex-col gap-2">
						<div>
							<p className="mt-2 max-w-xl text-sm leading-relaxed text-espresso/65">
								Curate high-resolution visuals that define the atmosphere. Order sets the story visitors
								follow: lead with your strongest impression.
							</p>
						</div>
						<p className="text-[10px] font-medium uppercase tracking-[0.2em] text-espresso/45">
							Recommended 1920×1080
						</p>
					</header>

					{mode === 'create' && !propertyId ? (
						<p className="text-sm text-espresso/60">
							Save the property from Basic info first, then return here to import assets.
						</p>
					) : null}

					<div>
						<input
							ref={inputRef}
							id="property-images-upload"
							type="file"
							multiple
							accept="image/*"
							className="sr-only"
							onChange={(e) => {
								addFiles(e.target.files ?? []);
								e.target.value = '';
							}}
						/>
						<button
							type="button"
							onClick={() => inputRef.current?.click()}
							onDragOver={(e) => {
								e.preventDefault();
								setFileZoneOver(true);
							}}
							onDragLeave={() => setFileZoneOver(false)}
							onDrop={(e) => {
								e.preventDefault();
								setFileZoneOver(false);
								addFiles(e.dataTransfer.files);
							}}
							className={[
								'cursor-pointer flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-16 transition',
								fileZoneOver ? 'border-[#C45C26]/60 bg-[#C45C26]/[0.04]' : 'border-black/10 bg-white',
							].join(' ')}
						>
							<ImageIcon className="h-10 w-10 text-espresso/25" strokeWidth={1.25} />
							<div className="text-center">
								<p className="font-serif text-xl text-espresso">Import Visual Assets</p>
								<p className="mt-2 text-[10px] font-medium uppercase tracking-[0.28em] text-espresso/50">
									Click or drag files to this area
								</p>
							</div>
						</button>
						{staged.length > 0 ? (
							<p className="mt-2 text-xs text-espresso/55">
								{staged.length} image{staged.length === 1 ? '' : 's'} staged - add captions below, then Save.
							</p>
						) : null}
					</div>

					{staged.length > 0 ? (
						<div className="grid gap-4 sm:grid-cols-2">
							{staged.map((item) => (
								<div
									key={item.id}
									className="overflow-hidden rounded-xl border border-dashboard-border/60 bg-dashboard-inset shadow-sm shadow-black/5"
								>
									<div className="relative aspect-[4/3] bg-black/5">
										<img
											src={item.previewUrl}
											alt=""
											className="h-full w-full object-cover"
										/>
										<Button
											type="button"
											variant="ghostIcon"
											className="absolute right-2 top-2 h-9 w-9 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm"
											onClick={() => removeStaged(item.id)}
											aria-label="Remove from upload queue"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
									<div className="space-y-1.5 p-3">
										<label className="text-xs font-medium text-espresso" htmlFor={`staged-desc-${item.id}`}>
											Description
										</label>
										<Textarea
											id={`staged-desc-${item.id}`}
											value={item.description}
											onChange={(e) => setStagedDescription(item.id, e.target.value)}
											placeholder="Optional caption for this photo…"
											rows={2}
											className="min-h-[72px] resize-y text-sm"
										/>
									</div>
								</div>
							))}
						</div>
					) : null}

					{propertyId && ordered.length > 0 ? (
						<div className="space-y-4">
							<h3 className="font-serif text-lg text-espresso">Uploaded images</h3>
							<div className="grid gap-8 sm:grid-cols-2">
							{ordered.map((image, i) => (
								<figure
									key={image.id}
									className={['group relative', i === 0 ? 'sm:col-span-2' : ''].join(' ')}
								>
									<ImageTile
										image={image}
										variant={i === 0 ? 'hero' : 'grid'}
										draggingId={draggingId}
										onDragStart={setDraggingId}
										onDrop={onDrop}
										onSetCover={onSetCover}
										onDelete={onDelete}
										onOpenPreview={(origin) => openGallery(image.id, origin)}
									/>
								</figure>
							))}
							</div>
						</div>
					) : null}
				</div>

				{/* <aside className="w-full shrink-0 space-y-8 lg:w-[min(100%,280px)]">
					<div className="rounded-xl bg-dashboard-inset p-5">
						<h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-espresso/55">
							Image health
						</h3>
						<dl className="mt-4 divide-y divide-black/10 text-sm">
							<div className="flex justify-between gap-4 py-3 first:pt-0">
								<dt className="text-espresso/55">Resolution</dt>
								<dd className="font-medium text-[#C45C26]">Sharp</dd>
							</div>
							<div className="flex justify-between gap-4 py-3">
								<dt className="text-espresso/55">Aspect ratio</dt>
								<dd className="text-espresso/80">Balanced</dd>
							</div>
							<div className="flex justify-between gap-4 py-3">
								<dt className="text-espresso/55">Color profile</dt>
								<dd className="font-medium text-[#C45C26]">sRGB</dd>
							</div>
						</dl>
					</div>
					<div>
						<h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-espresso/55">
							Curation tips
						</h3>
						<p className="mt-3 text-sm italic leading-relaxed text-espresso/70">
							Lead with a single hero that communicates location and scale. Keep lighting consistent across the
							set so the listing feels like one coherent space.
						</p>
					</div>
				</aside> */}
			</div>
			<div className="mt-2 flex justify-end border-t border-black/5 pt-5">
				<Button
					type="button"
					onClick={() => void handleSave()}
					disabled={saving || (Boolean(propertyId) && !staged.length)}
					variant="primary"
				>
					{saving ? 'Saving...' : 'Save'}
				</Button>
			</div>
			<ImageGalleryLightbox
				images={galleryUrls}
				open={galleryOpen}
				initialIndex={galleryIndex}
				originRect={galleryOrigin}
				onClose={() => setGalleryOpen(false)}
			/>
		</PropertyFormSection>
	);
}

function ImageTile({
	image,
	variant,
	draggingId,
	onDragStart,
	onDrop,
	onSetCover,
	onDelete,
	onOpenPreview,
}: {
	image: PropertyImage;
	variant: 'hero' | 'grid';
	draggingId: string | null;
	onDragStart: (id: string) => void;
	onDrop: (id: string) => void;
	onSetCover: (id: string) => void;
	onDelete: (id: string) => void;
	onOpenPreview: (origin: ImageGalleryOriginRect) => void;
}) {
	const tileRef = useRef<HTMLDivElement>(null);
	const imageUrl = image.document?.url ?? '';
	const description = image.description?.trim();

	const openPreview = () => {
		if (!imageUrl) return;
		const rect = tileRef.current?.getBoundingClientRect();
		if (!rect) return;
		onOpenPreview({
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height,
		});
	};

	return (
		<>
			<div
				ref={tileRef}
				draggable
				onDragStart={() => onDragStart(image.id)}
				onDragOver={(e) => e.preventDefault()}
				onDrop={() => onDrop(image.id)}
				className={[
					'relative overflow-hidden rounded-xl bg-black/5 ring-1 ring-black/10',
					draggingId === image.id ? 'opacity-60' : 'opacity-100',
					variant === 'hero' ? 'aspect-[21/9] min-h-[220px]' : 'aspect-[4/3]',
				].join(' ')}
			>
				<div
					className="pointer-events-none absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
					style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
				/>
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-80" />
				{image.is_cover ? (
					<span className="absolute bottom-4 left-4 rounded-full bg-dashboard-surface/95 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-espresso">
						Hero asset
					</span>
				) : null}
				<div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition group-hover:opacity-100">
					<Button
						type="button"
						variant="ghostIcon"
						className="h-9 w-9 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm hover:bg-dashboard-surface"
						onClick={openPreview}
						aria-label="Preview photo"
					>
						<Maximize2 className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghostIcon"
						className="h-9 w-9 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm hover:bg-dashboard-surface"
						onClick={() => onDelete(image.id)}
						aria-label="Remove image"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
				{!image.is_cover ? (
					<div className="absolute bottom-4 right-4 z-10">
						<Button
							type="button"
							variant="secondary"
							className="rounded-full border-dashboard-border/40 bg-dashboard-surface/95 px-3 py-1.5 text-xs"
							onClick={() => onSetCover(image.id)}
						>
							Set as hero
						</Button>
					</div>
				) : null}
			</div>
			{description ? (
				<figcaption className="mt-4">
					<p className="text-sm leading-relaxed text-espresso/80">{description}</p>
				</figcaption>
			) : null}
		</>
	);
}
