import { getAccountLoginLink } from '@/lib/integrations/stripe';
import { handleConnectRouteError, requireUserId } from '@/app/api/stripe/_utils/connect-route';

export async function GET(request: Request) {
	const auth = requireUserId(request);
	if ('error' in auth) return auth.error;

	try {
		const result = await getAccountLoginLink(auth.userId);
		return Response.json(result);
	} catch (error) {
		return handleConnectRouteError(error);
	}
}
