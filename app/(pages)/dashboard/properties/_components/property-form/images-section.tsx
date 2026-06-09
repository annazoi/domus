'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Film, ImageIcon, Link2, Maximize2, Play, Trash2 } from 'lucide-react';
import {
	Button,
	ConfirmationDialog,
	ImageGalleryLightbox,
	Input,
	Select,
	Textarea,
	useToast,
	VideoGalleryLightbox,
	type ImageGalleryOriginRect,
	type VideoGalleryItem,
} from '@/components/ui';
import {
	useDeletePropertyImage,
	useReorderPropertyImages,
	useUploadPropertyImages,
} from '@/features/property-images/hooks/use-property-images';
import type { PropertyImage } from '@/features/property-images/interfaces/property-image.interfaces';
import type { PropertyDocument } from '@/features/documents/interfaces/document.interface';
import type { Property } from '@/features/property/interfaces/property.interface';
import {
	VIDEO_URL_SOURCE_OPTIONS,
	detectVideoUrlSource,
	getVideoUrlSourceLabel,
	getVideoUrlSourcePlaceholder,
	getVideoUrlThumbnail,
	readVideoUrlSourceFromDocumentPath,
	resolveVideoUrlSource,
	type VideoUrlSource,
} from '@/lib/media/video-url';
import { PropertyFormSection } from './property-form-section';
import { VideoUrlPreview } from './video-url-preview';

type StagedFile = {
	id: string;
	kind: 'file';
	file: File;
	previewUrl: string;
	description: string;
	isVideo: boolean;
};

type StagedUrl = {
	id: string;
	kind: 'url';
	url: string;
	description: string;
	source: VideoUrlSource;
};

type StagedMedia = StagedFile | StagedUrl;

type ImagesSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	propertyId?: string;
};

const cloudinaryDisplayUrl = (url: string) => {
	if (!url.includes('res.cloudinary.com/')) return url;
	return url
		.replace('/upload/', '/upload/f_auto,q_auto/')
		.replace(/\.(avif|webp|jpe?g|png)$/i, '');
};

const isVideoDocument = (document: PropertyDocument | null | undefined) =>
	document?.type === 'VIDEO' || (document?.mimetype?.startsWith('video/') ?? false);

