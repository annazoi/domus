import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type PricingSectionProps = {
	form: UpsertPropertyInput;
	onNumberChange: (field: 'cleaning_fee', value: number) => void;
};

export function PricingSection({ form, onNumberChange }: PricingSectionProps) {
	return (
		<PropertyFormSection id="pricing" title="Pricing">
			<p className="text-sm text-[#1A1A1A]/65">
				Nightly rates are set per day on the property calendar.
			</p>
			<div className="mt-4 grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="cleaning-fee" className="text-sm font-medium text-[#1A1A1A]">
						Cleaning fee
					</label>
					<input
						id="cleaning-fee"
						type="number"
						min={0}
						value={form.cleaning_fee}
						onChange={(event) => onNumberChange('cleaning_fee', Number(event.target.value))}
						placeholder="Enter cleaning fee"
						className="w-full rounded-xl border border-black/10 px-4 py-3"
					/>
				</div>
			</div>
		</PropertyFormSection>
	);
}
