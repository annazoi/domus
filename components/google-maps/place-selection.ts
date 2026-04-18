export type PlaceSelection = {
	formattedAddress: string;
	country: string;
	city: string;
	lat: number | null;
	lng: number | null;
};

export function parseAddressFromComponents(
	components: google.maps.GeocoderAddressComponent[],
): { country: string; city: string } {
	let country = '';
	let city = '';
	for (const component of components) {
		if (component.types.includes('country')) {
			country = component.long_name;
		}
		if (component.types.includes('locality')) {
			city = component.long_name;
		} else if (!city && component.types.includes('postal_town')) {
			city = component.long_name;
		} else if (!city && component.types.includes('administrative_area_level_1')) {
			city = component.long_name;
		}
	}
	return { country, city };
}

export function placeResultToSelection(place: google.maps.places.PlaceResult): PlaceSelection | null {
	if (!place.address_components?.length) return null;

	const { country, city } = parseAddressFromComponents(place.address_components);
	const loc = place.geometry?.location;

	return {
		formattedAddress: place.formatted_address ?? '',
		country,
		city,
		lat: loc ? loc.lat() : null,
		lng: loc ? loc.lng() : null,
	};
}
