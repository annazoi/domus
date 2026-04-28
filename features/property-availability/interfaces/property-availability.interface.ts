export interface AvailabilityDay {
	id: string;
	property_id: string;
	date: string;
	price: number;
	is_available: boolean;
	reason: AvailabilityStatus | null;
}

export const AvailabilityStatus = {
	BLOCKED: 'BLOCKED',
	MAINTENANCE: 'MAINTENANCE',
	BOOKED: 'BOOKED',
} as const;

export type AvailabilityStatus = (typeof AvailabilityStatus)[keyof typeof AvailabilityStatus];
