'use client';

import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import {
	DashboardDataTable,
	DashboardDataTableSkeleton,
	GuestNameCell,
} from '@/app/(pages)/dashboard/_components/dashboard-data-table';
import type { HostCustomerRow } from '@/features/customers/interfaces/host-customer.interface';
import { CustomerTotalSpent } from './customer-total-spent';

const columnHelper = createColumnHelper<HostCustomerRow>();

const headers = ['Customer', 'Location', 'Bookings', 'Spent'] as const;

function formatCustomerName(customer: HostCustomerRow) {
	return `${customer.first_name} ${customer.last_name}`.trim() || 'Customer';
}

function formatCustomerLocation(customer: HostCustomerRow) {
	return [customer.city, customer.country].filter(Boolean).join(', ') || '—';
}

function headerAlignment(header: string) {
	if (header === 'Bookings' || header === 'Spent') return 'right' as const;
	return undefined;
}

function useCustomerColumns() {
	return useMemo(
		() => [
			columnHelper.display({
				id: 'customer',
				header: 'Customer',
				cell: ({ row }) => {
					const customer = row.original;
					return (
						<div className="min-w-0 max-w-[16rem]">
							<GuestNameCell>{formatCustomerName(customer)}</GuestNameCell>
							<p className="mt-0.5 truncate text-sm text-espresso/65">{customer.email}</p>
							{customer.phone ? (
								<p className="mt-0.5 text-sm text-espresso/55">{customer.phone}</p>
							) : null}
						</div>
					);
				},
			}),
			columnHelper.accessor((row) => formatCustomerLocation(row), {
				id: 'location',
				header: 'Location',
				cell: ({ getValue }) => (
					<span className="text-sm leading-snug text-espresso/70 md:text-[0.95rem]">{getValue()}</span>
				),
			}),
			columnHelper.accessor('booking_count', {
				id: 'booking_count',
				header: 'Bookings',
				cell: ({ getValue }) => {
					const count = getValue();
					return (
						<span className="text-sm tabular-nums text-espresso/75 md:text-[0.95rem]">
							{count} {count === 1 ? 'booking' : 'bookings'}
						</span>
					);
				},
			}),
			columnHelper.accessor('total_spent', {
				id: 'total_spent',
				header: 'Spent',
				cell: ({ getValue }) => (
					<CustomerTotalSpent
						amount={getValue()}
						className="justify-end text-sm font-medium text-camel md:text-[0.95rem]"
					/>
				),
			}),
		],
		[],
	);
}

export function CustomersTableSkeleton({ rows = 4 }: { rows?: number }) {
	return (
		<DashboardDataTableSkeleton
			headers={headers}
			rows={rows}
			minWidth="680px"
			headerAlignment={headerAlignment}
		/>
	);
}

export function CustomersTable({
	customers,
	onSelect,
	embedded = false,
}: {
	customers: HostCustomerRow[];
	onSelect: (customer: HostCustomerRow) => void;
	embedded?: boolean;
}) {
	const columns = useCustomerColumns();

	return (
		<DashboardDataTable
			data={customers}
			columns={columns}
			onRowClick={onSelect}
			minWidth="680px"
			getRowId={(row) => row.id}
			embedded={embedded}
		/>
	);
}
