import { getUserIdFromRequest } from '@/app/api/_utils/auth';
import { customersService } from '../customers.service';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const userId = getUserIdFromRequest(request);
	if (!userId) return Response.json({ message: 'Unauthorized' }, { status: 401 });

	const { id } = await params;
	const body = (await request.json()) as Parameters<typeof customersService.updateHostCustomer>[2];

	const result = await customersService.updateHostCustomer(userId, id, body);
	if (!result) return Response.json({ message: 'Customer not found' }, { status: 404 });
	if ('error' in result) {
		return Response.json({ message: 'First name, last name, and email are required.' }, { status: 400 });
	}

	return Response.json(result);
}
