import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Button, Input, Select, useToast } from '@/components/ui';
import { ApartmentOptions } from '@/config/constants/dropdowns/apartment.options';
import { RoomTypeOptions } from '@/config/constants/dropdowns/room-type.options';
import { useCreateProperty, useUpdateProperty } from '@/features/property/hooks/use-property';
import type { Property, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PROPERTY_FORM_DEFAULT_VALUES } from './constants';
import { PropertyFormSection } from './property-form-section';
import { basicInfoFormSchema, type BasicInfoFormValues } from './schemas';

type BasicInfoSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	createdPropertyId?: string | null;
	onPropertyCreated?: (id: string) => void;
	/** Omit inner section heading (e.g. modal supplies its own title). */
	hideSectionHeading?: boolean;
	submitLabel?: string;
};

function normalizePropertyType(value: string | null | undefined, fallback: string) {
	if (!value) return fallback;
	return ApartmentOptions.some((option) => option.value === value)
		? value
		: fallback;
}

function normalizeRoomType(value: string | null | undefined, fallback: string) {
	if (!value) return fallback;
	return RoomTypeOptions.some((option) => option.value === value)
		? value
		: fallback;
}

export function BasicInfoSection({
	mode,
	initialProperty,
	createdPropertyId = null,
	onPropertyCreated,
	hideSectionHeading = false,
	submitLabel = 'Save',
}: BasicInfoSectionProps) {
	const { push } = useToast();
	const [slugHelpOpen, setSlugHelpOpen] = useState(false);
	const { mutateAsync: create, isPending: creating } = useCreateProperty();
	const targetPropertyId = initialProperty?.id ?? createdPropertyId ?? '';
	const { mutateAsync: update, isPending: updating } = useUpdateProperty(targetPropertyId);
	const saving = creating || updating;
	const defaultValues: UpsertPropertyInput = initialProperty ? { ...initialProperty } : PROPERTY_FORM_DEFAULT_VALUES;
	const normalizedPropertyType = normalizePropertyType(defaultValues.property_type, PROPERTY_FORM_DEFAULT_VALUES.property_type);
	const normalizedRoomType = normalizeRoomType(defaultValues.room_type, PROPERTY_FORM_DEFAULT_VALUES.room_type);

	const {
		control,
		register,
		handleSubmit,
		setError: setFieldError,
		setValue,
		watch,
		formState: { errors },
	} = useForm<BasicInfoFormValues>({
		resolver: zodResolver(basicInfoFormSchema),
		defaultValues: {
			title: defaultValues.title,
			slug: defaultValues.slug,
			property_type: normalizedPropertyType,
			room_type: normalizedRoomType,
			isVisible: defaultValues.isVisible,
		},
	});

	const isVisible = watch('isVisible') ?? defaultValues.isVisible;
	const selectedRoomType = watch('room_type');
	const selectedPropertyType = watch('property_type');
	const selectedRoomTypeOption = RoomTypeOptions.find((option) => option.value === selectedRoomType);

	const toggleIsVisible = () => {
		setValue('isVisible', !isVisible, { shouldValidate: true, shouldDirty: true });
	};

	const handlePropertyTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setValue('property_type', event.target.value);
	};

	const handleRoomTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setValue('room_type', event.target.value);
	};

	const handleSave = handleSubmit(async (formValues) => {
		const payload: UpsertPropertyInput = { ...defaultValues, ...formValues };
		try {
			if (mode === 'create' && !createdPropertyId && !initialProperty?.id) {
				const saved = await create(payload);
				onPropertyCreated?.(saved.id);
				push({ title: 'Saved.', tone: 'success' });
				return;
			}

			if (!targetPropertyId) return;
			await update(payload);
			push({ title: 'Saved.', tone: 'success' });
		} catch (submitError) {
			console.error('Basic info save failed', submitError);
			const message = submitError instanceof Error ? submitError.message : 'Could not save property. Please try again.';
			if (message.toLowerCase().includes('slug')) {
				setFieldError('slug', { type: 'server', message });
				return;
			}
			push({ title: message, tone: 'error' });
		}
	});

	return (
		<PropertyFormSection id="basic-info" title={hideSectionHeading ? undefined : 'Basic info'}>
			<div className="flex flex-col gap-3 rounded-xl border border-black/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
				<div className="min-w-0">
					<p className="text-sm font-medium text-[#1A1A1A]">Listing status</p>
					<div className="overflow-hidden">
						<AnimatePresence mode="wait" initial={false}>
							<motion.p
								key={isVisible ? 'published' : 'draft'}
								initial={{ opacity: 0, x: 12 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -12 }}
								transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
								className="text-xs text-[#1A1A1A]/55"
							>
								{isVisible ? 'Published: visible to guests.' : 'Draft: hidden from search and listings.'}
							</motion.p>
						</AnimatePresence>
					</div>
				</div>
				<Button
					type="button"
					variant="custom"
					role="switch"
					aria-checked={isVisible}
					aria-label={isVisible ? 'Published: click to unpublish' : 'Draft: click to publish'}
					onClick={toggleIsVisible}
					className={[
						'relative inline-flex h-9 w-14 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]',
						isVisible ? 'bg-emerald-600' : 'bg-black/15',
					].join(' ')}
				>
					<span
						className={[
							'ml-1 inline-block h-7 w-7 rounded-full bg-white shadow transition-transform',
							isVisible ? 'translate-x-5' : 'translate-x-0',
						].join(' ')}
					/>
				</Button>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-title" className="text-sm font-medium text-[#1A1A1A]">
						Title *
					</label>
					<Input
						id="property-title"
						{...register('title')}
						placeholder="Enter title"
					/>
					{errors.title?.message ? <p className="text-xs text-red-700">{errors.title.message}</p> : null}
				</div>
				<div className="space-y-1.5">
					<div className="flex items-center gap-1.5">
						<label htmlFor="property-slug" className="text-sm font-medium text-[#1A1A1A]">
							Slug *
						</label>
						<div className="group relative">
							<button
								type="button"
								onClick={() => setSlugHelpOpen((prev) => !prev)}
								onBlur={() => setSlugHelpOpen(false)}
								aria-label="What is slug?"
								className="flex h-4.5 w-4.5 items-center justify-center rounded-full border border-black/20 text-[10px] font-semibold text-[#1A1A1A]/70"
							>
								?
							</button>
							<div
								className={[
									'pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-56 -translate-x-1/2 rounded-md bg-[#1A1A1A] px-2 py-1.5 text-[11px] text-white shadow-lg transition-opacity',
									slugHelpOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
								].join(' ')}
							>
								Slug is URL-safe name for listing, like `my-sea-view-apartment`.
							</div>
						</div>
					</div>
					<Input
						id="property-slug"
						{...register('slug')}
						placeholder="Enter slug"
					/>
					{errors.slug?.message ? <p className="text-xs text-red-700">{errors.slug.message}</p> : null}
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-type" className="text-sm font-medium text-[#1A1A1A]">
						Property type
					</label>
					<Select
						id="property-type"
						variant="default"
						{...register('property_type')}
						value={selectedPropertyType}
						onChange={handlePropertyTypeChange}
						className='z-10'
					>
						{ApartmentOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
							
						))}
					</Select>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-room-type" className="text-sm font-medium text-[#1A1A1A]">
						Room type
					</label>
					<Select
						id="property-room-type"
						variant="default"
						{...register('room_type')}
						value={selectedRoomType}
						onChange={handleRoomTypeChange}
					>
						{RoomTypeOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
					{selectedRoomTypeOption ? (
						<p className="text-xs text-[#1A1A1A]/55">{selectedRoomTypeOption.description}</p>
					) : null}
				</div>
			</div>

			<div className="mt-2 flex justify-end border-t border-black/5 pt-5">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : submitLabel}
				</Button>
			</div>
		</PropertyFormSection>
	);
}
