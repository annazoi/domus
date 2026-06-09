import { getHostIdFromRequest } from '@/app/api/_utils/auth';
import { findHostProperty } from '@/app/api/_utils/property-host';
import { mapProperty } from '@/app/api/_utils/property-map';
import { propertyDetailInclude } from '@/app/api/_utils/property-include';
import { uploadFiles } from '@/app/api/utils/cloudinary/cloudinary.service';
import {
	buildImageDocumentCreateInput,
	removeDocumentWithCloudinaryAsset,
} from '@/app/api/utils/documents/documents.service';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const existing = await findHostProperty(id, hostId);
	if (!existing) return Response.json({ message: 'Property not found' }, { status: 404 });

	const contentType = request.headers.get('content-type') ?? '';
	if (!contentType.includes('multipart/form-data')) {
		return Response.json({ message: 'Expected multipart form data.' }, { status: 400 });
	}

	const formData = await request.formData();
	const file = formData.get('file');
	const altRaw = formData.get('alt');
	const logoAlt = typeof altRaw === 'string' ? altRaw.trim() || null : null;
	if (!(file instanceof File) || !file.type.startsWith('image/')) {
		return Response.json({ message: 'A valid image file is required.' }, { status: 400 });
	}

	const property = await prisma.property.findFirst({
		where: { id, user_id: hostId },
		select: { logo_id: true },
	});

	if (property?.logo_id) {
		await removeDocumentWithCloudinaryAsset(property.logo_id, hostId);
	}

	const [uploaded] = await uploadFiles([file]);
	const document = await prisma.document.create({
		data: buildImageDocumentCreateInput(hostId, uploaded, 0),
	});

	const updated = await prisma.property.update({
		where: { id },
		data: { logo_id: document.id, logo_alt: logoAlt },
		include: propertyDetailInclude,
	});

	return Response.json(mapProperty(updated));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const hostId = getHostIdFromRequest(request);
	if (!hostId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const existing = await findHostProperty(id, hostId);
	if (!existing) return Response.json({ message: 'Property not found' }, { status: 404 });

	const property = await prisma.property.findFirst({
		where: { id, user_id: hostId },
		select: { logo_id: true },
	});

	if (property?.logo_id) {
		await removeDocumentWithCloudinaryAsset(property.logo_id, hostId);
		await prisma.property.update({
			where: { id },
			data: { logo_id: null, logo_alt: null },
		});
	}

	const updated = await prisma.property.findFirstOrThrow({
		where: { id },
		include: propertyDetailInclude,
	});

	return Response.json(mapProperty(updated));
}
