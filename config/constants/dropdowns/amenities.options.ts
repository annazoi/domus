export const Amenities = {
	WIFI: 'wifi',
	POOL: 'pool',
	PARKING: 'parking',
	AC: 'ac',
	KITCHEN: 'kitchen',
	WORKSPACE: 'workspace',
} as const;

export type AmenityId = (typeof Amenities)[keyof typeof Amenities];

export const AmenitiesOptions = [
	{ label: 'Wi-Fi', value: Amenities.WIFI },
	{ label: 'Pool', value: Amenities.POOL },
	{ label: 'Free parking', value: Amenities.PARKING },
	{ label: 'Air conditioning', value: Amenities.AC },
	{ label: 'Kitchen', value: Amenities.KITCHEN },
	{ label: 'Dedicated workspace', value: Amenities.WORKSPACE },
] as const;

export const AmenitiesOptionsLabels: Record<AmenityId, string> = {
	[Amenities.WIFI]: 'Wi-Fi',
	[Amenities.POOL]: 'Pool',
	[Amenities.PARKING]: 'Free parking',
	[Amenities.AC]: 'Air conditioning',
	[Amenities.KITCHEN]: 'Kitchen',
	[Amenities.WORKSPACE]: 'Dedicated workspace',
};

export function searchAmenitiesOptions(search: string) {
	const normalizedSearch = search.trim().toLowerCase();
	if (!normalizedSearch) return AmenitiesOptions;

	return AmenitiesOptions.filter((option) => option.label.toLowerCase().includes(normalizedSearch));
}

export function getStaticAmenities(): Array<{ id: string; label: string }> {
	return AmenitiesOptions.map((option) => ({
		id: option.value,
		label: option.label,
	}));
}
