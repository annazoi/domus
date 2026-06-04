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

export class StripeCheckoutError extends Error {
	constructor(
		message: string,
		readonly code:
			| 'BOOKING_NOT_FOUND'
			| 'BOOKING_NOT_PAYABLE'
			| 'HOST_NOT_READY'
			| 'INVALID_AMOUNT',
	) {
		super(message);
		this.name = 'StripeCheckoutError';
	}
}

export function stripeCheckoutErrorResponse(error: unknown) {
	if (!(error instanceof StripeCheckoutError)) {
		return null;
	}

	const status =
		error.code === 'BOOKING_NOT_FOUND' ? 404 : error.code === 'HOST_NOT_READY' ? 422 : 400;

	return { status, body: { message: error.message, code: error.code } };
}
