import { Input } from '@/components/ui';
import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type CapacitySectionProps = {
	form: UpsertPropertyInput;
	onChange: (field: 'max_guests' | 'bedrooms' | 'beds' | 'bathrooms', value: number) => void;
};

const capacityFields: Array<{ key: 'max_guests' | 'bedrooms' | 'beds' | 'bathrooms'; label: string }> = [
	{ key: 'max_guests', label: 'Guests *' },
	{ key: 'bedrooms', label: 'Bedrooms' },
	{ key: 'beds', label: 'Beds' },
	{ key: 'bathrooms', label: 'Bathrooms' },
];

export function CapacitySection({ form, onChange }: CapacitySectionProps) {
	return (
		<PropertyFormSection id="capacity" title="Capacity">
			<div className="grid gap-4 md:grid-cols-4">
				{capacityFields.map((field) => (
					<div key={field.key} className="space-y-1.5">
						<label htmlFor={`capacity-${field.key}`} className="text-sm font-medium text-[#1A1A1A]">
							{field.label}
						</label>
						<Input
							id={`capacity-${field.key}`}
							type="number"
							min={0}
							value={form[field.key]}
							onChange={(event) => onChange(field.key, Number(event.target.value))}
							placeholder={`Enter ${field.label.replace(' *', '').toLowerCase()}`}
						/>
					</div>
				))}
			</div>
		</PropertyFormSection>
	);
}
