import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { getAppUrl } from '@/lib/stripe/app-url';
import { createOnboardingLink } from '@/lib/stripe/connect';

export async function POST(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) {
		return Response.json({ message: 'Unauthorized' }, { status: 401 });
	}

	const appUrl = getAppUrl(request);
	const returnUrl = `${appUrl}/dashboard/payments?stripe=return`;
	const refreshUrl = `${appUrl}/dashboard/payments?stripe=refresh`;

	try {
		const result = await createOnboardingLink(userId, returnUrl, refreshUrl);
		return Response.json({
			url: result.url,
			stripe_account_id: result.stripe_account_id,
		});
	} catch (error) {
		if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
			return Response.json({ message: 'User not found.' }, { status: 404 });
		}
		if (error instanceof Error && error.message === 'NOT_A_HOST') {
			return Response.json({ message: 'Only hosts can connect Stripe accounts.' }, { status: 403 });
		}
		throw error;
	}
}
