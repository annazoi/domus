import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { usersService } from '../../users.service';

export async function POST(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const contentType = request.headers.get('content-type') ?? '';
	if (!contentType.includes('multipart/form-data')) {
		return Response.json({ message: 'Expected multipart form data.' }, { status: 400 });
	}

	const formData = await request.formData();
	const file = formData.get('file');
	if (!(file instanceof File) || !file.type.startsWith('image/')) {
		return Response.json({ message: 'A valid image file is required.' }, { status: 400 });
	}

	const updated = await usersService.uploadProfileImage(userId, 'avatar_id', file);
	if (!updated) return Response.json({ message: 'User not found' }, { status: 404 });

	return Response.json(updated);
}

export async function DELETE(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const updated = await usersService.removeProfileImage(userId, 'avatar_id');
	if (!updated) return Response.json({ message: 'User not found' }, { status: 404 });

	return Response.json(updated);
}
