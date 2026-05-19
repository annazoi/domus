export interface CloudinaryUploadResponse {
	secure_url?: string;
	public_id?: string;
	bytes?: number;
	format?: string;
	resource_type?: string;
	original_filename?: string;
	error?: { message?: string };
}