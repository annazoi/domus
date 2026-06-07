import { z } from 'zod';

export const basicInfoFormSchema = z.object({
	title: z.string().trim().min(1, 'Title is required.'),
	slug: z
		.string()
		.trim()
		.min(1, 'Slug is required.')
		.regex(/^[a-z-]+$/, 'Slug must contain only lowercase letters (a-z) and "-" only (no spaces or other symbols).'),
	property_type: z.string(),
	room_type: z.string(),
	isVisible: z.boolean(),
});

export const descriptionFormSchema = z.object({
	description: z.string(),
	short_description: z.string().optional(),
	location_access: z.string().optional(),
	welcome_message: z.string().optional(),
});

export const houseRulesFormSchema = z.object({
	check_in_time: z.string(),
	check_out_time: z.string(),
});

export const capacityFormSchema = z.object({
	max_guests: z.number().min(1, 'Guests must be greater than 0.'),
	bedrooms: z.number().min(0),
	beds: z.number().min(0),
	bathrooms: z.number().min(0),
});

export const locationFormSchema = z.object({
	address: z.string(),
	country: z.string(),
	city: z.string(),
	lat: z.number().nullable().optional(),
	lng: z.number().nullable().optional(),
});

export const pricingFormSchema = z.object({});

export const amenitiesFormSchema = z.object({
	amenity_ids: z.array(z.string()),
});

export const imagesFormSchema = z.object({
	imageFiles: z.array(z.instanceof(File)).min(1, 'Select one or more images to upload.'),
});

export type BasicInfoFormValues = z.infer<typeof basicInfoFormSchema>;
export type DescriptionFormValues = z.infer<typeof descriptionFormSchema>;
export type HouseRulesFormValues = z.infer<typeof houseRulesFormSchema>;
export type CapacityFormValues = z.infer<typeof capacityFormSchema>;
export type LocationFormValues = z.infer<typeof locationFormSchema>;
export type PricingFormValues = z.infer<typeof pricingFormSchema>;
export type AmenitiesFormValues = z.infer<typeof amenitiesFormSchema>;
export type ImagesFormValues = z.infer<typeof imagesFormSchema>;
