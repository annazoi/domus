'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { ImageIcon, Maximize2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import type { PropertyImage } from '@/features/property/interfaces/property.interface';

type ImagesSectionProps = {
	mode: 'create' | 'edit';
	initialPropertyId?: string;
	images: PropertyImage[];
	imageFiles: File[];
	draggingId: string | null;
	onImageFilesChange: (files: File[]) => void;
	onDragStart: (imageId: string) => void;
	onDrop: (targetImageId: string) => void;
	onSetCover: (imageId: string) => void;
	onDelete: (imageId: string) => void;
};

const SUBLABELS = [
	'EXTERIOR - GOLDEN HOUR',
	'INTERIOR - NATURAL LIGHT',
	'GALLERY - DETAIL',
	'AMBIENT - EVENING',
	'SPACE - WIDE ANGLE',
];

/** Cover first, then remaining by `order` — every image appears exactly once. */
function displayImages(images: PropertyImage[]) {
	if (!images.length) return [];
	const byOrder = [...images].sort((a, b) => a.order - b.order);
	const cover = byOrder.find((i) => i.is_cover) ?? byOrder[0];
	return [cover, ...byOrder.filter((i) => i.id !== cover.id)];
}

export function ImagesSection({
	mode,
	initialPropertyId,
	images,
	imageFiles,
	draggingId,
	onImageFilesChange,
	onDragStart,
	onDrop,
	onSetCover,
	onDelete,
}: ImagesSectionProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [fileZoneOver, setFileZoneOver] = useState(false);

	const ordered = useMemo(() => displayImages(images), [images]);

	const addFiles = useCallback(
		(fileList: FileList | File[]) => {
			const next = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
			if (next.length) onImageFilesChange(next);
		},
		[onImageFilesChange],
	);

	return (
		<section id="images" className="scroll-mt-24">
			<div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
				<div className="min-w-0 flex-1 space-y-8">
					<header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<h2 className="font-serif text-3xl tracking-tight text-[#1A1A1A] md:text-4xl">
								Curation Workshop
							</h2>
							<p className="mt-2 max-w-xl text-sm leading-relaxed text-[#1A1A1A]/65">
								Curate high-resolution visuals that define the atmosphere. Order sets the story visitors
								follow: lead with your strongest impression.
							</p>
						</div>
						<p className="shrink-0 text-[10px] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]/45">
							Recommended 1920×1080
						</p>
					</header>

					{mode === 'create' ? (
						<p className="text-sm italic text-[#1A1A1A]/60">
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
								fileZoneOver ? 'border-[#C45C26]/60 bg-[#C45C26]/[0.04]' : 'border-black/15 bg-stone-50/80',
							].join(' ')}
						>
							<ImageIcon className="h-10 w-10 text-[#1A1A1A]/25" strokeWidth={1.25} />
							<div className="text-center">
								<p className="font-serif text-xl text-[#1A1A1A]">Import Visual Assets</p>
								<p className="mt-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#1A1A1A]/50">
									Click or drag files to this area
								</p>
							</div>
						</button>
						{imageFiles.length > 0 ? (
							<p className="mt-2 text-xs text-[#1A1A1A]/55">
								{imageFiles.length} file{imageFiles.length === 1 ? '' : 's'} ready - save to upload.
							</p>
						) : null}
					</div>

					{mode === 'edit' && initialPropertyId && ordered.length > 0 ? (
						<div className="grid gap-8 sm:grid-cols-2">
							{ordered.map((image, i) => (
								<figure
									key={image.id}
									className={['group relative', i === 0 ? 'sm:col-span-2' : ''].join(' ')}
								>
									<ImageTile
										image={image}
										index={i + 1}
										variant={i === 0 ? 'hero' : 'grid'}
										draggingId={draggingId}
										onDragStart={onDragStart}
										onDrop={onDrop}
										onSetCover={onSetCover}
										onDelete={onDelete}
										sublabel={SUBLABELS[i % SUBLABELS.length]}
									/>
								</figure>
							))}
						</div>
					) : null}
				</div>

				{/* <aside className="w-full shrink-0 space-y-8 lg:w-[min(100%,280px)]">
					<div className="rounded-xl bg-stone-100/90 p-5">
						<h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1A1A1A]/55">
							Image health
						</h3>
						<dl className="mt-4 divide-y divide-black/10 text-sm">
							<div className="flex justify-between gap-4 py-3 first:pt-0">
								<dt className="text-[#1A1A1A]/55">Resolution</dt>
								<dd className="font-medium text-[#C45C26]">Sharp</dd>
							</div>
							<div className="flex justify-between gap-4 py-3">
								<dt className="text-[#1A1A1A]/55">Aspect ratio</dt>
								<dd className="text-[#1A1A1A]/80">Balanced</dd>
							</div>
							<div className="flex justify-between gap-4 py-3">
								<dt className="text-[#1A1A1A]/55">Color profile</dt>
								<dd className="font-medium text-[#C45C26]">sRGB</dd>
							</div>
						</dl>
					</div>
					<div>
						<h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1A1A1A]/55">
							Curation tips
						</h3>
						<p className="mt-3 text-sm italic leading-relaxed text-[#1A1A1A]/70">
							Lead with a single hero that communicates location and scale. Keep lighting consistent across the
							set so the listing feels like one coherent space.
						</p>
					</div>
				</aside> */}
			</div>
		</section>
	);
}

function ImageTile({
	image,
	index,
	variant,
	draggingId,
	onDragStart,
	onDrop,
	onSetCover,
	onDelete,
	sublabel,
}: {
	image: PropertyImage;
	index: number;
	variant: 'hero' | 'grid';
	draggingId: string | null;
	onDragStart: (id: string) => void;
	onDrop: (id: string) => void;
	onSetCover: (id: string) => void;
	onDelete: (id: string) => void;
	sublabel: string;
}) {
	const padded = String(index).padStart(2, '0');
	const imageUrl = image.document?.url ?? '';
	const title =
		index === 1 ? 'Main facade' : index === 2 ? 'Interior detail' : index === 3 ? 'Living space' : 'Gallery moment';

	return (
		<>
			<div
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
					<span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#1A1A1A]">
						Hero asset
					</span>
				) : null}
				<div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition group-hover:opacity-100">
					<Button
						type="button"
						variant="ghostIcon"
						className="h-9 w-9 rounded-full bg-white/90 text-[#1A1A1A] shadow-sm hover:bg-white"
						onClick={() => imageUrl && window.open(imageUrl, '_blank', 'noopener,noreferrer')}
						aria-label="Open full size"
					>
						<Maximize2 className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghostIcon"
						className="h-9 w-9 rounded-full bg-white/90 text-[#1A1A1A] shadow-sm hover:bg-white"
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
							className="rounded-full border-white/30 bg-white/90 px-3 py-1.5 text-xs"
							onClick={() => onSetCover(image.id)}
						>
							Set as hero
						</Button>
					</div>
				) : null}
			</div>
			<figcaption className="mt-4 space-y-1">
				<p className="font-serif text-lg text-[#1A1A1A]">
					{padded}. {title}
				</p>
				<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#1A1A1A]/45">{sublabel}</p>
			</figcaption>
		</>
	);
}
