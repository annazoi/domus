import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { getConnectStatusForUser } from '@/lib/stripe/connect';

export async function GET(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) {
		return Response.json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const status = await getConnectStatusForUser(userId);
		return Response.json(status);
	} catch (error) {
		if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
			return Response.json({ message: 'User not found.' }, { status: 404 });
		}
		throw error;
	}
}
