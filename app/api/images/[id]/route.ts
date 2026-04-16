import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { propertyStore } from '@/store/property';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const deleted = propertyStore.deleteImage(hostId, id);
	if (!deleted) return Response.json({ message: 'Image not found' }, { status: 404 });
	return Response.json({ success: true });
}
