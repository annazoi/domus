import { prisma } from '@/lib/prisma';

interface RegisterPayload {
	full_name?: string;
	email?: string;
	password?: string;
}

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as RegisterPayload;
		const fullName = body.full_name?.trim();
		const email = body.email?.trim().toLowerCase();
		const password = body.password;

		if (!fullName || !email || !password) {
			return Response.json({ message: 'full_name, email and password are required.' }, { status: 400 });
		}

		if (!isValidEmail(email)) {
			return Response.json({ message: 'Invalid email format.' }, { status: 400 });
		}

		if (password.length < 8) {
			return Response.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
		}

		const existingUser = await prisma.user.findUnique({
			where: { email },
			select: { id: true },
		});

		if (existingUser) {
			return Response.json({ message: 'User already exists with this email.' }, { status: 409 });
		}

		const user = await prisma.user.create({
			data: {
				fullName,
				email,
				password,
			},
			select: {
				id: true,
				email: true,
				fullName: true,
				createdAt: true,
			},
		});

		return Response.json(
			{
				user_uuid: user.id,
				uuid: user.id,
				email: user.email,
				full_name: user.fullName,
				role: 'USER',
				access_token: null,
				expires_in: null,
				account_uuid: null,
				avatar: null,
				account: null,
				created_at: user.createdAt,
			},
			{ status: 201 },
		);
	} catch {
		return Response.json({ message: 'Could not create account. Please try again.' }, { status: 500 });
	}
}
