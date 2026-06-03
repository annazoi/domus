export class StripeConnectError extends Error {
	constructor(
		message: string,
		readonly code: 'STRIPE_NOT_CONFIGURED' | 'NOT_A_HOST' | 'USER_NOT_FOUND' | 'STRIPE_API_ERROR',
	) {
		super(message);
		this.name = 'StripeConnectError';
	}
}

export function stripeConnectErrorResponse(error: unknown) {
	if (!(error instanceof StripeConnectError)) {
		return null;
	}

	switch (error.code) {
		case 'USER_NOT_FOUND':
			return { status: 404, body: { message: error.message } };
		case 'NOT_A_HOST':
			return { status: 403, body: { message: error.message } };
		case 'STRIPE_NOT_CONFIGURED':
			return { status: 503, body: { message: error.message } };
		case 'STRIPE_API_ERROR':
			return { status: 502, body: { message: error.message } };
		default:
			return { status: 500, body: { message: error.message } };
	}
}
