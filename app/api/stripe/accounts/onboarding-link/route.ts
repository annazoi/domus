import { generateOnboardingLink } from '@/lib/integrations/stripe';
import { handleConnectRouteError, requireUserId } from '@/app/api/stripe/_utils/connect-route';

export async function GET(request: Request) {
	const auth = requireUserId(request);
	if ('error' in auth) return auth.error;

	try {
		const result = await generateOnboardingLink(auth.userId, request);
		return Response.json({
			onboarding_link: result.url,
			url: result.url,
			stripe_account_id: result.stripe_account_id,
		});
	} catch (error) {
		return handleConnectRouteError(error);
	}
}
