'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ImageIcon, Maximize2, Trash2 } from 'lucide-react';
import { Button, ConfirmationDialog, useToast } from '@/components/ui';
import {
	useDeleteServiceImage,
	useReorderServiceImages,
	useUploadServiceImages,
} from '@/features/services/hooks/use-host-services';
import type { HostService, ServiceImage } from '@/features/services/interfaces/service.interface';

export type StagedPhoto = {
	id: string;
	file: File;
	previewUrl: string;
};

export function useStagedPhotos() {
	const urlsRef = useRef(new Set<string>());
	const [staged, setStaged] = useState<StagedPhoto[]>([]);

	const addFiles = useCallback((fileList: FileList | File[]) => {
		const next = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
		if (!next.length) return;
		setStaged((previous) => {
			const added: StagedPhoto[] = next.map((file) => {
				const previewUrl = URL.createObjectURL(file);
				urlsRef.current.add(previewUrl);
				return { id: crypto.randomUUID(), file, previewUrl };
			});
			return [...previous, ...added];
		});
	}, []);

	const removeStaged = useCallback((id: string) => {
		setStaged((previous) => {
			const item = previous.find((s) => s.id === id);
			if (item) {
				URL.revokeObjectURL(item.previewUrl);
				urlsRef.current.delete(item.previewUrl);
			}
			return previous.filter((s) => s.id !== id);
		});
	}, []);

	const clear = useCallback(() => {
		setStaged((previous) => {
			previous.forEach((s) => {
				URL.revokeObjectURL(s.previewUrl);
				urlsRef.current.delete(s.previewUrl);
			});
			return [];
		});
	}, []);

	useEffect(
		() => () => {
			urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
			urlsRef.current.clear();
		},
		[],
	);

	return { staged, addFiles, removeStaged, clear };
}

export function StagedPhotosPicker({
	staged,
	onAddFiles,
	onRemove,
}: {
	staged: StagedPhoto[];
	onAddFiles: (files: FileList | File[]) => void;
	onRemove: (id: string) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [fileZoneOver, setFileZoneOver] = useState(false);
	const [removeId, setRemoveId] = useState<string | null>(null);

	return (
		<div className="space-y-3">
			<input
				ref={inputRef}
				type="file"
				multiple
				accept="image/*"
				className="sr-only"
				onChange={(e) => {
					onAddFiles(e.target.files ?? []);
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
					onAddFiles(e.dataTransfer.files);
				}}
				className={[
					'flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 transition',
					fileZoneOver ? 'border-camel/60 bg-camel/[0.04]' : 'border-dashboard-border bg-white',
				].join(' ')}
			>
				<ImageIcon className="h-8 w-8 text-espresso/25" strokeWidth={1.25} />
				<span className="text-sm text-espresso/60">Click or drag images to add photos</span>
			</button>

			{staged.length > 0 ? (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{staged.map((item) => (
						<div
							key={item.id}
							className="relative aspect-[4/3] overflow-hidden rounded-lg border border-dashboard-border bg-black/5"
						>
							<img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
							<Button
								type="button"
								variant="ghostIcon"
								className="absolute right-1.5 top-1.5 h-8 w-8 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm"
								onClick={() => setRemoveId(item.id)}
								aria-label="Remove from upload queue"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					))}
				</div>
			) : null}

			<ConfirmationDialog
				open={removeId !== null}
				title="Remove this photo?"
				description="This photo will be removed from the upload queue."
				confirmLabel="Remove"
				confirmVariant="danger"
				onCancel={() => setRemoveId(null)}
				onConfirm={() => {
					if (removeId) onRemove(removeId);
					setRemoveId(null);
				}}
			/>
		</div>
	);
}

const sortImages = (images: ServiceImage[]) => [...images].sort((a, b) => a.order - b.order);

export type ServicePhotosEditorHandle = {
	uploadStagedIfAny: () => Promise<void>;
};

export const ServicePhotosEditor = forwardRef<ServicePhotosEditorHandle, { service: HostService }>(
	function ServicePhotosEditor({ service }, ref) {
	const { staged, addFiles, removeStaged, clear } = useStagedPhotos();
	const { push } = useToast();
	const { mutateAsync: uploadImages, isPending: uploading } = useUploadServiceImages();
	const { mutateAsync: reorderImages, isPending: reordering } = useReorderServiceImages();
	const { mutateAsync: removeImage, isPending: deleting } = useDeleteServiceImage();
	const [images, setImages] = useState(() => sortImages(service.images));
	const [draggingId, setDraggingId] = useState<string | null>(null);

	useEffect(() => {
		setImages(sortImages(service.images));
	}, [service.images]);

	const uploadStaged = useCallback(async () => {
		if (!staged.length) return;
		await uploadImages({ serviceId: service.id, files: staged.map((s) => s.file) });
		clear();
	}, [clear, service.id, staged, uploadImages]);

	useImperativeHandle(ref, () => ({
		uploadStagedIfAny: uploadStaged,
	}), [uploadStaged]);

	const handleUpload = async () => {
		if (!staged.length) return;
		try {
			await uploadStaged();
			push({ title: 'Photos uploaded.', tone: 'success' });
		} catch (e) {
			push({ title: e instanceof Error ? e.message : 'Could not upload photos.', tone: 'error' });
		}
	};

	const handleDelete = async (imageId: string) => {
		try {
			await removeImage({ serviceId: service.id, imageId });
			setImages((previous) => previous.filter((image) => image.id !== imageId));
			push({ title: 'Photo removed.', tone: 'success' });
		} catch (e) {
			push({ title: e instanceof Error ? e.message : 'Could not remove photo.', tone: 'error' });
		}
	};

	const handleDrop = async (targetImageId: string) => {
		if (!draggingId || draggingId === targetImageId) return;
		const from = images.findIndex((item) => item.id === draggingId);
		const to = images.findIndex((item) => item.id === targetImageId);
		if (from < 0 || to < 0) return;

		const next = [...images];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		const normalized = next.map((item, index) => ({ ...item, order: index }));
		setImages(normalized);
		setDraggingId(null);

		try {
			const reordered = await reorderImages({
				serviceId: service.id,
				reorder_ids: normalized.map((image) => image.id),
			});
			setImages(sortImages(reordered));
		} catch (e) {
			setImages(sortImages(service.images));
			push({ title: e instanceof Error ? e.message : 'Could not reorder photos.', tone: 'error' });
		}
	};

	return (
		<div className="space-y-4">
			<p className="text-sm font-medium text-espresso">Photos</p>

			<StagedPhotosPicker staged={staged} onAddFiles={addFiles} onRemove={removeStaged} />

			{staged.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					<Button type="button" variant="primarySm" disabled={uploading} onClick={() => void handleUpload()}>
						{uploading ? 'Uploading…' : `Upload ${staged.length} photo${staged.length === 1 ? '' : 's'}`}
					</Button>
					<Button type="button" variant="ghostPill" onClick={clear}>
						Clear
					</Button>
				</div>
			) : null}

			{images.length > 0 ? (
				<div className="space-y-3">
					<p className="text-xs text-espresso/55">Drag photos to reorder. The first photo is shown in the service list.</p>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{images.map((image, index) => (
							<ServicePhotoTile
								key={image.id}
								image={image}
								isPrimary={index === 0}
								draggingId={draggingId}
								reordering={reordering}
								deleting={deleting}
								onDragStart={setDraggingId}
								onDrop={() => void handleDrop(image.id)}
								onConfirmDelete={() => handleDelete(image.id)}
							/>
						))}
					</div>
				</div>
			) : (
				<p className="text-sm text-espresso/55">No photos yet.</p>
			)}
		</div>
	);
	},
);

