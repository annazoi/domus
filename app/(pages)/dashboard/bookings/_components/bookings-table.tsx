'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { createColumnHelper } from '@tanstack/react-table';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';
import { formatEuropeanDateRange } from '@/features/property-availability/utils/date';
import {
	BookingStatusBadge,
	DashboardDataTable,
	DashboardDataTableSkeleton,
	GuestNameCell,
} from '@/app/(pages)/dashboard/_components/dashboard-data-table';

const columnHelper = createColumnHelper<HostBookingDetail>();

const headers = ['Guest', 'Property', 'Stay', 'Guests', 'Total', 'Status'] as const;

function formatMoney(value: number) {
	return `$${value.toFixed(2)}`;
}

function headerAlignment(header: string) {
	if (header === 'Total' || header === 'Status') return 'right' as const;
	if (header === 'Guests') return 'center' as const;
	return undefined;
}

function useBookingColumns() {
	return useMemo(
		() => [
			columnHelper.accessor('guest_name', {
				id: 'guest_name',
				header: 'Guest',
				cell: ({ getValue }) => <GuestNameCell>{getValue()}</GuestNameCell>,
			}),
			columnHelper.accessor('property_title', {
				id: 'property_title',
				header: 'Property',
				cell: ({ row, getValue }) => (
					<Link
						href={`/${encodeURIComponent(row.original.property.slug)}`}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(event) => event.stopPropagation()}
						className="block truncate text-sm leading-snug text-espresso/70 transition hover:text-camel md:text-[0.95rem]"
					>
						{getValue()}
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
			columnHelper.accessor('guests', {
				id: 'guests',
				header: 'Guests',
			}),
			columnHelper.accessor('total_price', {
				id: 'total_price',
				header: 'Total',
				cell: ({ getValue }) => formatMoney(getValue()),
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

export function BookingsTableSkeleton({ rows = 5 }: { rows?: number }) {
	return (
		<DashboardDataTableSkeleton headers={headers} rows={rows} headerAlignment={headerAlignment} />
	);
}

export function BookingsTable({
	bookings,
	onSelect,
	embedded = false,
}: {
	bookings: HostBookingDetail[];
	onSelect: (booking: HostBookingDetail) => void;
	embedded?: boolean;
}) {
	const columns = useBookingColumns();

	return (
		<DashboardDataTable
			data={bookings}
			columns={columns}
			onRowClick={onSelect}
			getRowId={(row) => row.id}
			embedded={embedded}
		/>
	);
}
