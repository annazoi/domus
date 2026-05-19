import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { HostCustomerRow, UpdateHostCustomerInput } from '../interfaces/host-customer.interface';

export const listHostCustomers = async () => {
	const response = await axiosInstance.get<HostCustomerRow[]>(ApiRoutes.customers.listMine);
	return response.data;
};

export const updateHostCustomer = async (id: string, input: UpdateHostCustomerInput) => {
	const response = await axiosInstance.patch<HostCustomerRow>(ApiRoutes.customers.customer(id), input);
	return response.data;
};
