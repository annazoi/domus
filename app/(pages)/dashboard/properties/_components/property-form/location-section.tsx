'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { PlacesAutocompleteInput, type PlaceSelection } from '@/components/google-maps';
import { Button, Input, useToast } from '@/components/ui';
import { useUpdateProperty } from '@/features/property/hooks/use-property';
import type { Property, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PROPERTY_FORM_DEFAULT_VALUES } from './constants';
import { PropertyFormSection } from './property-form-section';
import { locationFormSchema, type LocationFormValues } from './schemas';

type LocationSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	propertyId?: string;
	placesLibraryReady?: boolean;
};

const numberOrNull = (value: string) => {
	if (!value.trim()) return null;
	const numeric = Number(value);
	return Number.isNaN(numeric) ? null : numeric;
};

function applyPlaceToForm(
	place: PlaceSelection,
	onFieldChange: (field: 'country' | 'city' | 'address', value: string) => void,
	onCoordinateChange: (field: 'lat' | 'lng', value: number | null) => void,
) {
	onFieldChange('country', place.country);
	onFieldChange('city', place.city);
	onFieldChange('address', place.formattedAddress);
	if (place.lat != null) {
		onCoordinateChange('lat', place.lat);
	}
	if (place.lng != null) {
		onCoordinateChange('lng', place.lng);
	}
}

export function LocationSection({
	initialProperty,
	propertyId: propertyIdProp,
	placesLibraryReady = false,
}: LocationSectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const { push } = useToast();
	const { mutateAsync: update, isPending: saving } = useUpdateProperty(propertyId);
	const defaultValues: UpsertPropertyInput = initialProperty ? { ...initialProperty } : PROPERTY_FORM_DEFAULT_VALUES;
	const {
		register,
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<LocationFormValues>({
		resolver: zodResolver(locationFormSchema),
		defaultValues: {
			address: defaultValues.address,
			country: defaultValues.country,
			city: defaultValues.city,
			lat: defaultValues.lat,
			lng: defaultValues.lng,
		},
	});

	const handleSave = handleSubmit(async (formValues: LocationFormValues) => {
		const payload: UpsertPropertyInput = { ...defaultValues, ...formValues };

		if (!propertyId) {
			push({ title: 'Save Basic info first to create the property.', tone: 'error' });
			return;
		}

		try {
			await update(payload);
			push({ title: 'Saved.', tone: 'success' });
		} catch (submitError) {
			push({ title: submitError instanceof Error ? submitError.message : 'Could not save.', tone: 'error' });
		}
	});

	return (
		<PropertyFormSection id="location" title="Location">
			<div className="space-y-1.5">
				<label htmlFor="property-address" className="text-sm font-medium text-[#1A1A1A]">
					Address
				</label>
				<Controller
					control={control}
					name="address"
					render={({ field }) => (
						<PlacesAutocompleteInput
							id="property-address"
							placesLibraryReady={placesLibraryReady}
							value={field.value}
							onChange={field.onChange}
							onPlaceSelect={(place) =>
								applyPlaceToForm(
									place,
									(name, value) => setValue(name, value, { shouldValidate: true, shouldDirty: true }),
									(name, value) => setValue(name, value, { shouldValidate: true, shouldDirty: true }),
								)
							}
							placeholder="Search or enter address"
							autoComplete="off"
						/>
					)}
				/>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-country" className="text-sm font-medium text-[#1A1A1A]">
						Country
					</label>
					<Input
						id="property-country"
						{...register('country')}
						placeholder="Enter country"
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-city" className="text-sm font-medium text-[#1A1A1A]">
						City
					</label>
					<Input
						id="property-city"
						{...register('city')}
						placeholder="Enter city"
					/>
				</div>
			</div>
		
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-latitude" className="text-sm font-medium text-[#1A1A1A]">
						Latitude
					</label>
					<Controller
						control={control}
						name="lat"
						render={({ field }) => (
							<Input
								id="property-latitude"
								value={field.value ?? ''}
								onChange={(event) => field.onChange(numberOrNull(event.target.value))}
								placeholder="Enter latitude"
							/>
						)}
					/>
					{errors.lat?.message ? <p className="text-xs text-red-700">{errors.lat.message}</p> : null}
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-longitude" className="text-sm font-medium text-[#1A1A1A]">
						Longitude
					</label>
					<Controller
						control={control}
						name="lng"
						render={({ field }) => (
							<Input
								id="property-longitude"
								value={field.value ?? ''}
								onChange={(event) => field.onChange(numberOrNull(event.target.value))}
								placeholder="Enter longitude"
							/>
						)}
					/>
					{errors.lng?.message ? <p className="text-xs text-red-700">{errors.lng.message}</p> : null}
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
