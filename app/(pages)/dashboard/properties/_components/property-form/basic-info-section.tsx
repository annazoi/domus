import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { Button, Input, MinimalRichText, Select } from '@/components/ui';
import { ApartmentOptions } from '@/config/constants/dropdowns/apartment.options';
import { useCreateProperty, useUpdateProperty } from '@/features/property/hooks/use-property';
import type { Property, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PROPERTY_FORM_DEFAULT_VALUES } from './constants';
import { PropertyFormSection } from './property-form-section';
import { basicInfoFormSchema, type BasicInfoFormValues } from './schemas';

type BasicInfoSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
};

export function BasicInfoSection({ mode, initialProperty }: BasicInfoSectionProps) {
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
	const { mutateAsync: create, isPending: creating } = useCreateProperty();
	const targetPropertyId = initialProperty?.id ?? createdPropertyId ?? '';
	const { mutateAsync: update, isPending: updating } = useUpdateProperty(targetPropertyId);
	const saving = creating || updating;
	const defaultValues: UpsertPropertyInput = initialProperty ? { ...initialProperty } : PROPERTY_FORM_DEFAULT_VALUES;

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
			check_in_time: defaultValues.check_in_time,
			check_out_time: defaultValues.check_out_time,
			property_type: defaultValues.property_type,
			room_type: defaultValues.room_type,
			isVisible: defaultValues.isVisible,
		},
	});

	const isVisible = watch('isVisible') ?? defaultValues.isVisible;

	const toggleIsVisible = () => {
		setValue('isVisible', !isVisible, { shouldValidate: true, shouldDirty: true });
	};

	const handleSave = handleSubmit(async (formValues) => {
		setError('');
		setSuccess('');
		const payload: UpsertPropertyInput = { ...defaultValues, ...formValues };
		try {
			if (mode === 'create' && !createdPropertyId && !initialProperty?.id) {
				const saved = await create(payload);
				setCreatedPropertyId(saved.id);
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
						value={defaultValues.property_type}
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
					<Input
						id="property-room-type"
						{...register('room_type')}
						placeholder="Enter room type"
					/>
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
					<Input
						id="property-check-in-time"
						type="time"
						step={300}
						{...register('check_in_time')}
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-check-out-time" className="text-sm font-medium text-[#1A1A1A]">
						Check-out time
					</label>
					<Input
						id="property-check-out-time"
						type="time"
						step={300}
						{...register('check_out_time')}
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
