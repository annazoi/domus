import { PropertyDocument } from "@/features/documents/interfaces/document.interface";
import { Property } from "@/features/property/interfaces/property.interface";

export interface Amenity {
	id: string;
	property_id: string;
	quantity: number | null;
	value: string;
	description: string | null;
	created_at: string;
	updated_at: string;
	documents: PropertyDocument[];
	property?: Property;
}

export interface PropertyAmenityQuery {
	property_id: string;
}