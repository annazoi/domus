export const RoomTypes = {
	ENTIRE_PLACE: 'entire_place',
	PRIVATE_ROOM: 'private_room',
	SHARED_ROOM: 'shared_room',
} as const;

export type RoomType = (typeof RoomTypes)[keyof typeof RoomTypes];

export interface RoomTypeOption {
	label: string;
	value: RoomType;
	description: string;
}

export const RoomTypeOptions: RoomTypeOption[] = [
	{
		label: 'Entire place',
		value: RoomTypes.ENTIRE_PLACE,
		description: 'Have the whole place to yourself.',
	},
	{
		label: 'Private room',
		value: RoomTypes.PRIVATE_ROOM,
		description: 'Have your own room and share some spaces.',
	},
	{
		label: 'Shared room',
		value: RoomTypes.SHARED_ROOM,
		description: 'Stay in a shared space, like a dorm or common area.',
	},
];

export const RoomTypeOptionsLabels: Record<RoomType, string> = {
	[RoomTypes.ENTIRE_PLACE]: 'Entire place',
	[RoomTypes.PRIVATE_ROOM]: 'Private room',
	[RoomTypes.SHARED_ROOM]: 'Shared room',
} as const;
