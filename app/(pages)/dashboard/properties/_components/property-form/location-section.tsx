'use client';

import { PlacesAutocompleteInput, type PlaceSelection } from '@/components/google-maps';
import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type LocationSectionProps = {
	form: UpsertPropertyInput;
	placesLibraryReady?: boolean;
	onFieldChange: (field: 'country' | 'city' | 'address', value: string) => void;
	onCoordinateChange: (field: 'lat' | 'lng', value: string) => void;
};

function applyPlaceToForm(place: PlaceSelection, onFieldChange: LocationSectionProps['onFieldChange'], onCoordinateChange: LocationSectionProps['onCoordinateChange']) {
	onFieldChange('country', place.country);
	onFieldChange('city', place.city);
	onFieldChange('address', place.formattedAddress);
	if (place.lat != null) {
		onCoordinateChange('lat', String(place.lat));
	}
	if (place.lng != null) {
		onCoordinateChange('lng', String(place.lng));
	}
}

export function LocationSection({
	form,
	placesLibraryReady = false,
	onFieldChange,
	onCoordinateChange,
}: LocationSectionProps) {
	return (
		<PropertyFormSection id="location" title="Location">
			<div className="grid gap-4 md:grid-cols-2">
				<input
					value={form.country}
					onChange={(event) => onFieldChange('country', event.target.value)}
					placeholder="Country"
					className="rounded-xl border border-black/10 px-4 py-3"
				/>
				<input
					value={form.city}
					onChange={(event) => onFieldChange('city', event.target.value)}
					placeholder="City"
					className="rounded-xl border border-black/10 px-4 py-3"
				/>
			</div>
			<PlacesAutocompleteInput
				placesLibraryReady={placesLibraryReady}
				value={form.address}
				onChange={(event) => onFieldChange('address', event.target.value)}
				onPlaceSelect={(place) => applyPlaceToForm(place, onFieldChange, onCoordinateChange)}
				placeholder="Address"
				autoComplete="off"
				className="w-full rounded-xl border border-black/10 px-4 py-3"
			/>
			<div className="grid gap-4 md:grid-cols-2">
				<input
					value={form.lat ?? ''}
					onChange={(event) => onCoordinateChange('lat', event.target.value)}
					placeholder="Latitude"
					className="rounded-xl border border-black/10 px-4 py-3"
				/>
				<input
					value={form.lng ?? ''}
					onChange={(event) => onCoordinateChange('lng', event.target.value)}
					placeholder="Longitude"
					className="rounded-xl border border-black/10 px-4 py-3"
				/>
			</div>
		</PropertyFormSection>
	);
}
