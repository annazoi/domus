'use client';

import { PlacesAutocompleteInput, type PlaceSelection } from '@/components/google-maps';
import { Input } from '@/components/ui';
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
				/>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-country" className="text-sm font-medium text-[#1A1A1A]">
						Country
					</label>
					<Input
						id="property-country"
						value={form.country}
						onChange={(event) => onFieldChange('country', event.target.value)}
						placeholder="Enter country"
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-city" className="text-sm font-medium text-[#1A1A1A]">
						City
					</label>
					<Input
						id="property-city"
						value={form.city}
						onChange={(event) => onFieldChange('city', event.target.value)}
						placeholder="Enter city"
					/>
				</div>
			</div>
		
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-latitude" className="text-sm font-medium text-[#1A1A1A]">
						Latitude
					</label>
					<Input
						id="property-latitude"
						value={form.lat ?? ''}
						onChange={(event) => onCoordinateChange('lat', event.target.value)}
						placeholder="Enter latitude"
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-longitude" className="text-sm font-medium text-[#1A1A1A]">
						Longitude
					</label>
					<Input
						id="property-longitude"
						value={form.lng ?? ''}
						onChange={(event) => onCoordinateChange('lng', event.target.value)}
						placeholder="Enter longitude"
					/>
				</div>
			</div>
		</PropertyFormSection>
	);
}
