import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ImageIcon, Maximize2, Pencil, Plus, Trash2, Wind } from 'lucide-react';
import {
	Button,
	cn,
	ConfirmationDialog,
	ImageGalleryLightbox,
	Input,
	MinimalRichText,
	useToast,
	type ImageGalleryOriginRect,
} from '@/components/ui';
import { useSavePropertyAppliances } from '@/features/property-appliances/hooks/use-property-appliances';
import type { Property } from '@/features/property/interfaces/property.interface';
import { dashboardFormFields } from './property-form-section';

type EquipmentGuidesSectionProps = {
	initialProperty?: Property | null;
	propertyId?: string;
};

type ApplianceDraft = {
	key: string;
	id: string | null;
	title: string;
	description: string;
	imageUrl: string | null;
	imagePreviewUrl: string | null;
	imageFile: File | null;
	removeImage: boolean;
};

function createApplianceDraft(seed?: Partial<ApplianceDraft>): ApplianceDraft {
	return {
		key: seed?.key ?? `new-${crypto.randomUUID()}`,
		id: seed?.id ?? null,
		title: seed?.title ?? '',
		description: seed?.description ?? '',
		imageUrl: seed?.imageUrl ?? null,
		imagePreviewUrl: seed?.imagePreviewUrl ?? null,
		imageFile: seed?.imageFile ?? null,
		removeImage: seed?.removeImage ?? false,
	};
}

function richTextPreview(html: string, max = 100) {
	const text = html
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (!text) return '';
	if (text.length <= max) return text;
	return `${text.slice(0, max)}…`;
}

