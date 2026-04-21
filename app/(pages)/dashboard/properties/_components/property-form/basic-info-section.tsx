import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock3 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Input, MinimalRichText, Select } from '@/components/ui';
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
};

function formatTimeLabel(value: string) {
	const [rawHour, rawMinute] = value.split(':');
	const hour = Number(rawHour);
	const minute = Number(rawMinute);
	const suffix = hour >= 12 ? 'PM' : 'AM';
	const hour12 = hour % 12 === 0 ? 12 : hour % 12;
	return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function normalizeTimeValue(value: string | null | undefined, fallback: string) {
	if (!value) return fallback;
	const match = value.match(/^(\d{1,2}):(\d{2})/);
	if (!match) return fallback;
	const hour = Number(match[1]);
	const minute = Number(match[2]);
	if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return fallback;
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

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

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
	const hour = Math.floor(index / 2);
	const minute = index % 2 === 0 ? 0 : 30;
	const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
	return { value, label: formatTimeLabel(value) };
});

export function BasicInfoSection({
	mode,
	initialProperty,
	createdPropertyId = null,
	onPropertyCreated,
}: BasicInfoSectionProps) {
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const { mutateAsync: create, isPending: creating } = useCreateProperty();
	const targetPropertyId = initialProperty?.id ?? createdPropertyId ?? '';
	const { mutateAsync: update, isPending: updating } = useUpdateProperty(targetPropertyId);
	const saving = creating || updating;
	const defaultValues: UpsertPropertyInput = initialProperty ? { ...initialProperty } : PROPERTY_FORM_DEFAULT_VALUES;
	const normalizedCheckIn = normalizeTimeValue(defaultValues.check_in_time, PROPERTY_FORM_DEFAULT_VALUES.check_in_time);
	const normalizedCheckOut = normalizeTimeValue(defaultValues.check_out_time, PROPERTY_FORM_DEFAULT_VALUES.check_out_time);
	const normalizedPropertyType = normalizePropertyType(defaultValues.property_type, PROPERTY_FORM_DEFAULT_VALUES.property_type);
	const normalizedRoomType = normalizeRoomType(defaultValues.room_type, PROPERTY_FORM_DEFAULT_VALUES.room_type);

	const {
		control,
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<BasicInfoFormValues>({
		resolver: zodResolver(basicInfoFormSchema),
		defaultValues: {
			title: defaultValues.title,
			slug: defaultValues.slug,
			description: defaultValues.description,
			short_description: defaultValues.short_description,
			check_in_time: normalizedCheckIn,
			check_out_time: normalizedCheckOut,
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
		setError('');
		setSuccess('');
		const payload: UpsertPropertyInput = { ...defaultValues, ...formValues };
		try {
			if (mode === 'create' && !createdPropertyId && !initialProperty?.id) {
				const saved = await create(payload);
				onPropertyCreated?.(saved.id);
				setSuccess('Saved.');
				return;
			}

			if (!targetPropertyId) return;
			await update(payload);
			setSuccess('Saved.');
		} catch (submitError) {
			console.error('Basic info save failed', submitError);
			setError('Could not save property. Please try again.');
		}
	});

	return (
		<PropertyFormSection id="basic-info" title="Basic info">
			{error ? <p className="rounded-xl bg-red-100/70 px-4 py-3 text-sm text-red-700">{error}</p> : null}
			{success ? <p className="rounded-xl bg-emerald-100/70 px-4 py-3 text-sm text-emerald-800">{success}</p> : null}
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
					<label htmlFor="property-slug" className="text-sm font-medium text-[#1A1A1A]">
						Slug *
					</label>
					<Input
						id="property-slug"
						{...register('slug')}
						placeholder="Enter slug"
					/>
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
			<Controller
				control={control}
				name="description"
				render={({ field }) => (
					<MinimalRichText
						id="property-description"
						label="Description"
						value={field.value}
						onChange={field.onChange}
						placeholder="Describe your space…"
						editorMinHeight="min-h-[160px]"
					/>
				)}
			/>
			<Controller
				control={control}
				name="short_description"
				render={({ field }) => (
					<MinimalRichText
						id="property-short-description"
						label="Short description"
						value={field.value ?? ''}
						onChange={field.onChange}
						placeholder="A line or two for cards and search…"
						editorMinHeight="min-h-[100px]"
					/>
				)}
			/>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-check-in-time" className="text-sm font-medium text-[#1A1A1A]">
						Check-in time
					</label>
					<Controller
						control={control}
						name="check_in_time"
						render={({ field }) => (
							<div className="relative">
								<Select
									id="property-check-in-time"
									variant="default"
									className="[&_button]:pr-16"
									value={field.value}
									onChange={(event) => field.onChange(event.target.value)}
								>
									{TIME_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</Select>
								<Clock3 className="pointer-events-none absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B705C]/45" />
							</div>
						)}
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-check-out-time" className="text-sm font-medium text-[#1A1A1A]">
						Check-out time
					</label>
					<Controller
						control={control}
						name="check_out_time"
						render={({ field }) => (
							<div className="relative">
								<Select
									id="property-check-out-time"
									variant="default"
									className="[&_button]:pr-16"
									value={field.value}
									onChange={(event) => field.onChange(event.target.value)}
								>
									{TIME_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</Select>
								<Clock3 className="pointer-events-none absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B705C]/45" />
							</div>
						)}
					/>
				</div>
			</div>
			<div className="mt-2 flex justify-end border-t border-black/5 pt-5">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</PropertyFormSection>
	);
}
