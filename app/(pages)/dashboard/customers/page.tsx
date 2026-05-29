'use client';

import { useMemo, useState } from 'react';
import { useHostCustomers } from '@/features/customers/hooks/use-host-customers';
import type { HostCustomerRow } from '@/features/customers/interfaces/host-customer.interface';
import {
	CUSTOMER_DETAIL_TAB,
	CustomerDetailView,
	type CustomerDetailTab,
} from './_components/customer-detail-view';
import { CustomerSearch } from './_components/customer-search';
import { HostCustomersList } from './_components/host-customers-list';
import { filterHostCustomers } from './_utils/filter-host-customers';

export default function CustomersPage() {
	const { data: customers = [], isLoading } = useHostCustomers(true);
	const [selected, setSelected] = useState<HostCustomerRow | null>(null);
	const [activeTab, setActiveTab] = useState<CustomerDetailTab>(CUSTOMER_DETAIL_TAB.BOOKINGS);
	const [searchQuery, setSearchQuery] = useState('');

	const filteredCustomers = useMemo(
		() => filterHostCustomers(customers, searchQuery),
		[customers, searchQuery],
	);

	const selectCustomer = (customer: HostCustomerRow) => {
		setSelected(customer);
		setActiveTab(CUSTOMER_DETAIL_TAB.BOOKINGS);
	};

	const handleBack = () => {
		setSelected(null);
		setActiveTab(CUSTOMER_DETAIL_TAB.BOOKINGS);
	};

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Customers</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Your guests</h1>
			</div>

			{selected ? (
				<CustomerDetailView
					customer={selected}
					activeTab={activeTab}
					onTabChange={setActiveTab}
					onBack={handleBack}
					onUpdated={setSelected}
				/>
			) : (
				<>
					<CustomerSearch
						customers={customers}
						value={searchQuery}
						onChange={setSearchQuery}
						onSelectCustomer={selectCustomer}
					/>

					<HostCustomersList
						customers={filteredCustomers}
						loading={isLoading}
						searchQuery={searchQuery}
						onSelect={selectCustomer}
					/>
				</>
			)}
		</div>
	);
}
