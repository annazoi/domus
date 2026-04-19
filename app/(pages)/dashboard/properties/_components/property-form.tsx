'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMapsPlacesScript } from '@/components/google-maps';
import { useSetDashboardPageIntro } from '@/app/(pages)/dashboard/_components/dashboard-shell';
import { ApartmentOptions } from '@/config/constants/dropdowns/apartment.options';
import type { Property, PropertyImage, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import {
	deleteImage,
	reorderPropertyImages,
	savePropertyAmenities,
	uploadFilesToCloudinary,
	uploadPropertyImages,
} from '@/features/property/services/property.services';
import { AmenitiesSection } from './property-form/amenities-section';
import { BasicInfoSection } from './property-form/basic-info-section';
import { CapacitySection } from './property-form/capacity-section';
import { ImagesSection } from './property-form/images-section';
import { LocationSection } from './property-form/location-section';
import { PricingSection } from './property-form/pricing-section';
import { PropertyFormSidebar, type PropertyFormTabId } from './property-form/property-form-sidebar';

type PropertyFormProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	onSubmit: (payload: UpsertPropertyInput) => Promise<Property>;
};

const defaultValues: UpsertPropertyInput = {
	title: '',
	description: '',
	property_type: ApartmentOptions[0].value,
	room_type: 'Entire place',
	max_guests: 1,
	bedrooms: 1,
	beds: 1,
	bathrooms: 1,
	country: '',
	city: '',
	address: '',
	lat: null,
	lng: null,
	cleaning_fee: 0,
	status: 'draft',
};

const numberOrNull = (value: string) => {
	if (!value.trim()) return null;
	const numeric = Number(value);
	return Number.isNaN(numeric) ? null : numeric;
};

function TabSaveFooter({
	label,
	onSave,
	disabled,
	saving,
}: {
	label: string;
	onSave: () => void | Promise<void>;
	disabled?: boolean;
	saving: boolean;
}) {
	return (
		<div className="mt-6 flex justify-end border-t border-black/5 pt-5">
			<button
				type="button"
				onClick={() => void onSave()}
				disabled={disabled || saving}
				className="cursor-pointer rounded-full bg-[#1A1A1A] px-6 py-2.5 text-sm text-white transition hover:-translate-y-0.5 disabled:opacity-60"
			>
				{saving ? 'Saving...' : label}
			</button>
		</div>
	);
}

