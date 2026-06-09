import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ImageIcon, Maximize2, NotepadText, Pencil, Search, Trash2, Wifi } from 'lucide-react';
import {
	Button,
	cn,
	ConfirmationDialog,
	ImageGalleryLightbox,
	Input,
	Textarea,
	useToast,
	type ImageGalleryOriginRect,
} from '@/components/ui';
import {
	amenityOptionByValue,
	PROPERTY_FORM_AMENITY_CATEGORIES,
	type AmenityId,
} from '@/config/constants/dropdowns/amenities.options';
import { useSavePropertyAmenities } from '@/features/property-amenities/hooks/use-property-amenities';
import type { Property } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection, dashboardFormFields } from './property-form-section';
import { amenitiesFormSchema } from './schemas';

type AmenitiesSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	propertyId?: string;
};

export function AmenitiesSection({ initialProperty, propertyId: propertyIdProp }: AmenitiesSectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const [search, setSearch] = useState('');
	const { push } = useToast();
	const [descByValue, setDescByValue] = useState<Record<string, string>>({});
	const [quantityByValue, setQuantityByValue] = useState<Record<string, string>>({});
	const [imageUrlByValue, setImageUrlByValue] = useState<Record<string, string>>({});
	const [imageFileByValue, setImageFileByValue] = useState<Record<string, File | null>>({});
	const [editingValue, setEditingValue] = useState<AmenityId | null>(null);
	const [draftDescription, setDraftDescription] = useState('');
	const [draftQuantity, setDraftQuantity] = useState('');
	const [draftImageFile, setDraftImageFile] = useState<File | null>(null);
	const [draftImagePreviewUrl, setDraftImagePreviewUrl] = useState('');
	const [removeDraftImage, setRemoveDraftImage] = useState(false);
	const [confirmRemoveImageOpen, setConfirmRemoveImageOpen] = useState(false);
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [galleryOrigin, setGalleryOrigin] = useState<ImageGalleryOriginRect | null>(null);
	const amenityPhotoRef = useRef<HTMLDivElement>(null);

	const { mutateAsync: saveAmenities, isPending: saving } = useSavePropertyAmenities(propertyId);
	const { handleSubmit, watch, setValue } = useForm<{ amenity_ids: string[] }>({
		resolver: zodResolver(amenitiesFormSchema),
		defaultValues: { amenity_ids: initialProperty?.amenity_ids ?? [] },
	});
	const selectedAmenities = watch('amenity_ids');

	useEffect(() => {
		const next: Record<string, string> = {};
		const nextQuantities: Record<string, string> = {};
		const nextImageUrls: Record<string, string> = {};
		for (const a of initialProperty?.amenities ?? []) {
			if (a.description) next[a.value] = a.description;
			if (typeof a.quantity === 'number' && Number.isFinite(a.quantity) && a.quantity > 0) {
				nextQuantities[a.value] = String(a.quantity);
			}
			if (a.image_url) nextImageUrls[a.value] = a.image_url;
		}
		setDescByValue(next);
		setQuantityByValue(nextQuantities);
		setImageUrlByValue(nextImageUrls);
		setImageFileByValue({});
	}, [initialProperty?.id, initialProperty?.updated_at]);

	useEffect(() => {
		return () => {
			if (draftImagePreviewUrl) URL.revokeObjectURL(draftImagePreviewUrl);
		};
	}, [draftImagePreviewUrl]);

	useEffect(() => {
		if (!editingValue) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setEditingValue(null);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [editingValue]);

	const onToggleAmenity = (amenityId: string) => {
		const removing = selectedAmenities.includes(amenityId);
		const next = removing
			? selectedAmenities.filter((id) => id !== amenityId)
			: [...selectedAmenities, amenityId];
		setValue('amenity_ids', next, { shouldValidate: true, shouldDirty: true });
	};

	const openEdit = (value: AmenityId) => {
		setDraftDescription(descByValue[value] ?? '');
		setDraftQuantity(quantityByValue[value] ?? '');
		const selectedFile = imageFileByValue[value];
		setDraftImageFile(selectedFile ?? null);
		setDraftImagePreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : '');
		setRemoveDraftImage(false);
		setEditingValue(value);
	};

	const commitEdit = () => {
		if (!editingValue) return;
		setDescByValue((prev) => {
			const next = { ...prev };
			const t = draftDescription.trim();
			if (t) next[editingValue] = t;
			else delete next[editingValue];
			return next;
		});
		setQuantityByValue((prev) => {
			const next = { ...prev };
			const parsed = Number.parseInt(draftQuantity.trim(), 10);
			if (Number.isFinite(parsed) && parsed > 0) next[editingValue] = String(parsed);
			else delete next[editingValue];
			return next;
		});
		setImageFileByValue((prev) => {
			const next = { ...prev };
			if (removeDraftImage) next[editingValue] = null;
			else if (draftImageFile) next[editingValue] = draftImageFile;
			return next;
		});
		if (removeDraftImage) {
			setImageUrlByValue((prev) => {
				const next = { ...prev };
				delete next[editingValue];
				return next;
			});
		}
		if (draftImagePreviewUrl) URL.revokeObjectURL(draftImagePreviewUrl);
		setDraftImagePreviewUrl('');
		setDraftImageFile(null);
		setDraftQuantity('');
		setEditingValue(null);
	};

	const handleSave = handleSubmit(async ({ amenity_ids }) => {
		if (!propertyId) {
			push({ title: 'Save Basic info first to create the property.', tone: 'error' });
			return;
		}

		try {
			const amenities = amenity_ids.map((value) => ({
				value,
				description: descByValue[value]?.trim() || null,
				quantity: Number.parseInt(quantityByValue[value] ?? '', 10) || null,
				image_url: imageUrlByValue[value] ?? null,
			}));
			const clearImageValues = amenity_ids.filter((value) => imageFileByValue[value] === null);
			await saveAmenities({ amenities, imageFilesByValue: imageFileByValue, clearImageValues });
			push({ title: 'Amenities saved.', tone: 'success' });
		} catch (submitError) {
			push({
				title: submitError instanceof Error ? submitError.message : 'Could not save amenities.',
				tone: 'error',
			});
		}
	});

	const categories = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return PROPERTY_FORM_AMENITY_CATEGORIES;
		return PROPERTY_FORM_AMENITY_CATEGORIES.map((cat) => ({
			...cat,
			values: cat.values.filter((id) => amenityOptionByValue[id].label.toLowerCase().includes(q)),
		})).filter((cat) => cat.values.length > 0);
	}, [search]);

	const editingLabel = editingValue ? amenityOptionByValue[editingValue]?.label ?? editingValue : '';
	const savedDescriptionForEditing = editingValue ? (descByValue[editingValue] ?? '') : '';
	const isDescriptionDirty = editingValue ? draftDescription.trim() !== savedDescriptionForEditing.trim() : false;
	const savedQuantityForEditing = editingValue ? (quantityByValue[editingValue] ?? '') : '';
	const isQuantityDirty = editingValue ? draftQuantity.trim() !== savedQuantityForEditing.trim() : false;
	const editingImageUrl = editingValue ? (imageUrlByValue[editingValue] ?? '') : '';
	const editingImagePreview = removeDraftImage ? '' : (draftImagePreviewUrl || editingImageUrl);
	const isImageDirty = Boolean(removeDraftImage || draftImageFile);

	const removeDraftAmenityImage = useCallback(() => {
		setRemoveDraftImage(true);
		if (draftImagePreviewUrl) {
			URL.revokeObjectURL(draftImagePreviewUrl);
			setDraftImagePreviewUrl('');
		}
		setDraftImageFile(null);
	}, [draftImagePreviewUrl]);

	const openAmenityPhotoPreview = useCallback(() => {
		if (!editingImagePreview) return;
		const rect = amenityPhotoRef.current?.getBoundingClientRect();
		if (!rect) return;
		setGalleryOrigin({
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height,
		});
		setGalleryOpen(true);
	}, [editingImagePreview]);

	return (
		<PropertyFormSection id="amenities" title="Amenities">
			<div className="mb-6">
				<label htmlFor="amenities-search" className="mb-1.5 block text-sm font-medium text-espresso">
					Search amenities
				</label>
				<div className="flex items-center gap-2 rounded-xl border border-dashboard-border/60 bg-dashboard-surface px-3 py-2">
					<Search className="h-4 w-4 text-espresso/45" aria-hidden="true" />
					<Input
						id="amenities-search"
						variant="plain"
						type="text"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search amenities..."
					/>
				</div>
			</div>
			<div className="space-y-8">
				{categories.map((category) => (
					<div key={category.id}>
						<h3 className="font-serif text-lg text-espresso">{category.title}</h3>
						{category.description ? (
							<p className="mt-1 text-sm text-espresso/60">{category.description}</p>
						) : null}
						<div className="mt-4 flex flex-wrap gap-3">
							{category.values.map((value) => {
								const amenity = amenityOptionByValue[value];
								const active = selectedAmenities.includes(amenity.value);
								const Icon = amenity.icon ?? Wifi;
								const hasNote = Boolean(descByValue[amenity.value]?.trim());
								const quantity = quantityByValue[amenity.value]?.trim();
								const hasQuantity = Boolean(quantity);
								const hasImage = Boolean(imageUrlByValue[amenity.value] || imageFileByValue[amenity.value] instanceof File);
								return (
									<div
										key={amenity.value}
										title={hasNote ? descByValue[amenity.value] : undefined}
										className={cn(
											'inline-flex overflow-hidden rounded-full text-sm transition',
											active ? 'bg-camel text-white' : 'bg-black/5 text-espresso/70',
											hasNote && active && 'ring-2 ring-white/40',
										)}
									>
										<button
											type="button"
											onClick={() => onToggleAmenity(amenity.value)}
											className={cn(
												'cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 text-left outline-none transition hover:bg-black/[0.06]',
												active && 'hover:bg-white/10',
											)}
										>
											<Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
											<span>{amenity.label}</span>
											{hasNote ? <NotepadText  className="h-3.5 w-3.5 opacity-80" aria-hidden="true" /> : null}
											{hasQuantity ? (
												<span className="rounded-full bg-black/15 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
													{quantity}
												</span>
											) : null}
											{hasImage ? <ImageIcon className="h-3.5 w-3.5 opacity-80" aria-hidden="true" /> : null}
										</button>
										<button
											type="button"
											disabled={!active}
											onClick={(e) => {
												e.stopPropagation();
												if (!active) return;
												openEdit(amenity.value);
											}}
											className={cn(
												'flex w-11 shrink-0 items-center justify-center border-l outline-none transition',
												active
													? 'border-white/25 text-white hover:bg-white/15 cursor-pointer'
													: 'cursor-not-allowed border-black/10 text-espresso/30',
											)}
											aria-label={`Edit description for ${amenity.label}`}
										>
											<Pencil className="h-4 w-4 opacity-90" />
										</button>
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>
			{search.trim() && !categories.length ? (
				<p className="mt-3 text-sm text-espresso/55">No amenities found for &quot;{search}&quot;.</p>
			) : null}
			<div className="mt-2 flex justify-end border-t border-black/5 pt-5">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : 'Save'}
				</Button>
			</div>

			{editingValue ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby="amenity-edit-title"
					onClick={() => {
						if (draftImagePreviewUrl) URL.revokeObjectURL(draftImagePreviewUrl);
						setDraftImagePreviewUrl('');
						setDraftImageFile(null);
						setDraftQuantity('');
						setEditingValue(null);
					}}
				>
					<div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" aria-hidden />
					<div
						className={cn(
							'relative z-10 w-full max-w-md rounded-2xl bg-dashboard-panel p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]',
							dashboardFormFields,
						)}
						onClick={(e) => e.stopPropagation()}
					>
						<h3 id="amenity-edit-title" className="font-serif text-lg text-espresso">
							{editingLabel}
						</h3>
						<p className="mt-1 text-xs text-dashboard-muted">Optional note stored with this amenity.</p>
						<div className="mt-3 rounded-lg bg-dashboard-bg px-3 py-2">
							<Textarea
								value={draftDescription}
								onChange={(e) => setDraftDescription(e.target.value)}
								placeholder="Description…"
								rows={4}
								className="min-h-[100px] border-0 bg-transparent px-0 py-1 text-sm shadow-none focus:ring-0"
							/>
						</div>
						<div className="mt-1 flex items-center justify-between text-xs text-dashboard-muted">
							<span>{isDescriptionDirty ? 'Typing changes...' : 'Saved value'}</span>
							<span>{draftDescription.trim().length} chars</span>
						</div>
						<div className="mt-3">
							<label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-dashboard-muted">
								Quantity
							</label>
							<Input
								type="number"
								min={1}
								step={1}
								value={draftQuantity}
								onChange={(e) => setDraftQuantity(e.target.value)}
								placeholder="e.g. 2"
							/>
							<div className="mt-1 text-xs text-dashboard-muted">
								{isQuantityDirty ? 'Quantity changed' : 'Saved quantity'}
							</div>
						</div>
						<div className="mt-3 space-y-2">
							<div className="flex items-center justify-between">
								<label className="text-[10px] font-medium uppercase tracking-[0.14em] text-dashboard-muted">
									Amenity photo
								</label>
								<span className="text-xs text-dashboard-muted">{isImageDirty ? 'Photo changed' : 'Saved photo'}</span>
							</div>
							{editingImagePreview ? (
								<div ref={amenityPhotoRef} className="group relative overflow-hidden rounded-lg bg-dashboard-bg">
									<img src={editingImagePreview} alt="" className="h-32 w-full object-cover" />
									<div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition group-hover:opacity-100">
										<Button
											type="button"
											variant="ghostIcon"
											className="h-8 w-8 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm"
											onClick={openAmenityPhotoPreview}
											aria-label="Preview amenity photo"
										>
											<Maximize2 className="h-4 w-4" />
										</Button>
										<Button
											type="button"
											variant="ghostIcon"
											className="h-8 w-8 rounded-full bg-dashboard-surface/95 text-espresso shadow-sm hover:text-red-600"
											onClick={() => setConfirmRemoveImageOpen(true)}
											aria-label="Remove amenity photo"
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
						<div className="mt-5 flex justify-end gap-2">
							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									if (draftImagePreviewUrl) URL.revokeObjectURL(draftImagePreviewUrl);
									setDraftImagePreviewUrl('');
									setDraftImageFile(null);
									setDraftQuantity('');
									setEditingValue(null);
								}}
							>
								Cancel
							</Button>
							<Button type="button" variant="primary" onClick={commitEdit}>
								Done
							</Button>
						</div>
					</div>
					<ConfirmationDialog
						open={confirmRemoveImageOpen}
						title="Remove amenity photo?"
						description="This photo will be removed from the amenity. Save amenities to apply the change."
						confirmLabel="Remove"
						confirmVariant="danger"
						onCancel={() => setConfirmRemoveImageOpen(false)}
						onConfirm={() => {
							removeDraftAmenityImage();
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
		</PropertyFormSection>
	);
}
