import { propertyService } from '@/app/api/properties/properties.service';
import { usersService } from '@/app/api/users/users.service';

export async function GET(_request: Request, { params }: { params: Promise<{ host_name: string }> }) {
	const { host_name } = await params;
	const host = await usersService.findPublicHostBySlug(host_name);
	if (!host) return Response.json({ message: 'Host not found' }, { status: 404 });

	const properties = await propertyService.listPublishedSummariesByHostId(host.id);

	return Response.json({ ...host, properties });
}
