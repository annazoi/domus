'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Euro } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import {
	BookingStatusBadge,
	DashboardDataTable,
	DashboardDataTableSkeleton,
	GuestNameCell,
} from '@/app/(pages)/dashboard/_components/dashboard-data-table';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';
import { formatEuropeanDateRange } from '@/features/property-availability/utils/date';
import { formatCustomerSpentAmount } from './customer-total-spent';

const columnHelper = createColumnHelper<HostBookingDetail>();

const headers = ['Property', 'Stay', 'Price', 'Status'] as const;

function headerAlignment(header: string) {
	if (header === 'Price' || header === 'Status') return 'right' as const;
	return undefined;
}

function useCustomerBookingColumns() {
	return useMemo(
		() => [
			columnHelper.accessor('property_title', {
				id: 'property_title',
				header: 'Property',
				cell: ({ row, getValue }) => (
					<Link
						href={`/${encodeURIComponent(row.original.property.slug)}`}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(event) => event.stopPropagation()}
						className="block truncate text-sm leading-snug text-espresso transition hover:text-camel md:text-[0.95rem]"
					>
						<GuestNameCell>{getValue()}</GuestNameCell>
					</Link>
				),
			}),
			columnHelper.accessor(
				(row) => formatEuropeanDateRange(row.start_date, row.end_date),
				{
					id: 'stay',
					header: 'Stay',
				},
			),
			columnHelper.accessor('total_price', {
				id: 'total_price',
				header: 'Price',
				cell: ({ getValue }) => {
					const value = getValue();
					if (!Number.isFinite(value)) {
						return <span className="text-sm text-espresso/50">—</span>;
					}
					return (
						<span className="inline-flex items-center justify-end gap-1 text-sm font-medium tabular-nums text-espresso md:text-[0.95rem]">
							<Euro className="h-3.5 w-3.5 shrink-0 text-camel" aria-hidden />
							{formatCustomerSpentAmount(value)}
						</span>
					);
				},
			}),
			columnHelper.accessor('status', {
				id: 'status',
				header: 'Status',
				cell: ({ getValue }) => <BookingStatusBadge status={getValue()} />,
			}),
		],
		[],
	);
}

export function CustomerBookingsTableSkeleton({ rows = 3 }: { rows?: number }) {
	return (
		<DashboardDataTableSkeleton
			headers={headers}
			rows={rows}
			minWidth="640px"
			headerAlignment={headerAlignment}
		/>
	);
}

export function CustomerBookingsTable({
	bookings,
	onSelect,
	embedded = false,
}: {
	bookings: HostBookingDetail[];
	onSelect: (booking: HostBookingDetail) => void;
	embedded?: boolean;
}) {
	const columns = useCustomerBookingColumns();

	return (
		<DashboardDataTable
			data={bookings}
			columns={columns}
			onRowClick={onSelect}
			minWidth="640px"
			getRowId={(row) => row.id}
			embedded={embedded}
		/>
	);
}
