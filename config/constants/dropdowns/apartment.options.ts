export const ApartmentTypes = {
	APARTMENT: 'apartment',
	STUDIO: 'studio',
	LOFT: 'loft',
	VILLA: 'villa',
	DOME: 'dome',
	OTHER: 'other',
} as const;

export const ApartmentOptions = [
	{ label: 'Apartment', value: ApartmentTypes.APARTMENT },
	{ label: 'Studio', value: ApartmentTypes.STUDIO },
	{ label: 'Loft', value: ApartmentTypes.LOFT },
	{ label: 'Villa', value: ApartmentTypes.VILLA },
	{ label: 'Dome', value: ApartmentTypes.DOME },
	{ label: 'Other', value: ApartmentTypes.OTHER },
] as const;

export const ApartmentOptionsLabels: Record<typeof ApartmentTypes[keyof typeof ApartmentTypes], string> = {
	[ApartmentTypes.APARTMENT]: 'Apartment',
	[ApartmentTypes.STUDIO]: 'Studio',
	[ApartmentTypes.LOFT]: 'Loft',
	[ApartmentTypes.VILLA]: 'Villa',
	[ApartmentTypes.DOME]: 'Dome',
	[ApartmentTypes.OTHER]: 'Other',
} as const;