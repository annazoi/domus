'use client';

import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import type { EarningsTransaction } from '@/app/(pages)/dashboard/_utils/compute-earnings-stats';
import {
	DashboardDataTable,
	DashboardDataTableSkeleton,
	GuestNameCell,
} from './dashboard-data-table';

const columnHelper = createColumnHelper<EarningsTransaction>();

const headers = ['Guest', 'Reference', 'Date', 'Amount'] as const;

function headerAlignment(header: string) {
	if (header === 'Amount') return 'right' as const;
	return undefined;
}

function useRecentTransactionColumns() {
	return useMemo(
		() => [
			columnHelper.accessor('guest', {
				id: 'guest',
				header: 'Guest',
				cell: ({ getValue }) => <GuestNameCell>{getValue()}</GuestNameCell>,
			}),
			columnHelper.accessor('id', {
				id: 'id',
				header: 'Reference',
			}),
			columnHelper.accessor('date', {
				id: 'date',
				header: 'Date',
			}),
			columnHelper.accessor('amount', {
				id: 'amount',
				header: 'Amount',
			}),
		],
		[],
	);
}

export function RecentTransactionsTableSkeleton({ rows = 3 }: { rows?: number }) {
	return (
		<DashboardDataTableSkeleton
			headers={headers}
			rows={rows}
			minWidth="520px"
			headerAlignment={headerAlignment}
		/>
	);
}

export function RecentTransactionsTable({
	transactions,
	embedded = false,
}: {
	transactions: EarningsTransaction[];
	embedded?: boolean;
}) {
	const columns = useRecentTransactionColumns();

	return (
		<DashboardDataTable
			data={transactions}
			columns={columns}
			minWidth="520px"
			getRowId={(row) => row.bookingId}
			embedded={embedded}
		/>
	);
}
