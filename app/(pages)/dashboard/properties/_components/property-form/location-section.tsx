'use client';
import { useState } from 'react';
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

const hasSetCoordinates = (lat: number | null | undefined, lng: number | null | undefined) => {
	if (lat == null || lng == null) return false;
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
	if (lat === 0 && lng === 0) return false;
	return true;
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
	const [showMapPreview, setShowMapPreview] = useState(false);
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const { push } = useToast();
	const { mutateAsync: update, isPending: saving } = useUpdateProperty(propertyId);
	const defaultValues: UpsertPropertyInput = initialProperty ? { ...initialProperty } : PROPERTY_FORM_DEFAULT_VALUES;
	const {
		register,
		control,
		handleSubmit,
		setValue,
		watch,
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

	const lat = watch('lat');
	const lng = watch('lng');
	const mapEmbedSrc =
		showMapPreview && hasSetCoordinates(lat, lng)
			? `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=15&output=embed`
			: null;

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
				<label htmlFor="property-address" className="text-sm font-medium text-espresso">
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
							onPlaceSelect={(place) => {
								applyPlaceToForm(
									place,
									(name, value) => setValue(name, value, { shouldValidate: true, shouldDirty: true }),
									(name, value) => setValue(name, value, { shouldValidate: true, shouldDirty: true }),
								);
								setShowMapPreview(hasSetCoordinates(place.lat, place.lng));
							}}
							placeholder="Search or enter address"
							autoComplete="off"
						/>
					)}
				/>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-country" className="text-sm font-medium text-espresso">
						Country
					</label>
					<Input
						id="property-country"
						{...register('country')}
						placeholder="Enter country"
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-city" className="text-sm font-medium text-espresso">
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
					<label htmlFor="property-latitude" className="text-sm font-medium text-espresso">
						Latitude
					</label>
					<Controller
						control={control}
						name="lat"
						render={({ field }) => (
							<Input
								id="property-latitude"
								value={field.value ?? ''}
								onChange={(event) => {
									const nextLat = numberOrNull(event.target.value);
									field.onChange(nextLat);
									setShowMapPreview(hasSetCoordinates(nextLat, watch('lng')));
								}}
								placeholder="Enter latitude"
							/>
						)}
					/>
					{errors.lat?.message ? <p className="text-xs text-red-700">{errors.lat.message}</p> : null}
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-longitude" className="text-sm font-medium text-espresso">
						Longitude
					</label>
					<Controller
						control={control}
						name="lng"
						render={({ field }) => (
							<Input
								id="property-longitude"
								value={field.value ?? ''}
								onChange={(event) => {
									const nextLng = numberOrNull(event.target.value);
									field.onChange(nextLng);
									setShowMapPreview(hasSetCoordinates(watch('lat'), nextLng));
								}}
								placeholder="Enter longitude"
							/>
						)}
					/>
					{errors.lng?.message ? <p className="text-xs text-red-700">{errors.lng.message}</p> : null}
				</div>
			</div>
			{mapEmbedSrc ? (
				<div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-black/10">
					<iframe
						title="Property location"
						src={mapEmbedSrc}
						className="absolute inset-0 h-full w-full border-0"
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						allowFullScreen
					/>
				</div>
			) : null}
			<div className="mt-2 flex justify-end border-t border-black/5 pt-5">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</PropertyFormSection>
	);
}
