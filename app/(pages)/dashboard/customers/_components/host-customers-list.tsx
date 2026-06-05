'use client';

import type { HostCustomerRow } from '@/features/customers/interfaces/host-customer.interface';
import { CUSTOMER_SEARCH_MIN_LENGTH } from '../_utils/filter-host-customers';
import { CustomersTable, CustomersTableSkeleton } from './customers-table';

type HostCustomersListProps = {
	customers: HostCustomerRow[];
	loading: boolean;
	searchQuery?: string;
	onSelect: (customer: HostCustomerRow) => void;
};

export function HostCustomersList({ customers, loading, searchQuery = '', onSelect }: HostCustomersListProps) {
	if (loading) {
		return <CustomersTableSkeleton />;
	}

	if (customers.length === 0) {
		const hasActiveSearch = searchQuery.trim().length >= CUSTOMER_SEARCH_MIN_LENGTH;
		return (
			<div className="dashboard-panel rounded-2xl p-8 text-center">
				<p className="font-serif text-2xl">{hasActiveSearch ? 'No matching customers' : 'No customers yet'}</p>
				<p className="mt-2 text-sm text-espresso/60">
					{hasActiveSearch
						? 'Try a different name, email, phone number, or location.'
						: 'Customers appear after guests book your properties with billing details on file.'}
				</p>
			</div>
		);
	}

	return <CustomersTable customers={customers} onSelect={onSelect} />;
}