export function PropertyForm({ mode, initialProperty, onSubmit }: PropertyFormProps) {
	const router = useRouter();
	const [form, setForm] = useState<UpsertPropertyInput>(initialProperty ? { ...initialProperty } : defaultValues);
	const [images, setImages] = useState<PropertyImage[]>(initialProperty?.images ?? []);
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialProperty?.amenity_ids ?? []);
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<PropertyFormTabId>('basic-info');
	const [googleMapsReady, setGoogleMapsReady] = useState(false);
	const setPageIntro = useSetDashboardPageIntro();

	const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
	const placesLibraryReady = Boolean(mapsApiKey && googleMapsReady);

	const propertyId = initialProperty?.id ?? null;

	// useEffect(() => {
	// 	setPageIntro(
	// 		<div className="min-w-0 mt-10 flex flex-col gap-2 mb-4">
	// 			<p className="text-[10px] uppercase tracking-[0.2em] text-[#6B705C] sm:text-xs">
	// 				{mode === 'create' ? 'Create property' : 'Edit property'}
	// 			</p>
	// 			<h1 className="truncate font-serif text-xl leading-tight text-[#1A1A1A] sm:text-2xl md:text-3xl">
	// 				{mode === 'create' ? 'New listing' : 'Property details'}
	// 			</h1>
	// 		</div>,
	// 	);
	// 	return () => setPageIntro(null);
	// }, [mode, setPageIntro]);

	useEffect(() => {
		setError('');
		setSuccess('');
	}, [activeTab]);

	const handleSaveTab = async (tab: PropertyFormTabId) => {
		setError('');
		setSuccess('');

		const needTitleForCreate = mode === 'create' && !form.title.trim();

		if (tab === 'basic-info') {
			if (!form.title.trim()) {
				setError('Title is required.');
				return;
			}
		} else if (tab === 'capacity') {
			if (needTitleForCreate) {
				setError('Add a title under Basic info first.');
				return;
			}
			if (form.max_guests <= 0) {
				setError('Guests must be greater than 0.');
				return;
			}
		} else if (tab === 'location') {
			if (needTitleForCreate) {
				setError('Add a title under Basic info first.');
				return;
			}
		} else if (tab === 'pricing') {
			if (needTitleForCreate) {
				setError('Add a title under Basic info first.');
				return;
			}
			if (form.cleaning_fee < 0) {
				setError('Cleaning fee cannot be negative.');
				return;
			}
		} else if (tab === 'amenities') {
			if (!propertyId) {
				setError('Save basic info or another section first to create the property.');
				return;
			}
		} else if (tab === 'images') {
			if (!propertyId) {
				setError('Save basic info or another section first to create the property.');
				return;
			}
			if (!imageFiles.length) {
				setError('Select one or more images to upload.');
				return;
			}
		}

		setSaving(true);
		try {
			if (
				tab === 'basic-info' ||
				tab === 'capacity' ||
				tab === 'location' ||
				tab === 'pricing'
			) {
				const saved = await onSubmit(form);
				if (mode === 'create') {
					router.replace(`/dashboard/properties/${saved.id}`);
					return;
				}
				setSuccess('Saved.');
			} else if (tab === 'amenities') {
				await savePropertyAmenities(propertyId as string, selectedAmenities);
				setSuccess('Amenities saved.');
			} else if (tab === 'images' && propertyId) {
				await handleImageUpload(propertyId);
				setSuccess('Images uploaded.');
			}
		} catch (submitError) {
			setError(submitError instanceof Error ? submitError.message : 'Could not save.');
		} finally {
			setSaving(false);
		}
	};

	const handleImageUpload = async (id: string) => {
		if (!imageFiles.length) return;

		const urls = await uploadFilesToCloudinary(imageFiles);
		if (!urls.length) return;

		const created = await uploadPropertyImages(id, urls);
		setImages((previous) => [...previous, ...created].sort((a, b) => a.order - b.order));
		setImageFiles([]);
	};

	const handleImageDelete = async (imageId: string) => {
		await deleteImage(imageId);
		setImages((previous) => previous.filter((image) => image.id !== imageId));
	};

	const handleCoverSelect = async (imageId: string) => {
		if (!initialProperty) return;
		const order = images.map((image) => image.id);
		const reordered = await reorderPropertyImages(initialProperty.id, order, imageId);
		setImages(reordered);
	};

	const persistOrder = async (nextImages: PropertyImage[]) => {
		if (!initialProperty) return;
		const cover_id = nextImages.find((image) => image.is_cover)?.id;
		const reordered = await reorderPropertyImages(
			initialProperty.id,
			nextImages.map((image) => image.id),
			cover_id,
		);
		setImages(reordered);
	};

	const updateForm = <K extends keyof UpsertPropertyInput>(field: K, value: UpsertPropertyInput[K]) => {
		setForm((previous) => ({ ...previous, [field]: value }));
	};

	return (
		<>
			<GoogleMapsPlacesScript
				apiKey={mapsApiKey}
				loadWhen={activeTab === 'location'}
				onLoaded={() => setGoogleMapsReady(true)}
			/>
		<div className="min-w-0 flex flex-col gap-2 mb-10">
				<p className="text-[10px] uppercase tracking-[0.2em] text-[#6B705C] sm:text-xs">
					{mode === 'create' ? 'Create property' : 'Edit property'}
				</p>
				<h1 className="truncate font-serif text-xl leading-tight text-[#1A1A1A] sm:text-2xl md:text-3xl">
					{mode === 'create' ? 'New listing' : 'Property details'}
				</h1>
		</div>
		<div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
			<PropertyFormSidebar
				mode={mode}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onEditAvailability={
					mode === 'edit' && initialProperty
					? () => router.push(`/dashboard/properties/${initialProperty.id}/calendar`)
					: undefined
				}
				/>

			<div className="min-h-[320px] space-y-6">
				{error ? <p className="rounded-xl bg-red-100/70 px-4 py-3 text-sm text-red-700">{error}</p> : null}
				{success ? <p className="rounded-xl bg-emerald-100/70 px-4 py-3 text-sm text-emerald-800">{success}</p> : null}

				<div role="tabpanel" id={`property-form-panel-${activeTab}`} aria-labelledby={`property-form-tab-${activeTab}`}>
					{activeTab === 'basic-info' ? (
						<>
							<BasicInfoSection form={form} onChange={(field, value) => updateForm(field, value)} />
							<TabSaveFooter
								label={mode === 'create' ? 'Create property' : 'Save basic info'}
								onSave={() => handleSaveTab('basic-info')}
								saving={saving}
								/>
						</>
					) : null}
					{activeTab === 'capacity' ? (
						<>
							<CapacitySection form={form} onChange={(field, value) => updateForm(field, value)} />
							<TabSaveFooter
								label={mode === 'create' ? 'Continue' : 'Save capacity'}
								onSave={() => handleSaveTab('capacity')}
								saving={saving}
								/>
						</>
					) : null}
					{activeTab === 'location' ? (
						<>
							<LocationSection
								form={form}
								placesLibraryReady={placesLibraryReady}
								onFieldChange={(field, value) => updateForm(field, value)}
								onCoordinateChange={(field, value) => updateForm(field, numberOrNull(value))}
								/>
							<TabSaveFooter
								label={mode === 'create' ? 'Continue' : 'Save location'}
								onSave={() => handleSaveTab('location')}
								saving={saving}
								/>
						</>
					) : null}
					{activeTab === 'pricing' ? (
						<>
							<PricingSection form={form} onNumberChange={(field, value) => updateForm(field, value)} />
							<TabSaveFooter
								label={mode === 'create' ? 'Continue' : 'Save pricing'}
								onSave={() => handleSaveTab('pricing')}
								saving={saving}
								/>
						</>
					) : null}
					{activeTab === 'amenities' ? (
						<>
							<AmenitiesSection
								selectedAmenities={selectedAmenities}
								onToggleAmenity={(amenityId) =>
									setSelectedAmenities((previous) =>
										previous.includes(amenityId)
								? previous.filter((id) => id !== amenityId)
								: [...previous, amenityId],
							)
						}
						/>
							<TabSaveFooter
								label="Save amenities"
								onSave={() => handleSaveTab('amenities')}
								saving={saving}
								/>
						</>
					) : null}
					{activeTab === 'images' ? (
						<>
							<ImagesSection
								mode={mode}
								initialPropertyId={initialProperty?.id}
								images={images}
								imageFiles={imageFiles}
								draggingId={draggingId}
								onImageFilesChange={setImageFiles}
								onDragStart={setDraggingId}
								onDrop={(targetImageId) => {
									if (!draggingId || draggingId === targetImageId) return;
									const from = images.findIndex((item) => item.id === draggingId);
									const to = images.findIndex((item) => item.id === targetImageId);
									const next = [...images];
									const [moved] = next.splice(from, 1);
									next.splice(to, 0, moved);
									const normalized = next.map((item, index) => ({ ...item, order: index }));
									void persistOrder(normalized);
								}}
								onSetCover={(imageId) => void handleCoverSelect(imageId)}
								onDelete={(imageId) => void handleImageDelete(imageId)}
								/>
							<TabSaveFooter
								label="Upload images"
								onSave={() => handleSaveTab('images')}
								disabled={saving || (Boolean(propertyId) && !imageFiles.length)}
								saving={saving}
								/>
						</>
					) : null}
				</div>
			</div>
		</div>
					</>
	);
}
