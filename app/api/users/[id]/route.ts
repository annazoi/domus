import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { usersService } from '../users.service';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });
	const { id } = await params;
	if (id !== userId) return Response.json({ message: 'Forbidden' }, { status: 403 });
	const user = await usersService.getById(id);
	if (!user) return Response.json({ message: 'User not found' }, { status: 404 });
	return Response.json(user);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	if (id !== userId) return Response.json({ message: 'Forbidden' }, { status: 403 });

	const body = (await request.json()) as Parameters<typeof usersService.update>[1];
	const result = await usersService.update(id, body);

	if ('error' in result) {
		if (result.error === 'required') {
			return Response.json({ message: 'First name and last name are required.' }, { status: 400 });
		}
		if (result.error === 'email') {
			return Response.json({ message: 'A valid email is required.' }, { status: 400 });
		}
		if (result.error === 'duplicate_email') {
			return Response.json({ message: 'Another account already uses this email.' }, { status: 409 });
		}
	}

	return Response.json(result);
}
