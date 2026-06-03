export class StripeConnectError extends Error {
	constructor(
		message: string,
		readonly code:
			| 'STRIPE_NOT_CONFIGURED'
			| 'STRIPE_CONNECT_NOT_ENABLED'
			| 'NOT_A_HOST'
			| 'USER_NOT_FOUND'
			| 'STRIPE_API_ERROR',
		readonly stripeCode?: string,
	) {
		super(message);
		this.name = 'StripeConnectError';
	}
}

export function stripeConnectErrorResponse(error: unknown) {
	if (!(error instanceof StripeConnectError)) {
		return null;
	}

	const body = {
		message: error.message,
		...(error.stripeCode ? { stripeCode: error.stripeCode } : {}),
	};

	switch (error.code) {
		case 'USER_NOT_FOUND':
			return { status: 404, body };
		case 'NOT_A_HOST':
			return { status: 403, body };
		case 'STRIPE_NOT_CONFIGURED':
			return { status: 503, body };
		case 'STRIPE_CONNECT_NOT_ENABLED':
			return { status: 503, body };
		case 'STRIPE_API_ERROR':
			return { status: 502, body };
		default:
			return { status: 500, body };
	}
}
