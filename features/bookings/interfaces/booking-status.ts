export const BookingStatus = {
	PENDING: 'pending',
	CONFIRMED: 'confirmed',
	CANCELLED: 'cancelled',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
