import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {  ImageIcon, Pencil, Search, Wifi, X,NotebookPen  } from 'lucide-react';
import { Button, cn, Input, Textarea } from '@/components/ui';
import {
	amenityOptionByValue,
	PROPERTY_FORM_AMENITY_CATEGORIES,
	type AmenityId,
} from '@/config/constants/dropdowns/amenities.options';
import { useSavePropertyAmenities } from '@/features/property-amenities/hooks/use-property-amenities';
import type { Property } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';
import { amenitiesFormSchema } from './schemas';

type AmenitiesSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	propertyId?: string;
};

export function AmenitiesSection({ initialProperty, propertyId: propertyIdProp }: AmenitiesSectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const [search, setSearch] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [descByValue, setDescByValue] = useState<Record<string, string>>({});
	const [imageUrlByValue, setImageUrlByValue] = useState<Record<string, string>>({});
	const [imageFileByValue, setImageFileByValue] = useState<Record<string, File | null>>({});
	const [editingValue, setEditingValue] = useState<AmenityId | null>(null);
	const [draftDescription, setDraftDescription] = useState('');
	const [draftImageFile, setDraftImageFile] = useState<File | null>(null);
	const [draftImagePreviewUrl, setDraftImagePreviewUrl] = useState('');
	const [removeDraftImage, setRemoveDraftImage] = useState(false);

	const { mutateAsync: saveAmenities, isPending: saving } = useSavePropertyAmenities(propertyId);
	const { handleSubmit, watch, setValue } = useForm<{ amenity_ids: string[] }>({
		resolver: zodResolver(amenitiesFormSchema),
		defaultValues: { amenity_ids: initialProperty?.amenity_ids ?? [] },
	});
	const selectedAmenities = watch('amenity_ids');

	useEffect(() => {
		const next: Record<string, string> = {};
		const nextImageUrls: Record<string, string> = {};
		for (const a of initialProperty?.amenities ?? []) {
			if (a.description) next[a.value] = a.description;
			if (a.image_url) nextImageUrls[a.value] = a.image_url;
		}
		setDescByValue(next);
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
		if (removing) {
			setDescByValue((prev) => {
				const copy = { ...prev };
				delete copy[amenityId];
				return copy;
			});
			setImageUrlByValue((prev) => {
				const copy = { ...prev };
				delete copy[amenityId];
				return copy;
			});
			setImageFileByValue((prev) => {
				const copy = { ...prev };
				delete copy[amenityId];
				return copy;
			});
		}
	};

	const openEdit = (value: AmenityId) => {
		setDraftDescription(descByValue[value] ?? '');
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
		setEditingValue(null);
	};

	const handleSave = handleSubmit(async ({ amenity_ids }) => {
		setError('');
		setSuccess('');

		if (!propertyId) {
			setError('Save Basic info first to create the property.');
			return;
		}

		try {
			const amenities = amenity_ids.map((value) => ({
				value,
				description: descByValue[value]?.trim() || null,
				image_url: imageUrlByValue[value] ?? null,
			}));
			const clearImageValues = amenity_ids.filter((value) => imageFileByValue[value] === null);
			await saveAmenities({ amenities, imageFilesByValue: imageFileByValue, clearImageValues });
			setSuccess('Amenities saved.');
		} catch (submitError) {
			setError(submitError instanceof Error ? submitError.message : 'Could not save amenities.');
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
	const editingImageUrl = editingValue ? (imageUrlByValue[editingValue] ?? '') : '';
	const editingImagePreview = removeDraftImage ? '' : (draftImagePreviewUrl || editingImageUrl);
	const isImageDirty = Boolean(removeDraftImage || draftImageFile);

	return (
		<PropertyFormSection id="amenities" title="Amenities">
			{error ? <p className="rounded-xl bg-red-100/70 px-4 py-3 text-sm text-red-700">{error}</p> : null}
			{success ? <p className="rounded-xl bg-emerald-100/70 px-4 py-3 text-sm text-emerald-800">{success}</p> : null}
			<div className="mb-6">
				<label htmlFor="amenities-search" className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
					Search amenities
				</label>
				<div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2">
					<Search className="h-4 w-4 text-[#1A1A1A]/45" aria-hidden="true" />
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
						<h3 className="font-serif text-lg text-[#1A1A1A]">{category.title}</h3>
						{category.description ? (
							<p className="mt-1 text-sm text-[#1A1A1A]/60">{category.description}</p>
						) : null}
						<div className="mt-4 flex flex-wrap gap-3">
							{category.values.map((value) => {
								const amenity = amenityOptionByValue[value];
								const active = selectedAmenities.includes(amenity.value);
								const Icon = amenity.icon ?? Wifi;
								const hasNote = Boolean(descByValue[amenity.value]?.trim());
								const hasImage = Boolean(imageUrlByValue[amenity.value] || imageFileByValue[amenity.value] instanceof File);
								return (
									<div
										key={amenity.value}
										title={hasNote ? descByValue[amenity.value] : undefined}
										className={cn(
											'inline-flex overflow-hidden rounded-full text-sm transition',
											active ? 'bg-[#6B705C] text-white' : 'bg-black/5 text-[#1A1A1A]/70',
											hasNote && active && 'ring-2 ring-white/40',
										)}
									>
										<button
											type="button"
											onClick={() => onToggleAmenity(amenity.value)}
											className={cn(
												'inline-flex items-center gap-2 px-4 py-2.5 text-left outline-none transition hover:bg-black/[0.06]',
												active && 'hover:bg-white/10',
											)}
										>
											<Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
											<span>{amenity.label}</span>
											{hasNote ? <NotebookPen className="h-3.5 w-3.5 opacity-80" aria-hidden="true" /> : null}
											{hasImage ? <ImageIcon className="h-3.5 w-3.5 opacity-80" aria-hidden="true" /> : null}
										</button>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												openEdit(amenity.value);
											}}
											className={cn(
												'flex w-11 shrink-0 items-center justify-center border-l outline-none transition',
												active ? 'border-white/25 text-white hover:bg-white/15' : 'border-black/10 hover:bg-black/10',
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
				<p className="mt-3 text-sm text-[#1A1A1A]/55">No amenities found for &quot;{search}&quot;.</p>
			) : null}
			<div className="mt-2 flex justify-end border-t border-black/5 pt-5">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : 'Save'}
				</Button>
			</div>

			{editingValue ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby="amenity-edit-title"
					onClick={() => {
						if (draftImagePreviewUrl) URL.revokeObjectURL(draftImagePreviewUrl);
						setDraftImagePreviewUrl('');
						setDraftImageFile(null);
						setEditingValue(null);
					}}
				>
					<div
						className="w-full max-w-md rounded-xl border border-black/10 bg-white p-5 shadow-xl"
						onClick={(e) => e.stopPropagation()}
					>
						<h3 id="amenity-edit-title" className="font-serif text-lg text-[#1A1A1A]">
							{editingLabel}
						</h3>
						<p className="mt-1 text-xs text-[#1A1A1A]/55">Optional note stored with this amenity.</p>
						<Textarea
							value={draftDescription}
							onChange={(e) => setDraftDescription(e.target.value)}
							placeholder="Description…"
							rows={4}
							className="mt-3 min-h-[100px] text-sm"
						/>
						<div className="mt-1 flex items-center justify-between text-xs text-[#1A1A1A]/55">
							<span>{isDescriptionDirty ? 'Typing changes...' : 'Saved value'}</span>
							<span>{draftDescription.trim().length} chars</span>
						</div>
						<div className="mt-3 space-y-2">
							<div className="flex items-center justify-between">
								<label className="block text-xs font-medium text-[#1A1A1A]">Amenity photo</label>
								<span className="text-xs text-[#1A1A1A]/55">{isImageDirty ? 'Photo changed' : 'Saved photo'}</span>
							</div>
							{editingImagePreview ? (
								<div className="relative overflow-hidden rounded-lg border border-black/10">
									<img src={editingImagePreview} alt="" className="h-32 w-full object-cover" />
									<button
										type="button"
										onClick={() => {
											setRemoveDraftImage(true);
											if (draftImagePreviewUrl) {
												URL.revokeObjectURL(draftImagePreviewUrl);
												setDraftImagePreviewUrl('');
											}
											setDraftImageFile(null);
										}}
										className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
										aria-label="Remove amenity photo"
									>
										<X className="h-3.5 w-3.5" />
									</button>
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
						<div className="mt-4 flex justify-end gap-2">
							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									if (draftImagePreviewUrl) URL.revokeObjectURL(draftImagePreviewUrl);
									setDraftImagePreviewUrl('');
									setDraftImageFile(null);
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
				</div>
			) : null}
		</PropertyFormSection>
	);
}
