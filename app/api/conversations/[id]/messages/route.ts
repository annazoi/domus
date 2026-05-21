import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { messagingService } from '../../messaging.service';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const messages = await messagingService.listMessages(id, userId);
	if (!messages) return Response.json({ message: 'Conversation not found.' }, { status: 404 });

	return Response.json(messages);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const body = (await request.json()) as { body?: string };
	const result = await messagingService.sendMessage(id, userId, body.body ?? '');
	if ('error' in result) {
		if (result.error === 'not_found') {
			return Response.json({ message: 'Conversation not found.' }, { status: 404 });
		}
		return Response.json({ message: 'Message body is required.' }, { status: 400 });
	}

	return Response.json(result, { status: 201 });
}
