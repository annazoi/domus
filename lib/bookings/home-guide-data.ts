import { BookingStatus } from '@prisma/client';
import { amenityOptionByValue, type AmenityId } from '@/config/constants/dropdowns/amenities.options';
import { ApartmentOptionsLabels } from '@/config/constants/dropdowns/apartment.options';
import { RoomTypeOptionsLabels } from '@/config/constants/dropdowns/room-type.options';
import { formatPropertyTimeLabel } from '@/app/(pages)/templates/_utils/format-property-time';
import { formatUtcTimeOfDay } from '@/app/api/_utils/time-of-day';
import { resolveHostGuideSlug } from '@/lib/bookings/home-guide-path';
import { prisma } from '@/lib/prisma';

export type HomeGuideData = {
	propertyId: string;
	bookingId: string | null;
	checkIn: string | null;
	checkOut: string | null;
	guests: number | null;
	property: {
		title: string;
		slug: string;
		coverImage: string | null;
		welcomeMessage: string;
		locationAccess: string;
		doorCode: string;
		safeBoxCode: string;
		houseRules: string;
		privacyPolicy: string;
		checkInTime: string;
		checkOutTime: string;
		address: string;
		city: string;
		country: string;
		latitude: number;
		longitude: number;
		propertyType: string;
		roomType: string;
		maxGuests: number;
		bedrooms: number;
		beds: number;
		bathrooms: number;
		amenities: Array<{ id: AmenityId; label: string; description: string; quantity?: number }>;
		appliances: Array<{ id: string; title: string; description: string }>;
	};
	host: {
		name: string;
		host_name: string | null;
		first_name: string;
		last_name: string;
		email: string;
		phone: string | null;
	};
};

const propertySelect = {
	id: true,
	title: true,
	slug: true,
	welcome_message: true,
	location_access: true,
	door_code: true,
	safe_box_code: true,
	house_rules_instructions: true,
	privacy_policy: true,
	check_in_time: true,
	check_out_time: true,
	address: true,
	city: true,
	country: true,
	latitude: true,
	longitude: true,
	property_type: true,
	room_type: true,
	max_guests: true,
	bedrooms: true,
	beds: true,
	bathrooms: true,
	images: {
		where: { is_cover: true },
		take: 1,
		orderBy: { order: 'asc' },
		select: { document: { select: { url: true } } },
	},
	amenities: {
		where: { selected: true },
		orderBy: { value: 'asc' },
		select: { value: true, description: true, quantity: true },
	},
	appliances: {
		orderBy: { order: 'asc' },
		select: { id: true, title: true, description: true },
	},
	user: {
		select: {
			host_name: true,
			first_name: true,
			last_name: true,
			email: true,
			phone: true,
		},
	},
} as const;

function propertyTypeLabel(value: string) {
	return ApartmentOptionsLabels[value as keyof typeof ApartmentOptionsLabels] ?? value.replace(/_/g, ' ');
}

function roomTypeLabel(value: string) {
	return RoomTypeOptionsLabels[value as keyof typeof RoomTypeOptionsLabels] ?? value.replace(/_/g, ' ');
}

function formatStayDate(date: Date) {
	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

function mapPropertyGuide(
	property: {
		id: string;
		title: string;
		slug: string;
		welcome_message: string | null;
		location_access: string | null;
		door_code: string | null;
		safe_box_code: string | null;
		house_rules_instructions: string | null;
		privacy_policy: string | null;
		check_in_time: Date;
		check_out_time: Date;
		address: string;
		city: string;
		country: string;
		latitude: number;
		longitude: number;
		property_type: string;
		room_type: string;
		max_guests: number;
		bedrooms: number;
		beds: number;
		bathrooms: number;
		images: Array<{ document: { url: string } | null }>;
		amenities: Array<{ value: string; description: string | null; quantity: number | null }>;
		appliances: Array<{ id: string; title: string; description: string | null }>;
		user: { host_name: string | null; first_name: string; last_name: string; email: string; phone: string | null };
	},
	booking: { id: string; check_in: Date; check_out: Date; guests: number } | null,
	host: { host_name: string | null; first_name: string; last_name: string; email: string; phone: string | null },
): HomeGuideData {
	const hostName = `${host.first_name} ${host.last_name}`.trim() || 'Your host';

	return {
		propertyId: property.id,
		bookingId: booking?.id ?? null,
		checkIn: booking ? formatStayDate(booking.check_in) : null,
		checkOut: booking ? formatStayDate(booking.check_out) : null,
		guests: booking?.guests ?? null,
		property: {
			title: property.title,
			slug: property.slug,
			coverImage: property.images[0]?.document?.url ?? null,
			welcomeMessage: property.welcome_message?.trim() ?? '',
			locationAccess: property.location_access?.trim() ?? '',
			doorCode: property.door_code?.trim() ?? '',
			safeBoxCode: property.safe_box_code?.trim() ?? '',
			houseRules: property.house_rules_instructions?.trim() ?? '',
			privacyPolicy: property.privacy_policy?.trim() ?? '',
			checkInTime: formatPropertyTimeLabel(formatUtcTimeOfDay(property.check_in_time)),
			checkOutTime: formatPropertyTimeLabel(formatUtcTimeOfDay(property.check_out_time)),
			address: property.address,
			city: property.city,
			country: property.country,
			latitude: property.latitude,
			longitude: property.longitude,
			propertyType: propertyTypeLabel(property.property_type),
			roomType: roomTypeLabel(property.room_type),
			maxGuests: property.max_guests,
			bedrooms: property.bedrooms,
			beds: property.beds,
			bathrooms: property.bathrooms,
			amenities: property.amenities.map((amenity) => {
				const amenityId = amenity.value as AmenityId;
				const option = amenityOptionByValue[amenityId];
				return {
					id: amenityId,
					label: option?.label ?? amenity.value.replace(/_/g, ' '),
					description: amenity.description?.trim() ?? '',
					quantity:
						typeof amenity.quantity === 'number' && amenity.quantity > 0 ? amenity.quantity : undefined,
				};
			}),
			appliances: property.appliances.map((appliance) => ({
				id: appliance.id,
				title: appliance.title,
				description: appliance.description?.trim() ?? '',
			})),
		},
		host: {
			name: hostName,
			host_name: host.host_name,
			first_name: host.first_name,
			last_name: host.last_name,
			email: host.email,
			phone: host.phone,
		},
	};
}

const hostSelect = {
	host_name: true,
	first_name: true,
	last_name: true,
	email: true,
	phone: true,
} as const;

async function loadBookingGuide(bookingId: string) {
	return prisma.booking.findFirst({
		where: {
			id: bookingId,
			status: { not: BookingStatus.CANCELLED },
		},
		select: {
			id: true,
			check_in: true,
			check_out: true,
			guests: true,
			property: { select: propertySelect },
			host: { select: hostSelect },
		},
	});
}

export async function getHomeGuideData(
	hostNameSlug: string,
	options?: { bookingId?: string },
): Promise<HomeGuideData | null> {
	if (!options?.bookingId) return null;

	const booking = await loadBookingGuide(options.bookingId);
	if (!booking) return null;

	const expectedSlug = resolveHostGuideSlug(booking.host).toLowerCase();
	if (expectedSlug !== hostNameSlug.trim().toLowerCase()) return null;

	return mapPropertyGuide(booking.property, booking, booking.host);
}

export async function getHomeGuideDataByBookingId(bookingId: string): Promise<HomeGuideData | null> {
	const booking = await loadBookingGuide(bookingId);
	if (!booking) return null;

	return mapPropertyGuide(booking.property, booking, booking.host);
}
