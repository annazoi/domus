'use client';

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
	const { push } = useToast();
	const { mutateAsync: update, isPending: saving } = useUpdateProperty(propertyId);
	const defaults: UpsertPropertyInput = initialProperty ? { ...initialProperty } : PROPERTY_FORM_DEFAULT_VALUES;

	const { control, handleSubmit, reset } = useForm<DescriptionFormValues>({
		resolver: zodResolver(descriptionFormSchema),
		defaultValues: {
			description: defaults.description ?? '',
			short_description: defaults.short_description ?? '',
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
			<div className="mt-2 flex justify-end border-t border-black/5 pt-5">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</PropertyFormSection>
	);
}
