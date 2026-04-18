import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type PricingSectionProps = {
	form: UpsertPropertyInput;
	onNumberChange: (field: 'pricePerNight' | 'cleaningFee', value: number) => void;
};

export function PricingSection({ form, onNumberChange }: PricingSectionProps) {
	return (
		<PropertyFormSection id="pricing" title="Pricing">
			<div className="grid gap-4 md:grid-cols-2">
				<input
					type="number"
					min={0}
					value={form.pricePerNight}
					onChange={(event) => onNumberChange('pricePerNight', Number(event.target.value))}
					placeholder="Price per night *"
					className="rounded-xl border border-black/10 px-4 py-3"
				/>
				<input
					type="number"
					min={0}
					value={form.cleaningFee}
					onChange={(event) => onNumberChange('cleaningFee', Number(event.target.value))}
					placeholder="Cleaning fee"
					className="rounded-xl border border-black/10 px-4 py-3"
				/>
			</div>
		</PropertyFormSection>
	);
}
