/**
 * Single source of truth for amenity ids and labels (dropdowns + API seed + static fallback).
 * IDs are lowercase strings — use `Amenities.*` everywhere instead of raw strings.
 */

/** Canonical keys stored on properties and returned by GET /api/amenities */
export const Amenities = {
	WIFI: 'wifi',
	POOL: 'pool',
	PARKING: 'parking',
	AC: 'ac',
	KITCHEN: 'kitchen',
	WORKSPACE: 'workspace',
} as const;

export type AmenityId = (typeof Amenities)[keyof typeof Amenities];

/** For `<select>`, comboboxes, and multi-select UIs */
export const AmenitiesOptions = [
	{ label: 'Wi-Fi', value: Amenities.WIFI },
	{ label: 'Pool', value: Amenities.POOL },
	{ label: 'Free parking', value: Amenities.PARKING },
	{ label: 'Air conditioning', value: Amenities.AC },
	{ label: 'Kitchen', value: Amenities.KITCHEN },
	{ label: 'Dedicated workspace', value: Amenities.WORKSPACE },
] as const satisfies ReadonlyArray<{ label: string; value: AmenityId }>;

/** Quick lookup: id → display label */
export const AmenitiesOptionsLabels: Record<AmenityId, string> = {
	[Amenities.WIFI]: 'Wi-Fi',
	[Amenities.POOL]: 'Pool',
	[Amenities.PARKING]: 'Free parking',
	[Amenities.AC]: 'Air conditioning',
	[Amenities.KITCHEN]: 'Kitchen',
	[Amenities.WORKSPACE]: 'Dedicated workspace',
};

/** Same data as API `GET /amenities` — use for SSR, tests, or when the network request fails */
export function getStaticAmenities(): Array<{ id: string; label: string }> {
	return AmenitiesOptions.map((option) => ({
		id: option.value,
		label: option.label,
	}));
}
