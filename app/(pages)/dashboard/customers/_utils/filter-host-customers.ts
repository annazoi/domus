import type { HostCustomerRow } from '@/features/customers/interfaces/host-customer.interface';

export const CUSTOMER_SEARCH_MIN_LENGTH = 3;

export function getCustomerDisplayName(customer: HostCustomerRow) {
	return `${customer.first_name} ${customer.last_name}`.trim() || 'Customer';
}

export function matchesHostCustomer(customer: HostCustomerRow, query: string) {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return true;

	const haystack = [
		customer.first_name,
		customer.last_name,
		getCustomerDisplayName(customer),
		customer.email,
		customer.phone,
		customer.city,
		customer.country,
		customer.vat_number,
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();

	return haystack.includes(normalized);
}

export function filterHostCustomers(customers: HostCustomerRow[], query: string) {
	const trimmed = query.trim();
	if (trimmed.length < CUSTOMER_SEARCH_MIN_LENGTH) return customers;
	return customers.filter((customer) => matchesHostCustomer(customer, trimmed));
}

export function searchHostCustomers(customers: HostCustomerRow[], query: string, limit = 8) {
	const trimmed = query.trim();
	if (trimmed.length < CUSTOMER_SEARCH_MIN_LENGTH) return [];
	return customers.filter((customer) => matchesHostCustomer(customer, trimmed)).slice(0, limit);
}
