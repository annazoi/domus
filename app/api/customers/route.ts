import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { customersService } from './customers.service';

export async function GET(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const url = new URL(request.url);
	if (url.searchParams.get('host_id') !== 'me') {
		return Response.json({ message: 'Forbidden' }, { status: 403 });
	}

	const rows = await customersService.listHostCustomersWithStats(userId);
	return Response.json(rows);
}
