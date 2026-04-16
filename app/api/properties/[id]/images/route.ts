import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { propertyStore } from '@/store/property';

interface ImagePayload {
	urls?: string[];
	reorderIds?: string[];
	coverImageId?: string;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const body = (await request.json()) as ImagePayload;

	if (body.reorderIds?.length) {
		const reordered = propertyStore.reorderImages(hostId, id, body.reorderIds, body.coverImageId);
		if (!reordered) return Response.json({ message: 'Property not found' }, { status: 404 });
		return Response.json(reordered);
	}

	if (!body.urls?.length) {
		return Response.json({ message: 'At least one image url is required' }, { status: 400 });
	}
	const created = propertyStore.addImages(hostId, id, body.urls);
	if (!created) return Response.json({ message: 'Property not found' }, { status: 404 });
	return Response.json(created, { status: 201 });
}
