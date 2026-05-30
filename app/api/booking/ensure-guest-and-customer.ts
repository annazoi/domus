import type { Prisma } from '@prisma/client';
import { isGuestAccount } from '@/app/api/_utils/guest-account';

export type EnsureGuestAndCustomerInput = {
	email: string;
	first_name: string;
	last_name: string;
	phone: string | null;
	hostUserId: string;
};

export async function ensureGuestUserAndCustomerForHost(
	tx: Prisma.TransactionClient,
	input: EnsureGuestAndCustomerInput,
) {
	const { email, first_name, last_name, phone, hostUserId } = input;

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
