import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { HostCustomerRow, UpdateHostCustomerInput } from '../interfaces/host-customer.interface';
import { listHostCustomers, updateHostCustomer } from '../services/customers.services';

export const hostCustomersQueryKey = {
	all: ['host-customers'] as const,
};

export const useHostCustomers = (enabled: boolean) => {
	return useQuery<HostCustomerRow[]>({
		queryKey: hostCustomersQueryKey.all,
		queryFn: listHostCustomers,
		enabled,
	});
};

export const useUpdateHostCustomer = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateHostCustomerInput }) => updateHostCustomer(id, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: hostCustomersQueryKey.all });
		},
	});
};
