export interface PropertyDocument {
	id: string;
	user_id: string;
	filename: string;
	mimetype: string;
	size: number;
	url: string;
	path: string;
	type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
	order: number;
	created_at: string;
	updated_at: string;
	property_amenity_id: string | null;
}
