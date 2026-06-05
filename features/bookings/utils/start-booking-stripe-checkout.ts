import { createStripeCheckout } from '@/features/stripe/services/stripe.services';
import type { SelectedService } from '@/features/services/interfaces/service.interface';

export type BookingStripeCheckoutGuest = {
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
};

export type BookingStripeCheckoutInput = {
	property_id: string;
	check_in: string;
	check_out: string;
	guests: number;
	guest: BookingStripeCheckoutGuest;
	services?: SelectedService[];
};

export async function startBookingStripeCheckout(input: BookingStripeCheckoutInput) {
	const result = await createStripeCheckout({
		property_id: input.property_id,
		check_in: input.check_in,
		check_out: input.check_out,
		guests: input.guests,
		guest: {
			first_name: input.guest.first_name,
			last_name: input.guest.last_name,
			email: input.guest.email,
			phone: input.guest.phone,
		},
		...(input.services && input.services.length > 0 ? { services: input.services } : {}),
	});
	window.location.assign(result.checkout_url);
}
