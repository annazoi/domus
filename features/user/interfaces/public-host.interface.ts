export interface PublicHostProperty {
	id: string;
	title: string;
	slug: string;
	city: string;
	short_description: string;
	cover_url: string | null;
}

export interface PublicHostProfile {
	id: string;
	host_name: string;
	first_name: string;
	last_name: string;
	bio?: string;
	avatar_url?: string | null;
	banner_url?: string | null;
	created_at: string;
	properties: PublicHostProperty[];
}
