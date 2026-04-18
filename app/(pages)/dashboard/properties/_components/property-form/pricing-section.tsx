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
				<div className="space-y-1.5">
					<label htmlFor="price-per-night" className="text-sm font-medium text-[#1A1A1A]">
						Price per night *
					</label>
					<input
						id="price-per-night"
						type="number"
						min={0}
						value={form.pricePerNight}
						onChange={(event) => onNumberChange('pricePerNight', Number(event.target.value))}
						placeholder="Enter price per night"
						className="w-full rounded-xl border border-black/10 px-4 py-3"
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="cleaning-fee" className="text-sm font-medium text-[#1A1A1A]">
						Cleaning fee
					</label>
					<input
						id="cleaning-fee"
						type="number"
						min={0}
						value={form.cleaningFee}
						onChange={(event) => onNumberChange('cleaningFee', Number(event.target.value))}
						placeholder="Enter cleaning fee"
						className="w-full rounded-xl border border-black/10 px-4 py-3"
					/>
				</div>
			</div>
		</PropertyFormSection>
	);
}
