'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button, MinimalRichText, useToast } from '@/components/ui';
import { useUpdateProperty } from '@/features/property/hooks/use-property';
import type { Property, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PROPERTY_FORM_DEFAULT_VALUES } from './constants';
import { PropertyFormSection } from './property-form-section';
import { descriptionFormSchema, type DescriptionFormValues } from './schemas';

type DescriptionSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	propertyId?: string;
};

export function DescriptionSection({ initialProperty, propertyId: propertyIdProp }: DescriptionSectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const [accessHelpOpen, setAccessHelpOpen] = useState(false);
	const { push } = useToast();
	const { mutateAsync: update, isPending: saving } = useUpdateProperty(propertyId);
	const defaults: UpsertPropertyInput = initialProperty ? { ...initialProperty } : PROPERTY_FORM_DEFAULT_VALUES;

	const { control, handleSubmit, reset } = useForm<DescriptionFormValues>({
		resolver: zodResolver(descriptionFormSchema),
		defaultValues: {
			description: defaults.description ?? '',
			short_description: defaults.short_description ?? '',
			location_access: defaults.location_access ?? '',
		},
	});

	const handleSave = handleSubmit(async (formValues) => {
		const payload: UpsertPropertyInput = { ...defaults, ...formValues };
		if (!propertyId) {
			push({ title: 'Save Basic info first to create the property.', tone: 'error' });
			return;
		}
		try {
			const saved = await update(payload);
			reset({
				description: saved.description ?? '',
				short_description: saved.short_description ?? '',
				location_access: saved.location_access ?? '',
			});
			push({ title: 'Saved.', tone: 'success' });
		} catch (e) {
			push({ title: e instanceof Error ? e.message : 'Could not save.', tone: 'error' });
		}
	});

	return (
		<PropertyFormSection id="description" title="Description">
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
			<div className="space-y-1.5">
				<div className="flex items-center gap-1.5">
					<label htmlFor="property-location-access" className="text-sm font-medium text-espresso">
						Access
					</label>
					<div className="group relative">
						<button
							type="button"
							onClick={() => setAccessHelpOpen((prev) => !prev)}
							onBlur={() => setAccessHelpOpen(false)}
							aria-label="What is access?"
							className="flex h-4.5 w-4.5 items-center justify-center rounded-full border border-black/20 text-[10px] font-semibold text-espresso/70"
						>
							?
						</button>
						<div
							className={[
								'pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-64 -translate-x-1/2 rounded-md bg-espresso px-2 py-1.5 text-[11px] text-white shadow-lg transition-opacity',
								accessHelpOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
							].join(' ')}
						>
							Explain how guests reach and enter your property - directions, parking, gate codes, lockbox or smart-lock instructions.
						</div>
					</div>
				</div>
				<Controller
					control={control}
					name="location_access"
					render={({ field }) => (
						<MinimalRichText
							id="property-location-access"
							label=""
							value={field.value ?? ''}
							onChange={field.onChange}
							placeholder="How guests get to and into your place…"
							editorMinHeight="min-h-[120px]"
						/>
					)}
				/>
			</div>
			<div className="mt-2 flex justify-end pt-5">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</PropertyFormSection>
	);
}