export function EquipmentGuidesSection({ initialProperty, propertyId: propertyIdProp }: EquipmentGuidesSectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const { push } = useToast();
	const { mutateAsync: saveAppliances, isPending: saving } = useSavePropertyAppliances(propertyId);
	const [appliances, setAppliances] = useState<ApplianceDraft[]>([]);
	const [removedIds, setRemovedIds] = useState<string[]>([]);
	const [pendingNewDraft, setPendingNewDraft] = useState<ApplianceDraft | null>(null);
	const [editingKey, setEditingKey] = useState<string | null>(null);
	const [draftTitle, setDraftTitle] = useState('');
	const [draftDescription, setDraftDescription] = useState('');
	const [draftImageFile, setDraftImageFile] = useState<File | null>(null);
	const [draftImagePreviewUrl, setDraftImagePreviewUrl] = useState('');
	const [removeDraftImage, setRemoveDraftImage] = useState(false);
	const [confirmRemoveImageOpen, setConfirmRemoveImageOpen] = useState(false);
	const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [galleryOrigin, setGalleryOrigin] = useState<ImageGalleryOriginRect | null>(null);
	const photoRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const next = (initialProperty?.appliances ?? []).map((appliance) =>
			createApplianceDraft({
				key: appliance.id,
				id: appliance.id,
				title: appliance.title,
				description: appliance.description ?? '',
				imageUrl: appliance.image_url ?? null,
			}),
		);
		setAppliances(next);
		setRemovedIds([]);
		setPendingNewDraft(null);
		setEditingKey(null);
	}, [initialProperty?.id, initialProperty?.updated_at]);

	useEffect(() => {
		return () => {
			if (draftImagePreviewUrl) URL.revokeObjectURL(draftImagePreviewUrl);
		};
	}, [draftImagePreviewUrl]);

	useEffect(() => {
		if (!editingKey) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeEditor();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [editingKey]);

	const editingDraft = useMemo(() => {
		if (!editingKey) return null;
		if (pendingNewDraft?.key === editingKey) return pendingNewDraft;
		return appliances.find((appliance) => appliance.key === editingKey) ?? null;
	}, [appliances, editingKey, pendingNewDraft]);

	const editingImagePreview = useMemo(() => {
		if (!editingDraft) return '';
		if (removeDraftImage) return '';
		return draftImagePreviewUrl || editingDraft.imageUrl || '';
	}, [editingDraft, draftImagePreviewUrl, removeDraftImage]);

	const openEditor = (draft: ApplianceDraft, isNew = false) => {
		setPendingNewDraft(isNew ? draft : null);
		setDraftTitle(draft.title);
		setDraftDescription(draft.description);
		setDraftImageFile(draft.imageFile);
		setDraftImagePreviewUrl(draft.imageFile ? URL.createObjectURL(draft.imageFile) : '');
		setRemoveDraftImage(draft.removeImage);
		setEditingKey(draft.key);
	};

	const closeEditor = useCallback(() => {
		if (draftImagePreviewUrl) URL.revokeObjectURL(draftImagePreviewUrl);
		setDraftImagePreviewUrl('');
		setDraftImageFile(null);
		setDraftTitle('');
		setDraftDescription('');
		setRemoveDraftImage(false);
		setPendingNewDraft(null);
		setEditingKey(null);
	}, [draftImagePreviewUrl]);

	const commitEdit = () => {
		if (!editingKey) return;
		const title = draftTitle.trim();
		if (!title) {
			push({ title: 'Enter a title for this guide.', tone: 'error' });
			return;
		}

		const nextPreviewUrl =
			removeDraftImage || !draftImageFile
				? null
				: draftImagePreviewUrl || (draftImageFile ? URL.createObjectURL(draftImageFile) : null);

		if (pendingNewDraft && editingKey === pendingNewDraft.key) {
			setAppliances((prev) => [
				...prev,
				{
					...pendingNewDraft,
					title,
					description: draftDescription,
					imageFile: removeDraftImage ? null : draftImageFile,
					imageUrl: null,
					imagePreviewUrl: nextPreviewUrl,
					removeImage: removeDraftImage,
				},
			]);
		} else {
			setAppliances((prev) =>
				prev.map((appliance) => {
					if (appliance.key !== editingKey) return appliance;
					if (appliance.imagePreviewUrl && appliance.imagePreviewUrl !== draftImagePreviewUrl) {
						URL.revokeObjectURL(appliance.imagePreviewUrl);
					}
					return {
						...appliance,
						title,
						description: draftDescription,
						imageFile: removeDraftImage ? null : draftImageFile ?? appliance.imageFile,
						imageUrl: removeDraftImage ? null : appliance.imageUrl,
						imagePreviewUrl: nextPreviewUrl,
						removeImage: removeDraftImage,
					};
				}),
			);
		}
		closeEditor();
	};

	const handleAdd = () => {
		openEditor(createApplianceDraft(), true);
	};

	const handleDelete = (key: string) => {
		const target = appliances.find((appliance) => appliance.key === key);
		if (target?.id) {
			setRemovedIds((prev) => [...prev, target.id!]);
		}
		setAppliances((prev) => prev.filter((appliance) => appliance.key !== key));
		setConfirmDeleteKey(null);
		if (editingKey === key) closeEditor();
	};

	const handleSave = async () => {
		if (!propertyId) {
			push({ title: 'Save Basic info first to create the property.', tone: 'error' });
			return;
		}

		const invalid = appliances.find((appliance) => !appliance.title.trim());
		if (invalid) {
			push({ title: 'Every equipment guide needs a title.', tone: 'error' });
			return;
		}

		try {
			const imageFilesByKey: Record<string, File | null> = {};
			const clearImageKeys: string[] = [];
			for (const appliance of appliances) {
				if (appliance.imageFile instanceof File) {
					imageFilesByKey[appliance.key] = appliance.imageFile;
				}
				if (appliance.removeImage && appliance.id) {
					clearImageKeys.push(appliance.key);
				}
			}

			await saveAppliances({
				appliances: appliances.map((appliance) => ({
					key: appliance.key,
					id: appliance.id,
					title: appliance.title.trim(),
					description: appliance.description.trim() || null,
				})),
				removedIds,
				clearImageKeys,
				imageFilesByKey,
			});
			push({ title: 'Equipment guides saved.', tone: 'success' });
		} catch (error) {
			push({
				title: error instanceof Error ? error.message : 'Could not save equipment guides.',
				tone: 'error',
			});
		}
	};

	const openPhotoPreview = useCallback(() => {
		if (!editingImagePreview) return;
		const rect = photoRef.current?.getBoundingClientRect();
		if (!rect) return;
		setGalleryOrigin({
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height,
		});
		setGalleryOpen(true);
	}, [editingImagePreview]);

	const removeDraftPhoto = useCallback(() => {
		setRemoveDraftImage(true);
		if (draftImagePreviewUrl) {
			URL.revokeObjectURL(draftImagePreviewUrl);
			setDraftImagePreviewUrl('');
		}
		setDraftImageFile(null);
	}, [draftImagePreviewUrl]);

	return (
		<div className="mt-10 border-t border-black/[0.07] pt-10">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="max-w-xl">
					<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-camel/90">Guest how-tos</p>
					<h3 className="mt-2 font-serif text-2xl tracking-tight text-espresso">Equipment guides</h3>
					<p className="mt-2 text-sm leading-relaxed text-espresso/58">
						Step-by-step instructions for appliances and devices in the home — air conditioning, heating, laundry, and more.
					</p>
				</div>
				<Button type="button" variant="secondary" onClick={handleAdd} className="shrink-0 gap-2 flex items-center">
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add guide
				</Button>
			</div>

			{appliances.length ? (
				<ul className="mt-6 grid gap-3">
					{appliances.map((appliance, index) => {
						const preview = richTextPreview(appliance.description);
						const imagePreview =
							appliance.removeImage ? '' : appliance.imageFile
								? URL.createObjectURL(appliance.imageFile)
								: appliance.imageUrl ?? '';
						return (
							<li
								key={appliance.key}
								className="group relative overflow-hidden rounded-2xl border border-dashboard-border/55 bg-gradient-to-br from-dashboard-inset via-dashboard-surface to-dashboard-inset p-4 transition hover:border-camel/25 hover:shadow-[0_12px_40px_-28px_rgba(120,84,40,0.55)]"
								style={{ animationDelay: `${index * 40}ms` }}
							>
								<div className="flex gap-4">
									<div
										className={cn(
											'relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-black/[0.06]',
											imagePreview ? 'bg-dashboard-bg' : 'bg-camel/[0.08]',
										)}
									>
										{imagePreview ? (
											<img src={imagePreview} alt="" className="h-full w-full object-cover" />
										) : (
											<Wind className="h-7 w-7 text-camel/55" aria-hidden="true" />
										)}
										<span className="absolute bottom-1.5 right-1.5 rounded-full bg-dashboard-panel/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-espresso/55">
											{String(index + 1).padStart(2, '0')}
										</span>
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="truncate font-medium text-espresso">{appliance.title || 'Untitled guide'}</p>
												{preview ? (
													<p className="mt-1 line-clamp-2 text-sm text-espresso/55">{preview}</p>
												) : (
													<p className="mt-1 text-sm italic text-espresso/40">No instructions yet</p>
												)}
											</div>
											<div className="flex shrink-0 gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
												<Button
													type="button"
													variant="ghostIcon"
													className="h-8 w-8 text-espresso/70 hover:text-espresso"
													onClick={() => openEditor(appliance)}
													aria-label={`Edit ${appliance.title || 'guide'}`}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													type="button"
													variant="ghostIcon"
													className="h-8 w-8 text-espresso/70 hover:text-red-600"
													onClick={() => setConfirmDeleteKey(appliance.key)}
													aria-label={`Delete ${appliance.title || 'guide'}`}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
										<div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-espresso/40">
											<span className="inline-flex items-center gap-1">
												<BookOpen className="h-3 w-3" aria-hidden="true" />
												Guide
											</span>
											{imagePreview ? (
												<span className="inline-flex items-center gap-1">
													<ImageIcon className="h-3 w-3" aria-hidden="true" />
													Photo
												</span>
											) : null}
										</div>
									</div>
								</div>
							</li>
						);
					})}
				</ul>
			) : (
				<div className="mt-6 rounded-2xl border border-dashed border-dashboard-border/70 bg-dashboard-inset/60 px-6 py-10 text-center">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-camel/10">
						<Wind className="h-5 w-5 text-camel" aria-hidden="true" />
					</div>
					<p className="mt-4 font-medium text-espresso">No equipment guides yet</p>
					<p className="mx-auto mt-1 max-w-sm text-sm text-espresso/55">
						Help guests operate the air conditioner, washer, thermostat, or any other device with photos and clear steps.
					</p>
					<Button type="button" variant="primary" onClick={handleAdd} className="mt-5 gap-2 flex items-center">
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add first guide
					</Button>
				</div>
			)}

			<div className="mt-6 flex justify-end">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : 'Save guides'}
				</Button>
			</div>

			{editingKey ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby="equipment-guide-edit-title"
					onClick={closeEditor}
				>
					<div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" aria-hidden />
					<div
						className={cn(
							'relative z-10 max-h-[min(92vh,760px)] w-full max-w-lg overflow-y-auto rounded-2xl bg-dashboard-panel p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]',
							dashboardFormFields,
						)}
						onClick={(e) => e.stopPropagation()}
					>
						<p className="text-[10px] font-medium uppercase tracking-[0.2em] text-camel/90">Equipment guide</p>
						<h3 id="equipment-guide-edit-title" className="mt-2 font-serif text-xl text-espresso">
							{pendingNewDraft ? 'New guide' : 'Edit guide'}
						</h3>
						<div className="mt-4 space-y-4">
							<div>
								<label htmlFor="equipment-guide-title" className="mb-1.5 block text-sm font-medium text-espresso">
									Title
								</label>
								<Input
									id="equipment-guide-title"
									value={draftTitle}
									onChange={(e) => setDraftTitle(e.target.value)}
									placeholder="e.g. Air conditioning"
								/>
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<label className="text-sm font-medium text-espresso">Photo</label>
									<span className="text-xs text-dashboard-muted">Optional reference image</span>
								</div>
								{editingImagePreview ? (
									<div ref={photoRef} className="group relative overflow-hidden rounded-xl bg-dashboard-bg">
										<img src={editingImagePreview} alt="" className="h-40 w-full object-cover" />
										<div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition group-hover:opacity-100">
											<Button
												type="button"
												variant="ghostIcon"
												className="h-8 w-8 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm"
												onClick={openPhotoPreview}
												aria-label="Preview guide photo"
											>
												<Maximize2 className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												variant="ghostIcon"
												className="h-8 w-8 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm hover:text-red-600"
												onClick={() => setConfirmRemoveImageOpen(true)}
												aria-label="Remove guide photo"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								) : null}
								<Input
									type="file"
									accept="image/*"
									onChange={(e) => {
										const file = e.target.files?.[0] ?? null;
										if (draftImagePreviewUrl) URL.revokeObjectURL(draftImagePreviewUrl);
										setDraftImageFile(file);
										setDraftImagePreviewUrl(file ? URL.createObjectURL(file) : '');
										setRemoveDraftImage(false);
									}}
								/>
							</div>
							<MinimalRichText
								label="Instructions"
								value={draftDescription}
								onChange={setDraftDescription}
								placeholder="How to turn on, adjust temperature, clean filters…"
								editorMinHeight="min-h-[180px]"
							/>
						</div>
						<div className="mt-6 flex justify-end gap-2">
							<Button type="button" variant="secondary" onClick={closeEditor}>
								Cancel
							</Button>
							<Button type="button" variant="primary" onClick={commitEdit}>
								Done
							</Button>
						</div>
					</div>
					<ConfirmationDialog
						open={confirmRemoveImageOpen}
						title="Remove guide photo?"
						description="This photo will be removed from the guide. Save guides to apply the change."
						confirmLabel="Remove"
						confirmVariant="danger"
						onCancel={() => setConfirmRemoveImageOpen(false)}
						onConfirm={() => {
							removeDraftPhoto();
							setConfirmRemoveImageOpen(false);
						}}
					/>
					<ImageGalleryLightbox
						images={editingImagePreview ? [editingImagePreview] : []}
						open={galleryOpen}
						initialIndex={0}
						originRect={galleryOrigin}
						onClose={() => setGalleryOpen(false)}
					/>
				</div>
			) : null}

			<ConfirmationDialog
				open={confirmDeleteKey !== null}
				title="Delete this guide?"
				description="The equipment guide will be removed when you save."
				confirmLabel="Delete"
				confirmVariant="danger"
				onCancel={() => setConfirmDeleteKey(null)}
				onConfirm={() => {
					if (confirmDeleteKey) handleDelete(confirmDeleteKey);
				}}
			/>
		</div>
	);
}
