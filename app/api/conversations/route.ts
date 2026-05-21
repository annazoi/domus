import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { messagingService } from './messaging.service';
import type { CreateConversationInput } from '@/features/messaging/interfaces/messaging.interface';

export async function GET(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const conversations = await messagingService.listConversations(userId);
	return Response.json(conversations);
}

export async function POST(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const body = (await request.json()) as CreateConversationInput;
	if (!body.property_id) {
		return Response.json({ message: 'property_id is required.' }, { status: 400 });
	}

	const result = await messagingService.createConversation(userId, body);
	if ('error' in result) {
		if (result.error === 'property_not_found') {
			return Response.json({ message: 'Property not found.' }, { status: 404 });
		}
		if (result.error === 'forbidden') {
			return Response.json({ message: 'Forbidden' }, { status: 403 });
		}
		return Response.json({ message: 'Invalid request.' }, { status: 400 });
	}

	return Response.json(result, { status: 201 });
}
