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
				<div className="space-y-1.5">
					<label htmlFor="property-country" className="text-sm font-medium text-[#1A1A1A]">
						Country
					</label>
					<input
						id="property-country"
						value={form.country}
						onChange={(event) => onFieldChange('country', event.target.value)}
						placeholder="Enter country"
						className="w-full rounded-xl border border-black/10 px-4 py-3"
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-city" className="text-sm font-medium text-[#1A1A1A]">
						City
					</label>
					<input
						id="property-city"
						value={form.city}
						onChange={(event) => onFieldChange('city', event.target.value)}
						placeholder="Enter city"
						className="w-full rounded-xl border border-black/10 px-4 py-3"
					/>
				</div>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="property-address" className="text-sm font-medium text-[#1A1A1A]">
					Address
				</label>
				<PlacesAutocompleteInput
					id="property-address"
					placesLibraryReady={placesLibraryReady}
					value={form.address}
					onChange={(event) => onFieldChange('address', event.target.value)}
					onPlaceSelect={(place) => applyPlaceToForm(place, onFieldChange, onCoordinateChange)}
					placeholder="Search or enter address"
					autoComplete="off"
					className="w-full rounded-xl border border-black/10 px-4 py-3"
				/>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-latitude" className="text-sm font-medium text-[#1A1A1A]">
						Latitude
					</label>
					<input
						id="property-latitude"
						value={form.lat ?? ''}
						onChange={(event) => onCoordinateChange('lat', event.target.value)}
						placeholder="Enter latitude"
						className="w-full rounded-xl border border-black/10 px-4 py-3"
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-longitude" className="text-sm font-medium text-[#1A1A1A]">
						Longitude
					</label>
					<input
						id="property-longitude"
						value={form.lng ?? ''}
						onChange={(event) => onCoordinateChange('lng', event.target.value)}
						placeholder="Enter longitude"
						className="w-full rounded-xl border border-black/10 px-4 py-3"
					/>
				</div>
			</div>
		</PropertyFormSection>
	);
}