const isValidVideoUrl = (value: string) => {
	try {
		const parsed = new URL(value.trim());
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
};

const isExternalUrlVideo = (document: PropertyDocument | null | undefined) => {
	if (!isVideoDocument(document)) return false;
	const path = document?.path ?? '';
	return !path || path.startsWith('video-source:');
};

const resolveDocumentVideoSource = (document: PropertyDocument | null | undefined) => {
	const url = document?.url ?? '';
	return resolveVideoUrlSource(url, readVideoUrlSourceFromDocumentPath(document?.path));
};

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
	const [staged, setStaged] = useState<StagedMedia[]>([]);
	const stagedPreviewUrlsRef = useRef(new Set<string>());
	const [videoUrlDraft, setVideoUrlDraft] = useState('');
	const [videoUrlSourceDraft, setVideoUrlSourceDraft] = useState<VideoUrlSource | ''>('');
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const { mutateAsync: uploadImages, isPending: uploading } = useUploadPropertyImages(propertyId);
	const { mutateAsync: reorderImages, isPending: reordering } = useReorderPropertyImages(propertyId);
	const { mutateAsync: removeImage, isPending: deleting } = useDeletePropertyImage(propertyId);
	const saving = uploading || reordering || deleting;

	const ordered = useMemo(() => displayImages(images), [images]);
	const galleryUrls = useMemo(
		() =>
			ordered
				.filter((image) => !isVideoDocument(image.document))
				.map((image) => {
					const url = image.document?.url ?? '';
					return url ? cloudinaryDisplayUrl(url) : '';
				})
				.filter(Boolean),
		[ordered],
	);
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [galleryIndex, setGalleryIndex] = useState(0);
	const [galleryOrigin, setGalleryOrigin] = useState<ImageGalleryOriginRect | null>(null);
	const [stagedGalleryOpen, setStagedGalleryOpen] = useState(false);
	const [stagedGalleryIndex, setStagedGalleryIndex] = useState(0);
	const [stagedGalleryOrigin, setStagedGalleryOrigin] = useState<ImageGalleryOriginRect | null>(null);
	const [videoGalleryOpen, setVideoGalleryOpen] = useState(false);
	const [videoGalleryIndex, setVideoGalleryIndex] = useState(0);
	const [videoGalleryOrigin, setVideoGalleryOrigin] = useState<ImageGalleryOriginRect | null>(null);
	const [stagedVideoGalleryOpen, setStagedVideoGalleryOpen] = useState(false);
	const [stagedVideoGalleryIndex, setStagedVideoGalleryIndex] = useState(0);
	const [stagedVideoGalleryOrigin, setStagedVideoGalleryOrigin] = useState<ImageGalleryOriginRect | null>(null);
	const [stagedRemoveId, setStagedRemoveId] = useState<string | null>(null);
	const stagedPhotoUrls = useMemo(
		() =>
			staged
				.filter((item): item is StagedFile => item.kind === 'file' && !item.isVideo)
				.map((item) => item.previewUrl),
		[staged],
	);
	const stagedVideoItems = useMemo(
		() =>
			staged.flatMap((item) => {
				if (item.kind === 'file' && item.isVideo) {
					return [{ id: item.id, src: item.previewUrl }] satisfies (VideoGalleryItem & { id: string })[];
				}
				if (item.kind === 'url') {
					return [{ id: item.id, src: item.url, source: item.source }] satisfies (VideoGalleryItem & {
						id: string;
					})[];
				}
				return [];
			}),
		[staged],
	);
	const uploadedVideoItems = useMemo(
		() =>
			ordered
				.filter((image) => isVideoDocument(image.document))
				.map((image) => ({
					id: image.id,
					src: image.document?.url ?? '',
					source: resolveDocumentVideoSource(image.document),
				}))
				.filter((item) => item.src),
		[ordered],
	);

	const openGallery = useCallback(
		(imageId: string, origin: ImageGalleryOriginRect) => {
			const imageOnly = ordered.filter((image) => !isVideoDocument(image.document));
			const index = imageOnly.findIndex((image) => image.id === imageId);
			if (index < 0) return;
			setGalleryIndex(index);
			setGalleryOrigin(origin);
			setGalleryOpen(true);
		},
		[ordered],
	);

	const openStagedGallery = useCallback(
		(itemId: string, origin: ImageGalleryOriginRect) => {
			const photos = staged.filter((item): item is StagedFile => item.kind === 'file' && !item.isVideo);
			const index = photos.findIndex((item) => item.id === itemId);
			if (index < 0) return;
			setStagedGalleryIndex(index);
			setStagedGalleryOrigin(origin);
			setStagedGalleryOpen(true);
		},
		[staged],
	);

	const openGalleryVideo = useCallback(
		(imageId: string, origin: ImageGalleryOriginRect) => {
			const index = uploadedVideoItems.findIndex((item) => item.id === imageId);
			if (index < 0) return;
			setVideoGalleryIndex(index);
			setVideoGalleryOrigin(origin);
			setVideoGalleryOpen(true);
		},
		[uploadedVideoItems],
	);

	const openStagedVideoGallery = useCallback(
		(itemId: string, origin: ImageGalleryOriginRect) => {
			const index = stagedVideoItems.findIndex((item) => item.id === itemId);
			if (index < 0) return;
			setStagedVideoGalleryIndex(index);
			setStagedVideoGalleryOrigin(origin);
			setStagedVideoGalleryOpen(true);
		},
		[stagedVideoItems],
	);

	const revokePreview = useCallback((url: string) => {
		URL.revokeObjectURL(url);
		stagedPreviewUrlsRef.current.delete(url);
	}, []);

	const addFiles = useCallback((fileList: FileList | File[]) => {
		const next = Array.from(fileList).filter(
			(f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
		);
		if (!next.length) return;
		setStaged((previous) => {
			const added: StagedFile[] = next.map((file) => {
				const previewUrl = URL.createObjectURL(file);
				stagedPreviewUrlsRef.current.add(previewUrl);
				return {
					id: crypto.randomUUID(),
					kind: 'file',
					file,
					previewUrl,
					description: '',
					isVideo: file.type.startsWith('video/'),
				};
			});
			return [...previous, ...added];
		});
	}, []);

	const addVideoUrl = useCallback(() => {
		const url = videoUrlDraft.trim();
		if (!isValidVideoUrl(url)) {
			push({ title: 'Enter a valid http or https video URL.', tone: 'error' });
			return;
		}
		const source = videoUrlSourceDraft || detectVideoUrlSource(url);
		setStaged((previous) => [
			...previous,
			{
				id: crypto.randomUUID(),
				kind: 'url',
				url,
				description: '',
				source,
			},
		]);
		setVideoUrlDraft('');
		setVideoUrlSourceDraft('');
	}, [push, videoUrlDraft, videoUrlSourceDraft]);

	const removeStaged = useCallback(
		(id: string) => {
			setStaged((previous) => {
				const item = previous.find((s) => s.id === id);
				if (item?.kind === 'file') revokePreview(item.previewUrl);
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
			push({ title: 'Add images, videos, or a video URL to upload.', tone: 'error' });
			return;
		}
		const fileItems = staged.filter((item): item is StagedFile => item.kind === 'file');
		const urlItems = staged.filter((item): item is StagedUrl => item.kind === 'url');
		try {
			const created = await uploadImages({
				files: fileItems.map((s) => s.file),
				descriptions: fileItems.map((s) => s.description),
				urlEntries: urlItems.map((s) => ({
					url: s.url,
					description: s.description,
					source: s.source,
				})),
			});
			fileItems.forEach((s) => revokePreview(s.previewUrl));
			setStaged([]);
			setImages((previous) => [...previous, ...created].sort((a, b) => a.order - b.order));
			push({ title: 'Media uploaded.', tone: 'success' });
		} catch (submitError) {
			push({
				title: submitError instanceof Error ? submitError.message : 'Could not upload media.',
				tone: 'error',
			});
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
			push({ title: 'Media removed.', tone: 'success' });
		} catch (submitError) {
			push({ title: submitError instanceof Error ? submitError.message : 'Could not remove media.', tone: 'error' });
		}
	};

	const stagedCountLabel = useMemo(() => {
		const files = staged.filter((s) => s.kind === 'file').length;
		const urls = staged.filter((s) => s.kind === 'url').length;
		const parts: string[] = [];
		if (files) parts.push(`${files} file${files === 1 ? '' : 's'}`);
		if (urls) parts.push(`${urls} URL${urls === 1 ? '' : 's'}`);
		return parts.join(' · ');
	}, [staged]);

	return (
		<PropertyFormSection id="images" title="Images & Video">
			<div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
				<div className="min-w-0 flex-1 space-y-8">
					<header className="flex flex-col gap-2">
						<div>
							<p className="mt-2 max-w-xl text-sm leading-relaxed text-espresso/65">
								Curate high-resolution visuals and motion that define the atmosphere. Order sets the story
								visitors follow — lead with your strongest impression.
							</p>
						</div>
						<p className="text-[10px] font-medium uppercase tracking-[0.2em] text-espresso/45">
							Photos 1920×1080 · Video MP4, WebM, MOV
						</p>
					</header>

					{mode === 'create' && !propertyId ? (
						<p className="text-sm text-espresso/60">
							Save the property from Basic info first, then return here to import assets.
						</p>
					) : null}

					<div className="space-y-5">
						<input
							ref={inputRef}
							id="property-images-upload"
							type="file"
							multiple
							accept="image/*,video/*"
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
							<div className="flex items-center gap-3">
								<ImageIcon className="h-9 w-9 text-espresso/25" strokeWidth={1.25} />
								<Film className="h-9 w-9 text-espresso/25" strokeWidth={1.25} />
							</div>
							<div className="text-center">
								<p className="font-serif text-xl text-espresso">Import Visual Assets</p>
								<p className="mt-2 text-[10px] font-medium uppercase tracking-[0.28em] text-espresso/50">
									Photos & video files - click or drag
								</p>
							</div>
						</button>

						<div className="rounded-xl border border-black/10 p-5 bg-dashboard-inset">
							<div className="flex flex-col gap-4">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Link2 className="h-4 w-4 text-espresso/40" strokeWidth={2} />
										<p className="font-serif text-base text-espresso">Import video from URL</p>
									</div>
									<p className="text-sm leading-relaxed text-espresso/55">
										Choose the host, paste the link, then stage it for upload.
									</p>
								</div>
								<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
									<div className="space-y-1.5 sm:w-44 sm:shrink-0">
										<label htmlFor="video-url-source" className="text-xs font-medium text-espresso">
											Video source
										</label>
										<Select
											id="video-url-source"
											variant="dashboard"
											value={videoUrlSourceDraft}
											onChange={(event) => setVideoUrlSourceDraft(event.target.value as VideoUrlSource | '')}
										>
											<option value="">Auto-detect</option>
											{VIDEO_URL_SOURCE_OPTIONS.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</Select>
									</div>
									<div className="min-w-0 flex-1 space-y-1.5">
										<label htmlFor="video-url-input" className="text-xs font-medium text-espresso">
											Video URL
										</label>
										<Input
											id="video-url-input"
											type="url"
											value={videoUrlDraft}
											onChange={(e) => {
												const nextUrl = e.target.value;
												setVideoUrlDraft(nextUrl);
												if (!videoUrlSourceDraft && nextUrl.trim()) {
													setVideoUrlSourceDraft(detectVideoUrlSource(nextUrl));
												}
											}}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													addVideoUrl();
												}
											}}
											placeholder={getVideoUrlSourcePlaceholder(
												videoUrlSourceDraft || detectVideoUrlSource(videoUrlDraft),
											)}
											className="border-black/8 bg-white/90 font-mono text-sm placeholder:font-sans placeholder:text-espresso/35"
										/>
									</div>
									<Button
										type="button"
										variant="secondary"
										onClick={addVideoUrl}
										disabled={!videoUrlDraft.trim()}
										className="w-full shrink-0 rounded-full px-5 text-sm sm:w-auto"
									>
										Stage URL
									</Button>
								</div>
								
							</div>
						</div>

						{staged.length > 0 ? (
							<p className="text-xs text-espresso/55">
								{stagedCountLabel} staged — add captions below, then Save.
							</p>
						) : null}
					</div>

					{staged.length > 0 ? (
						<div className="grid gap-4 sm:grid-cols-2">
							{staged.map((item) => (
								<StagedMediaTile
									key={item.id}
									item={item}
									onOpenPhotoPreview={(origin) => openStagedGallery(item.id, origin)}
									onOpenVideoPreview={(origin) => openStagedVideoGallery(item.id, origin)}
									onRemove={() => setStagedRemoveId(item.id)}
									onDescriptionChange={(description) => setStagedDescription(item.id, description)}
								/>
							))}
						</div>
					) : null}

					{propertyId && ordered.length > 0 ? (
						<div className="space-y-4">
							<h3 className="font-serif text-lg text-espresso">Uploaded media</h3>
							<div className="grid gap-8 sm:grid-cols-2">
								{ordered.map((image, i) => (
									<figure
										key={image.id}
										className={['group relative', i === 0 ? 'sm:col-span-2' : ''].join(' ')}
									>
										<MediaTile
											image={image}
											variant={i === 0 ? 'hero' : 'grid'}
											draggingId={draggingId}
											deleting={deleting}
											onDragStart={setDraggingId}
											onDrop={onDrop}
											onSetCover={onSetCover}
											onConfirmDelete={() => onDelete(image.id)}
											onOpenPhotoPreview={(origin) => openGallery(image.id, origin)}
											onOpenVideoPreview={(origin) => openGalleryVideo(image.id, origin)}
										/>
									</figure>
								))}
							</div>
						</div>
					) : null}
				</div>
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
			<ImageGalleryLightbox
				images={stagedPhotoUrls}
				open={stagedGalleryOpen}
				initialIndex={stagedGalleryIndex}
				originRect={stagedGalleryOrigin}
				onClose={() => setStagedGalleryOpen(false)}
			/>
			<VideoGalleryLightbox
				videos={uploadedVideoItems}
				open={videoGalleryOpen}
				initialIndex={videoGalleryIndex}
				originRect={videoGalleryOrigin}
				onClose={() => setVideoGalleryOpen(false)}
			/>
			<VideoGalleryLightbox
				videos={stagedVideoItems}
				open={stagedVideoGalleryOpen}
				initialIndex={stagedVideoGalleryIndex}
				originRect={stagedVideoGalleryOrigin}
				onClose={() => setStagedVideoGalleryOpen(false)}
			/>
			<ConfirmationDialog
				open={stagedRemoveId !== null}
				title="Remove from upload queue?"
				description="This item will be removed from the staged media waiting to upload."
				confirmLabel="Remove"
				confirmVariant="danger"
				onCancel={() => setStagedRemoveId(null)}
				onConfirm={() => {
					if (stagedRemoveId) removeStaged(stagedRemoveId);
					setStagedRemoveId(null);
				}}
			/>
		</PropertyFormSection>
	);
}

function StagedMediaTile({
	item,
	onOpenPhotoPreview,
	onOpenVideoPreview,
	onRemove,
	onDescriptionChange,
}: {
	item: StagedMedia;
	onOpenPhotoPreview: (origin: ImageGalleryOriginRect) => void;
	onOpenVideoPreview: (origin: ImageGalleryOriginRect) => void;
	onRemove: () => void;
	onDescriptionChange: (description: string) => void;
}) {
	const tileRef = useRef<HTMLDivElement>(null);
	const isPhoto = item.kind === 'file' && !item.isVideo;
	const isVideo = item.kind === 'url' || (item.kind === 'file' && item.isVideo);

	const openPreviewFromRect = (handler: (origin: ImageGalleryOriginRect) => void) => {
		const rect = tileRef.current?.getBoundingClientRect();
		if (!rect) return;
		handler({
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height,
		});
	};

	return (
		<div className="overflow-hidden rounded-xl border border-dashboard-border/60 bg-dashboard-inset shadow-sm shadow-black/5">
			<div ref={tileRef} className="group relative aspect-[4/3] bg-black/5">
				{item.kind === 'file' ? (
					item.isVideo ? (
						<video
							src={item.previewUrl}
							className="h-full w-full object-cover"
							muted
							playsInline
							preload="metadata"
						/>
					) : (
						<img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
					)
				) : (
					<VideoUrlPreview url={item.url} source={item.source} />
				)}
				{item.kind === 'file' ? (
					<span className="absolute left-3 top-3 rounded-full bg-dashboard-surface/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-espresso">
						{item.isVideo ? 'Video' : 'Photo'}
					</span>
				) : null}
				<div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition group-hover:opacity-100">
					{isPhoto ? (
						<Button
							type="button"
							variant="ghostIcon"
							className="h-9 w-9 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm"
							onClick={() => openPreviewFromRect(onOpenPhotoPreview)}
							aria-label="Preview photo"
						>
							<Maximize2 className="h-4 w-4" />
						</Button>
					) : null}
					{isVideo ? (
						<Button
							type="button"
							variant="ghostIcon"
							className="h-9 w-9 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm"
							onClick={() => openPreviewFromRect(onOpenVideoPreview)}
							aria-label="Preview video"
						>
							<Maximize2 className="h-4 w-4" />
						</Button>
					) : null}
					<Button
						type="button"
						variant="ghostIcon"
						className="h-9 w-9 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm"
						onClick={onRemove}
						aria-label="Remove from upload queue"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>
			<div className="space-y-1.5 p-3">
				<label className="text-xs font-medium text-espresso" htmlFor={`staged-desc-${item.id}`}>
					Description
				</label>
				<Textarea
					id={`staged-desc-${item.id}`}
					value={item.description}
					onChange={(e) => onDescriptionChange(e.target.value)}
					placeholder="Optional caption…"
					rows={2}
					className="min-h-[72px] resize-y text-sm"
				/>
			</div>
		</div>
	);
}

function MediaTile({
	image,
	variant,
	draggingId,
	deleting,
	onDragStart,
	onDrop,
	onSetCover,
	onConfirmDelete,
	onOpenPhotoPreview,
	onOpenVideoPreview,
}: {
	image: PropertyImage;
	variant: 'hero' | 'grid';
	draggingId: string | null;
	deleting: boolean;
	onDragStart: (id: string) => void;
	onDrop: (id: string) => void;
	onSetCover: (id: string) => void;
	onConfirmDelete: () => Promise<void>;
	onOpenPhotoPreview: (origin: ImageGalleryOriginRect) => void;
	onOpenVideoPreview: (origin: ImageGalleryOriginRect) => void;
}) {
	const tileRef = useRef<HTMLDivElement>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const mediaUrl = image.document?.url ?? '';
	const displayUrl = mediaUrl && !isVideoDocument(image.document) ? cloudinaryDisplayUrl(mediaUrl) : mediaUrl;
	const isVideo = isVideoDocument(image.document);
	const isUrlVideo = isExternalUrlVideo(image.document);
	const videoSource = resolveDocumentVideoSource(image.document);
	const videoThumbnail = isUrlVideo && mediaUrl ? getVideoUrlThumbnail(mediaUrl, videoSource) : null;
	const description = image.description?.trim();

	const openPhotoPreview = () => {
		if (!displayUrl || isVideo) return;
		const rect = tileRef.current?.getBoundingClientRect();
		if (!rect) return;
		onOpenPhotoPreview({
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height,
		});
	};

	const openVideoPreview = () => {
		if (!isVideo || !mediaUrl) return;
		const rect = tileRef.current?.getBoundingClientRect();
		if (!rect) return;
		onOpenVideoPreview({
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
				{displayUrl ? (
					isVideo ? (
						isUrlVideo && videoThumbnail ? (
							<img
								src={videoThumbnail}
								alt=""
								className="pointer-events-none absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
							/>
						) : (
							<video
								src={displayUrl}
								className="pointer-events-none absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
								muted
								playsInline
								preload="metadata"
								loop={!isUrlVideo}
								autoPlay={!isUrlVideo}
							/>
						)
					) : (
						<img
							src={displayUrl}
							alt=""
							className="pointer-events-none absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
						/>
					)
				) : null}
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-80" />
				{isVideo ? (
					<span className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
						<Play className="h-5 w-5 fill-current" />
					</span>
				) : null}
				{image.is_cover ? (
					<span className="absolute bottom-4 left-4 rounded-full bg-dashboard-surface/95 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-espresso">
						Hero asset
					</span>
				) : null}
				{isVideo ? (
					<span className="absolute left-4 top-4 rounded-full bg-dashboard-surface/95 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-espresso">
						{isUrlVideo ? getVideoUrlSourceLabel(videoSource) : 'Video'}
					</span>
				) : null}
				<div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition group-hover:opacity-100">
					{!isVideo ? (
						<Button
							type="button"
							variant="ghostIcon"
							className="h-9 w-9 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm hover:bg-dashboard-surface"
							onClick={openPhotoPreview}
							aria-label="Preview photo"
						>
							<Maximize2 className="h-4 w-4" />
						</Button>
					) : (
						<Button
							type="button"
							variant="ghostIcon"
							className="h-9 w-9 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm hover:bg-dashboard-surface"
							onClick={openVideoPreview}
							aria-label="Preview video"
						>
							<Maximize2 className="h-4 w-4" />
						</Button>
					)}
					<Button
						type="button"
						variant="ghostIcon"
						disabled={deleting}
						className="h-9 w-9 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm hover:bg-dashboard-surface"
						onClick={() => setConfirmOpen(true)}
						aria-label="Remove media"
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

			<ConfirmationDialog
				open={confirmOpen}
				title="Remove this media?"
				description="This photo or video will be permanently deleted from the property. This cannot be undone."
				confirmLabel="Remove"
				confirmVariant="danger"
				loading={deleting}
				onCancel={() => setConfirmOpen(false)}
				onConfirm={() => {
					void onConfirmDelete().finally(() => setConfirmOpen(false));
				}}
			/>
		</>
	);
}
