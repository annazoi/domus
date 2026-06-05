'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, cn, Skeleton } from '@/components/ui';
import { DashboardPagination } from '@/app/(pages)/dashboard/_components/dashboard-pagination';
import { useHostCustomer, useHostCustomersPage } from '@/features/customers/hooks/use-host-customers';
import type { HostCustomerRow } from '@/features/customers/interfaces/host-customer.interface';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import {
	CUSTOMER_DETAIL_TAB,
	CustomerDetailView,
	type CustomerDetailTab,
} from './_components/customer-detail-view';
import { CustomerSearch } from './_components/customer-search';
import { CustomersTable, CustomersTableSkeleton } from './_components/customers-table';
import { HostCustomersList } from './_components/host-customers-list';
import { CUSTOMER_SEARCH_MIN_LENGTH } from './_utils/filter-host-customers';

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

function CustomersPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const customerId = searchParams.get('customer');
	const [activeTab, setActiveTab] = useState<CustomerDetailTab>(CUSTOMER_DETAIL_TAB.BOOKINGS);
	const [searchQuery, setSearchQuery] = useState('');
	const [page, setPage] = useState(1);

	const searchParam =
		searchQuery.trim().length >= CUSTOMER_SEARCH_MIN_LENGTH ? searchQuery.trim() : undefined;

	const { data: customerData, isLoading: customerLoading } = useHostCustomer(customerId);
	const { data, isLoading: listLoading, isFetching } = useHostCustomersPage(
		page,
		PAGE_SIZE,
		searchParam,
		!customerId,
	);

	const customers = data?.items ?? [];
	const pagination = data?.pagination;
	const total = pagination?.total ?? 0;
	const selected = customerId ? (customerData ?? null) : null;

	useEffect(() => {
		setPage(1);
	}, [searchParam]);

	useEffect(() => {
		if (!pagination || page <= pagination.totalPages) return;
		setPage(pagination.totalPages);
	}, [page, pagination]);

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

			{customerId && customerLoading ? (
				<div className="space-y-4 dashboard-panel rounded-2xl px-5 py-6 sm:px-8">
					<Skeleton className="h-5 w-32 bg-black/10" />
					<Skeleton className="h-10 w-full max-w-md bg-black/10" />
					<Skeleton className="h-48 w-full bg-black/10" />
				</div>
			) : null}

			{customerId && !customerLoading && !selected ? (
				<div className="dashboard-panel rounded-2xl p-8 text-center">
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
					<CustomerSearch value={searchQuery} onChange={setSearchQuery} onSelectCustomer={selectCustomer} />

					{listLoading ? <CustomersTableSkeleton rows={PAGE_SIZE} /> : null}
					{!listLoading && total === 0 ? (
						<HostCustomersList
							customers={[]}
							loading={false}
							searchQuery={searchQuery}
							onSelect={selectCustomer}
						/>
					) : null}
					{!listLoading && total > 0 ? (
						<div className="dashboard-panel overflow-hidden rounded-2xl">
							<div className={cn('transition-opacity', isFetching && 'pointer-events-none opacity-50')}>
								<CustomersTable customers={customers} onSelect={selectCustomer} embedded />
							</div>
							{pagination ? (
								<DashboardPagination
									page={pagination.page}
									pageSize={pagination.pageSize}
									total={pagination.total}
									onPageChange={setPage}
									itemLabel="customers"
								/>
							) : null}
						</div>
					) : null}
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
					<CustomersTableSkeleton />
				</div>
			}
		>
			<CustomersPageContent />
		</Suspense>
	);
}
