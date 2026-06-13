import { ApartmentOptions } from '@/config/constants/dropdowns/apartment.options';
import { RoomTypeOptions } from '@/config/constants/dropdowns/room-type.options';
import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';

export const PROPERTY_FORM_DEFAULT_VALUES: UpsertPropertyInput = {
	title: '',
	short_description: '',
	description: '',
	location_access: '',
	welcome_message: '',
	slug: '',
	check_in_time: '15:00',
	check_out_time: '11:00',
	door_code: '',
	safe_box_code: '',
	house_rules_instructions: '',
	privacy_policy: '',
	property_type: ApartmentOptions[0].value,
	room_type: RoomTypeOptions[0].value,
	max_guests: 1,
	bedrooms: 1,
	beds: 1,
	bathrooms: 1,
	country: '',
	city: '',
	address: '',
	lat: null,
	lng: null,
	isVisible: false,
	minimum_advance_reservation_hours: null,
	minimum_rental_period_nights: null,
	maximum_rental_period_nights: null,
};
