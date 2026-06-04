import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { useToast } from '@/components/ui';
import { useUpdateProperty } from '@/features/property/hooks/use-property';
import type { Property, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PROPERTY_FORM_DEFAULT_VALUES } from './constants';
import { PropertyFormSection } from './property-form-section';
import { capacityFormSchema, type CapacityFormValues } from './schemas';

type CapacitySectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	propertyId?: string;
};

const capacityFields: Array<{ key: 'max_guests' | 'bedrooms' | 'beds' | 'bathrooms'; label: string }> = [
	{ key: 'max_guests', label: 'Guests *' },
	{ key: 'bedrooms', label: 'Bedrooms' },
	{ key: 'beds', label: 'Beds' },
	{ key: 'bathrooms', label: 'Bathrooms' },
];

export function CapacitySection({ initialProperty, propertyId: propertyIdProp }: CapacitySectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const { push } = useToast();
	const { mutateAsync: update, isPending: saving } = useUpdateProperty(propertyId);
	const defaultValues: UpsertPropertyInput = initialProperty ? { ...initialProperty } : PROPERTY_FORM_DEFAULT_VALUES;
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CapacityFormValues>({
		resolver: zodResolver(capacityFormSchema),
		defaultValues: {
			max_guests: defaultValues.max_guests,
			bedrooms: defaultValues.bedrooms,
			beds: defaultValues.beds,
			bathrooms: defaultValues.bathrooms,
		},
	});

	const handleSave = handleSubmit(async (formValues) => {
		const payload: UpsertPropertyInput = { ...defaultValues, ...formValues };

		if (!propertyId) {
			push({ title: 'Save Basic info first to create the property.', tone: 'error' });
			return;
		}

		try {
			const saved = await update(payload);
			reset({
				max_guests: saved.max_guests,
				bedrooms: saved.bedrooms,
				beds: saved.beds,
				bathrooms: saved.bathrooms,
			});
			push({ title: 'Saved.', tone: 'success' });
		} catch (submitError) {
			push({ title: submitError instanceof Error ? submitError.message : 'Could not save.', tone: 'error' });
		}
	});

	return (
		<PropertyFormSection id="capacity" title="Capacity">
			<div className="grid gap-4 md:grid-cols-4">
				{capacityFields.map((field) => (
					<div key={field.key} className="space-y-1.5">
						<label htmlFor={`capacity-${field.key}`} className="text-sm font-medium text-espresso">
							{field.label}
						</label>
						<Input
							id={`capacity-${field.key}`}
							type="number"
							min={0}
							{...register(field.key, { valueAsNumber: true })}
							placeholder={`Enter ${field.label.replace(' *', '').toLowerCase()}`}
						/>
						{errors[field.key]?.message ? <p className="text-xs text-red-700">{errors[field.key]?.message}</p> : null}
					</div>
				))}
			</div>
			<div className="mt-2 flex justify-end border-t border-black/5 pt-5">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</PropertyFormSection>
	);
}
