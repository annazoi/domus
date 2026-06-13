import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { usersService } from '../users.service';

export async function GET(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const user = await usersService.getById(userId);
	if (!user) return Response.json({ message: 'User not found' }, { status: 404 });

	return Response.json(user);
}
