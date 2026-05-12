import type { Prisma } from '@prisma/client';

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
		select: { id: true },
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
			select: { id: true },
		});
	}

	let customer = await tx.customer.findFirst({
		where: { customer_id: user.id, host_id: hostUserId },
	});
	if (!customer) {
		customer = await tx.customer.create({
			data: {
				host_id: hostUserId,
				customer_id: user.id,
				first_name,
				last_name,
				email,
				phone,
			},
		});
	}

	return { guestUserId: user.id, customerId: customer.id };
}
