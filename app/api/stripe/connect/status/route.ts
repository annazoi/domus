import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { getConnectStatusForUser } from '@/lib/stripe/connect';
import { stripeConnectErrorResponse } from '@/lib/stripe/connect-errors';

export async function GET(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) {
		return Response.json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const status = await getConnectStatusForUser(userId);
		return Response.json(status);
	} catch (error) {
		const err = stripeConnectErrorResponse(error);
		if (err) {
			return Response.json(err.body, { status: err.status });
		}
		throw error;
	}
}
