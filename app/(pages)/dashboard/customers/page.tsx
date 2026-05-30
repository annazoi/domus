'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Skeleton } from '@/components/ui';
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

function CustomersPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const customerId = searchParams.get('customer');
	const { data: customers = [], isLoading } = useHostCustomers(true);
	const [activeTab, setActiveTab] = useState<CustomerDetailTab>(CUSTOMER_DETAIL_TAB.BOOKINGS);
	const [searchQuery, setSearchQuery] = useState('');

	const filteredCustomers = useMemo(
		() => filterHostCustomers(customers, searchQuery),
		[customers, searchQuery],
	);

	const selected = useMemo(() => {
		if (!customerId) return null;
		return customers.find((customer) => customer.id === customerId) ?? null;
	}, [customerId, customers]);

	const selectCustomer = (customer: HostCustomerRow) => {
		setActiveTab(CUSTOMER_DETAIL_TAB.BOOKINGS);
		router.push(`/dashboard/customers?customer=${encodeURIComponent(customer.id)}`);
	};

	const handleBack = () => {
		setActiveTab(CUSTOMER_DETAIL_TAB.BOOKINGS);
		router.push('/dashboard/customers');
	};

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Customers</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Your guests</h1>
			</div>

			{customerId && isLoading ? (
				<div className="space-y-4 rounded-2xl bg-white/80 px-5 py-6 sm:px-8">
					<Skeleton className="h-5 w-32 bg-black/10" />
					<Skeleton className="h-10 w-full max-w-md bg-black/10" />
					<Skeleton className="h-48 w-full bg-black/10" />
				</div>
			) : null}

			{customerId && !isLoading && !selected ? (
				<div className="rounded-2xl bg-white/80 p-8 text-center">
					<p className="font-serif text-2xl">Customer not found</p>
					<Button type="button" variant="ghostPill" onClick={handleBack} className="mt-4 text-sm text-camel">
						Back to all customers
					</Button>
				</div>
			) : null}

			{selected ? (
				<CustomerDetailView
					customer={selected}
					activeTab={activeTab}
					onTabChange={setActiveTab}
					onBack={handleBack}
				/>
			) : null}

			{!customerId ? (
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
			) : null}
		</div>
	);
}

export default function CustomersPage() {
	return (
		<Suspense
			fallback={
				<div className="space-y-8">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-camel">Customers</p>
						<h1 className="mt-2 font-serif text-4xl tracking-tight">Your guests</h1>
					</div>
					<div className="overflow-hidden rounded-2xl bg-white/80">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="border-b border-black/5 px-5 py-5 md:px-8">
								<Skeleton className="h-5 w-40 bg-black/10" />
							</div>
						))}
					</div>
				</div>
			}
		>
			<CustomersPageContent />
		</Suspense>
	);
}
