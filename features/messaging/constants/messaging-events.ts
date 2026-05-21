export const MessagingEvent = {
	JOIN: 'conversation:join',
	LEAVE: 'conversation:leave',
	SEND: 'message:send',
	NEW: 'message:new',
	ERROR: 'message:error',
} as const;

export type MessagingEvent = (typeof MessagingEvent)[keyof typeof MessagingEvent];
