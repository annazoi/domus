import type { Prisma } from '@prisma/client';
import { isGuestAccount } from '@/app/api/_utils/guest-account';
import { prisma } from '@/lib/prisma';

export type EnsureGuestAndCustomerInput = {
	email: string;
	first_name: string;
	last_name: string;
	phone: string | null;
	hostUserId: string;
	authenticatedUserId?: string | null;
};

export async function ensureGuestUserAndCustomerForHost(
	tx: Prisma.TransactionClient,
	input: EnsureGuestAndCustomerInput,
) {
	const { email, first_name, last_name, phone, hostUserId, authenticatedUserId } = input;

	if (authenticatedUserId) {
		const authUser = await tx.user.findUnique({
			where: { id: authenticatedUserId },
			select: { id: true, email: true },
		});
		if (authUser) {
			const customerEmail = authUser.email.trim().toLowerCase();
			let customer = await tx.customer.findFirst({
				where: { guest_user_id: authUser.id, host_user_id: hostUserId },
			});
			if (!customer) {
				customer = await tx.customer.create({
					data: {
						guest_user_id: authUser.id,
						host_user_id: hostUserId,
						first_name,
						last_name,
						email: customerEmail,
						phone,
					},
				});
			} else {
				customer = await tx.customer.update({
					where: { id: customer.id },
					data: { first_name, last_name, email: customerEmail, phone },
				});
			}

			return { guestUserId: authUser.id, customerId: customer.id };
		}
	}

	let user = await tx.user.findUnique({
		where: { email },
		select: { id: true, password: true },
	});
	if (!user) {
		user = await tx.user.create({
			data: {
				first_name,
				last_name,
				email,
				password: '',
				phone,
			},
			select: { id: true, password: true },
		});
	} else if (isGuestAccount(user.password)) {
		await tx.user.update({
			where: { id: user.id },
			data: { first_name, last_name, phone },
		});
	}

	let customer = await tx.customer.findFirst({
		where: { guest_user_id: user.id, host_user_id: hostUserId },
	});
	if (!customer) {
		customer = await tx.customer.create({
			data: {
				guest_user_id: user.id,
				host_user_id: hostUserId,
				first_name,
				last_name,
				email,
				phone,
			},
		});
	} else {
		customer = await tx.customer.update({
			where: { id: customer.id },
			data: { first_name, last_name, email, phone },
		});
	}

	return { guestUserId: user.id, customerId: customer.id };
}

export async function assignAuthenticatedGuestToBooking(
	bookingId: string,
	input: EnsureGuestAndCustomerInput & { authenticatedUserId: string },
) {
	const { authenticatedUserId, hostUserId, first_name, last_name, phone } = input;

	return prisma.$transaction(async (tx) => {
		const { guestUserId, customerId } = await ensureGuestUserAndCustomerForHost(tx, {
			email: input.email,
			first_name,
			last_name,
			phone,
			hostUserId,
			authenticatedUserId,
		});

		await tx.booking.update({
			where: { id: bookingId },
			data: { guest_user_id: guestUserId, customer_id: customerId },
		});
	});
}