function ServicePhotoTile({
	image,
	isPrimary,
	draggingId,
	reordering,
	deleting,
	onDragStart,
	onDrop,
	onConfirmDelete,
}: {
	image: ServiceImage;
	isPrimary: boolean;
	draggingId: string | null;
	reordering: boolean;
	deleting: boolean;
	onDragStart: (id: string) => void;
	onDrop: () => void;
	onConfirmDelete: () => Promise<void>;
}) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const url = image.url ?? '';

	return (
		<>
			<figure
				draggable={!reordering && !deleting}
				onDragStart={() => onDragStart(image.id)}
				onDragOver={(e) => e.preventDefault()}
				onDrop={onDrop}
				className={[
					'group relative aspect-[4/3] overflow-hidden rounded-lg bg-black/5 ring-1 ring-black/10',
					draggingId === image.id ? 'opacity-60' : 'opacity-100',
					!reordering && !deleting ? 'cursor-grab active:cursor-grabbing' : '',
				].join(' ')}
			>
				<div
					className="pointer-events-none absolute inset-0 bg-cover bg-center"
					style={url ? { backgroundImage: `url(${url})` } : undefined}
				/>
				{isPrimary ? (
					<span className="absolute bottom-2 left-2 rounded-full bg-dashboard-surface/95 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-espresso">
						Primary
					</span>
				) : null}
				<div className="absolute right-1.5 top-1.5 z-10 flex gap-1 opacity-0 transition group-hover:opacity-100">
					<Button
						type="button"
						variant="ghostIcon"
						className="h-8 w-8 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm"
						onClick={() => url && window.open(url, '_blank', 'noopener,noreferrer')}
						aria-label="Open full size"
					>
						<Maximize2 className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghostIcon"
						disabled={deleting || reordering}
						className="h-8 w-8 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm hover:text-red-600"
						onClick={() => setConfirmOpen(true)}
						aria-label="Remove photo"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</figure>

			<ConfirmationDialog
				open={confirmOpen}
				title="Remove this photo?"
				description="This photo will be permanently deleted from the service. This cannot be undone."
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
