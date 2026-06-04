import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { stripeConnectErrorResponse } from '@/lib/integrations/stripe/errors';

export function requireUserId(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) {
		return { error: Response.json({ message: 'Unauthorized' }, { status: 401 }) };
	}
	return { userId };
}

export function handleConnectRouteError(error: unknown) {
	const err = stripeConnectErrorResponse(error);
	if (err) {
		return Response.json(err.body, { status: err.status });
	}
	throw error;
}
