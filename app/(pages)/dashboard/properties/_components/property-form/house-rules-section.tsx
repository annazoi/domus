import { zodResolver } from '@hookform/resolvers/zod';
import { Clock3 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Input, MinimalRichText, Select, useToast } from '@/components/ui';
import { useUpdateProperty } from '@/features/property/hooks/use-property';
import type { Property, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PROPERTY_FORM_DEFAULT_VALUES } from './constants';
import { PropertyFormSection } from './property-form-section';
import { houseRulesFormSchema, type HouseRulesFormValues } from './schemas';

type HouseRulesSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	propertyId?: string;
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

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
	const hour = Math.floor(index / 2);
	const minute = index % 2 === 0 ? 0 : 30;
	const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
	return { value, label: formatTimeLabel(value) };
});

export function HouseRulesSection({ initialProperty, propertyId: propertyIdProp }: HouseRulesSectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const { push } = useToast();
	const { mutateAsync: update, isPending: saving } = useUpdateProperty(propertyId);
	const defaults: UpsertPropertyInput = initialProperty ? { ...initialProperty } : PROPERTY_FORM_DEFAULT_VALUES;
	const checkIn = normalizeTimeValue(defaults.check_in_time, PROPERTY_FORM_DEFAULT_VALUES.check_in_time);
	const checkOut = normalizeTimeValue(defaults.check_out_time, PROPERTY_FORM_DEFAULT_VALUES.check_out_time);

	const { control, handleSubmit, reset } = useForm<HouseRulesFormValues>({
		resolver: zodResolver(houseRulesFormSchema),
		defaultValues: {
			check_in_time: checkIn,
			check_out_time: checkOut,
			door_code: defaults.door_code ?? '',
			safe_box_code: defaults.safe_box_code ?? '',
			house_rules_instructions: defaults.house_rules_instructions ?? '',
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
				check_in_time: normalizeTimeValue(saved.check_in_time, PROPERTY_FORM_DEFAULT_VALUES.check_in_time),
				check_out_time: normalizeTimeValue(saved.check_out_time, PROPERTY_FORM_DEFAULT_VALUES.check_out_time),
				door_code: saved.door_code ?? '',
				safe_box_code: saved.safe_box_code ?? '',
				house_rules_instructions: saved.house_rules_instructions ?? '',
			});
			push({ title: 'Saved.', tone: 'success' });
		} catch (e) {
			push({ title: e instanceof Error ? e.message : 'Could not save.', tone: 'error' });
		}
	});

	return (
		<PropertyFormSection id="house-rules" title="House rules">
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-check-in-time" className="text-sm font-medium text-espresso">
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
								<Clock3 className="pointer-events-none absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 text-camel/45" />
							</div>
						)}
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-check-out-time" className="text-sm font-medium text-espresso">
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
								<Clock3 className="pointer-events-none absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 text-camel/45" />
							</div>
						)}
					/>
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-door-code" className="text-sm font-medium text-espresso">
						Door code
					</label>
					<Controller
						control={control}
						name="door_code"
						render={({ field }) => (
							<Input
								id="property-door-code"
								value={field.value ?? ''}
								onChange={field.onChange}
								placeholder="Enter door code"
								autoComplete="off"
							/>
						)}
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-safe-box-code" className="text-sm font-medium text-espresso">
						Safe box code
					</label>
					<Controller
						control={control}
						name="safe_box_code"
						render={({ field }) => (
							<Input
								id="property-safe-box-code"
								value={field.value ?? ''}
								onChange={field.onChange}
								placeholder="Enter safe box code"
								autoComplete="off"
							/>
						)}
					/>
				</div>
			</div>
			<Controller
				control={control}
				name="house_rules_instructions"
				render={({ field }) => (
					<MinimalRichText
						id="property-house-rules-instructions"
						label="Instructions"
						value={field.value ?? ''}
						onChange={field.onChange}
						placeholder="Entry steps, lock details, or other notes for guests…"
						editorMinHeight="min-h-[160px]"
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
