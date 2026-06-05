import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { parsePaginationParams } from '@/lib/pagination';
import { customersService } from './customers.service';

export async function GET(request: Request) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const url = new URL(request.url);
	if (url.searchParams.get('host_id') !== 'me') {
		return Response.json({ message: 'Forbidden' }, { status: 403 });
	}

	const paginationParams = parsePaginationParams(url.searchParams);
	if (paginationParams) {
		const query = url.searchParams.get('q')?.trim() || undefined;
		const result = await customersService.listHostCustomersWithStatsPaginated(
			userId,
			paginationParams.page,
			paginationParams.pageSize,
			query,
		);
		return Response.json(result);
	}

	const rows = await customersService.listHostCustomersWithStats(userId);
	return Response.json(rows);
}
