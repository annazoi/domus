import { prisma } from '@/lib/prisma';

interface LoginPayload {
	email?: string;
	password?: string;
}

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as LoginPayload;
		const email = body.email?.trim().toLowerCase();
		const password = body.password;

		if (!email || !password) {
			return Response.json({ message: 'email and password are required.' }, { status: 400 });
		}

		if (!isValidEmail(email)) {
			return Response.json({ message: 'Invalid email format.' }, { status: 400 });
		}

		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				first_name: true,
				last_name: true,
				password: true,
			},
		});

		if (!user || user.password !== password) {
			return Response.json({ message: 'Invalid credentials. Please try again.' }, { status: 401 });
		}

		return Response.json(
			{
				id: user.id,
				user_uuid: user.id,
				uuid: user.id,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
				access_token: null,
				expires_in: null,
				account_uuid: null,
				avatar: null,
				account: null,
			},
			{ status: 200 },
		);
	} catch {
		return Response.json({ message: 'Could not sign in. Please try again.' }, { status: 500 });
	}
}
