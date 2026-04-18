import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type CapacitySectionProps = {
	form: UpsertPropertyInput;
	onChange: (field: 'guests' | 'bedrooms' | 'beds' | 'bathrooms', value: number) => void;
};

const capacityFields: Array<{ key: 'guests' | 'bedrooms' | 'beds' | 'bathrooms'; label: string }> = [
	{ key: 'guests', label: 'Guests *' },
	{ key: 'bedrooms', label: 'Bedrooms' },
	{ key: 'beds', label: 'Beds' },
	{ key: 'bathrooms', label: 'Bathrooms' },
];

export function CapacitySection({ form, onChange }: CapacitySectionProps) {
	return (
		<PropertyFormSection id="capacity" title="Capacity">
			<div className="grid gap-4 md:grid-cols-4">
				{capacityFields.map((field) => (
					<input
						key={field.key}
						type="number"
						min={0}
						value={form[field.key]}
						onChange={(event) => onChange(field.key, Number(event.target.value))}
						placeholder={field.label}
						className="rounded-xl border border-black/10 px-4 py-3"
					/>
				))}
			</div>
		</PropertyFormSection>
	);
}
