import { constructStripeEvent, dispatchStripeWebhookEvent } from '@/lib/integrations/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
	const signature = request.headers.get('stripe-signature');
	if (!signature) {
		return Response.json({ message: 'Missing stripe-signature header.' }, { status: 400 });
	}

	const payload = await request.text();

	let event;
	try {
		event = constructStripeEvent(payload, signature);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Invalid webhook signature.';
		return Response.json({ message }, { status: 400 });
	}

	try {
		await dispatchStripeWebhookEvent(event);
	} catch (error) {
		console.error('Stripe webhook handler failed:', error);
		return Response.json({ message: 'Webhook handler failed.' }, { status: 500 });
	}

	return Response.json({ received: true });
}
