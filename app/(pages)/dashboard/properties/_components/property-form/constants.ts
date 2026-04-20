import { ApartmentOptions } from '@/config/constants/dropdowns/apartment.options';
import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';

export const PROPERTY_FORM_DEFAULT_VALUES: UpsertPropertyInput = {
	title: '',
	short_description: '',
	description: '',
	slug: '',
	check_in_time: '15:00',
	check_out_time: '11:00',
	property_type: ApartmentOptions[0].value,
	room_type: 'Entire place',
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
};
