'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/components/ui';
import { BookingDetailModal } from '@/app/(pages)/dashboard/bookings/_components/booking-detail-modal';
import { DashboardPagination } from '@/app/(pages)/dashboard/_components/dashboard-pagination';
import { useCustomerBookingsPage } from '@/features/bookings/hooks/use-bookings';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { CustomerBookingsTable, CustomerBookingsTableSkeleton } from './customer-bookings-table';

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

export function CustomerBookingsList({ customerId }: { customerId: string }) {
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<HostBookingDetail | null>(null);
	const { data, isLoading, isFetching } = useCustomerBookingsPage(customerId, page, PAGE_SIZE);

	const bookings = data?.items ?? [];
	const pagination = data?.pagination;
	const total = pagination?.total ?? 0;

	useEffect(() => {
		setPage(1);
	}, [customerId]);

	useEffect(() => {
		if (!pagination || page <= pagination.totalPages) return;
		setPage(pagination.totalPages);
	}, [page, pagination]);

	if (isLoading) {
		return <CustomerBookingsTableSkeleton rows={PAGE_SIZE} />;
	}

	if (total === 0) {
		return (
			<div className="dashboard-panel rounded-2xl p-8 text-center">
				<p className="font-serif text-2xl">No bookings yet</p>
				<p className="mt-2 text-sm text-espresso/60">This customer has not made any reservations.</p>
			</div>
		);
	}

	return (
		<>
			<div className="dashboard-panel overflow-hidden rounded-2xl">
				<div className={cn('transition-opacity', isFetching && 'pointer-events-none opacity-50')}>
					<CustomerBookingsTable bookings={bookings} onSelect={setSelected} embedded />
				</div>
				{pagination ? (
					<DashboardPagination
						page={pagination.page}
						pageSize={pagination.pageSize}
						total={pagination.total}
						onPageChange={setPage}
						itemLabel="bookings"
					/>
				) : null}
			</div>

			<BookingDetailModal
				open={selected !== null}
				booking={selected}
				onClose={() => setSelected(null)}
				onUpdated={setSelected}
			/>
		</>
	);
}
