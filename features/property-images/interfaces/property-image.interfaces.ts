import type { PropertyDocument } from '@/features/documents/interfaces/document.interface';

export interface PropertyImage {
	id: string;
	user_id: string;
	property_id: string;
	document_id: string | null;
	description: string | null;
	created_at: string;
	document: PropertyDocument | null;
	is_cover: boolean;
	order: number;
}
