import { isGuestAccount } from '@/app/api/_utils/guest-account';
import { hashPassword } from '@/app/api/_utils/password';
import { prisma } from '@/lib/prisma';

interface RegisterPayload {
	first_name?: string;
	last_name?: string;
	email?: string;
	password?: string;
}

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as RegisterPayload;
		const first_name = body.first_name?.trim() ?? '';
		const last_name = body.last_name?.trim() ?? '';
		const email = body.email?.trim().toLowerCase();
		const password = body.password;

		if (!first_name || !last_name) {
			return Response.json({ message: 'first_name and last_name are required.' }, { status: 400 });
		}

		if (!email || !password) {
			return Response.json({ message: 'email and password are required.' }, { status: 400 });
		}

		if (!isValidEmail(email)) {
			return Response.json({ message: 'Invalid email format.' }, { status: 400 });
		}

		if (password.length < 8) {
			return Response.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
		}

		const hashedPassword = hashPassword(password);

		const existingUser = await prisma.user.findUnique({
			where: { email },
			select: { id: true, password: true },
		});

		let user: {
			id: string;
			email: string;
			first_name: string;
			last_name: string;
			created_at: Date;
		};

		if (existingUser) {
			if (!isGuestAccount(existingUser.password)) {
				return Response.json({ message: 'User already exists with this email.' }, { status: 409 });
			}
			user = await prisma.user.update({
				where: { id: existingUser.id },
				data: {
					first_name,
					last_name,
					password: hashedPassword,
					is_archived: false,
				},
				select: {
					id: true,
					email: true,
					first_name: true,
					last_name: true,
					created_at: true,
				},
			});
		} else {
			user = await prisma.user.create({
				data: {
					first_name,
					last_name,
					email,
					password: hashedPassword,
					is_archived: false,
				},
				select: {
					id: true,
					email: true,
					first_name: true,
					last_name: true,
					created_at: true,
				},
			});
		}

		return Response.json(
			{
				id: user.id,
				user_uuid: user.id,
				uuid: user.id,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
				created_at: user.created_at,
				access_token: null,
				expires_in: null,
				account_uuid: null,
				avatar: null,
				account: null,
			},
			{ status: 201 },
		);
	} catch {
		return Response.json({ message: 'Could not create account. Please try again.' }, { status: 500 });
	}
}
