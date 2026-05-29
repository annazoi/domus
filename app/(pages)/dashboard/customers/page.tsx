'use client';

import { useMemo, useState } from 'react';
import { useHostCustomers } from '@/features/customers/hooks/use-host-customers';
import type { HostCustomerRow } from '@/features/customers/interfaces/host-customer.interface';
import { CustomerDetailModal } from './_components/customer-detail-modal';
import { CustomerSearch } from './_components/customer-search';
import { HostCustomersList } from './_components/host-customers-list';
import { filterHostCustomers } from './_utils/filter-host-customers';

export default function CustomersPage() {
	const { data: customers = [], isLoading } = useHostCustomers(true);
	const [selected, setSelected] = useState<HostCustomerRow | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	const filteredCustomers = useMemo(
		() => filterHostCustomers(customers, searchQuery),
		[customers, searchQuery],
	);

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Customers</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Your guests</h1>
			</div>

			<CustomerSearch
				customers={customers}
				value={searchQuery}
				onChange={setSearchQuery}
				onSelectCustomer={setSelected}
			/>

			<HostCustomersList
				customers={filteredCustomers}
				loading={isLoading}
				searchQuery={searchQuery}
				onSelect={setSelected}
			/>

			<CustomerDetailModal
				open={selected !== null}
				customer={selected}
				onClose={() => setSelected(null)}
				onUpdated={(customer) => setSelected(customer)}
			/>
		</div>
	);
}
