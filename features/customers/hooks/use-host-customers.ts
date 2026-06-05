import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { HostCustomerRow, UpdateHostCustomerInput } from '../interfaces/host-customer.interface';
import {
	getHostCustomer,
	listHostCustomers,
	listHostCustomersPaginated,
	updateHostCustomer,
} from '../services/customers.services';

export const hostCustomersQueryKey = {
	all: ['host-customers'] as const,
	page: (page: number, pageSize: number, q?: string) => ['host-customers', page, pageSize, q ?? ''] as const,
	detail: (id: string) => ['host-customers', 'detail', id] as const,
};

export const useHostCustomers = (enabled: boolean) => {
	return useQuery<HostCustomerRow[]>({
		queryKey: hostCustomersQueryKey.all,
		queryFn: listHostCustomers,
		enabled,
	});
};

export const useHostCustomersPage = (page: number, pageSize: number, q?: string, enabled = true) => {
	return useQuery({
		queryKey: hostCustomersQueryKey.page(page, pageSize, q),
		queryFn: () => listHostCustomersPaginated(page, pageSize, q),
		enabled,
	});
};

export const useHostCustomer = (id: string | null) => {
	return useQuery<HostCustomerRow>({
		queryKey: id ? hostCustomersQueryKey.detail(id) : ['host-customers', 'detail'],
		queryFn: () => getHostCustomer(id!),
		enabled: Boolean(id),
	});
};

export const useUpdateHostCustomer = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateHostCustomerInput }) => updateHostCustomer(id, input),
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: hostCustomersQueryKey.all });
			void queryClient.invalidateQueries({ queryKey: ['host-customers'] });
			void queryClient.invalidateQueries({ queryKey: hostCustomersQueryKey.detail(variables.id) });
		},
	});
};
