import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { prisma } from '@/lib/prisma';
import { dedupeSearchUsers } from './dedupe-search-users';

export async function GET(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const query =
		new URL(request.url).searchParams.get('q')?.trim() ??
		new URL(request.url).searchParams.get('email')?.trim();
	if (!query || query.length < 3) {
		return Response.json({ message: 'Enter at least 3 characters.' }, { status: 400 });
	}

	const users = await prisma.user.findMany({
		where: {
			id: { not: userId },
			OR: [
				{ email: { contains: query, mode: 'insensitive' } },
				{ first_name: { contains: query, mode: 'insensitive' } },
				{ last_name: { contains: query, mode: 'insensitive' } },
			],
		},
		orderBy: { email: 'asc' },
		take: 10,
		select: {
			id: true,
			email: true,
			first_name: true,
			last_name: true,
			properties: {
				orderBy: { title: 'asc' },
				select: { id: true, title: true },
			},
		},
	});

	const mapped = users.map((user) => ({
		id: user.id,
		email: user.email,
		first_name: user.first_name,
		last_name: user.last_name,
		properties: user.properties,
	}));

	return Response.json(dedupeSearchUsers(mapped, query));
}
