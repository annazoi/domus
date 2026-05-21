export type ConversationRow = {
	id: string;
	property_id: string;
	property_title: string;
	other_user_id: string;
	other_user_name: string;
	preview: string | null;
	updated_at: string;
};

export type MessageRow = {
	id: string;
	conversation_id: string;
	sender_id: string;
	body: string;
	created_at: string;
	is_mine: boolean;
};

export type CreateConversationInput = {
	property_id: string;
	guest_user_id?: string;
	host_user_id?: string;
};

export type SendMessagePayload = {
	conversation_id: string;
	body: string;
};

export type UserSearchProperty = {
	id: string;
	title: string;
};

export type UserSearchResult = {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	properties: UserSearchProperty[];
};
