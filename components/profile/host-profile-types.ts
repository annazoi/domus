export interface HostProfileProperty {
	id: string;
	title: string;
	slug: string;
	city: string;
	short_description: string;
	cover_url: string | null;
}

export interface HostProfileData {
	first_name: string;
	last_name: string;
	host_name?: string;
	email?: string;
	phone?: string | null;
	vat_number?: string | null;
	bio?: string | null;
	avatar_url?: string | null;
	banner_url?: string | null;
	created_at: string;
}
