'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Button, cn } from '@/components/ui';
import { DashboardPagination } from '@/app/(pages)/dashboard/_components/dashboard-pagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { useBookingsPage } from '@/features/bookings/hooks/use-bookings';
import { BOOKINGS_SEARCH_MIN_LENGTH } from '@/features/bookings/services/bookings.services';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';
import { BookingDetailModal } from './_components/booking-detail-modal';
import {
	BookingsFiltersBar,
	emptyBookingsFilters,
	hasActiveBookingsFilters,
	type BookingsFilters,
} from './_components/bookings-filters';
import { BookingsSearch, hasActiveBookingsSearch } from './_components/bookings-search';
import { BookingsTable, BookingsTableSkeleton } from './_components/bookings-table';

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

export default function BookingsPage() {
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState('');
	const [filters, setFilters] = useState<BookingsFilters>(emptyBookingsFilters);
	const [selected, setSelected] = useState<HostBookingDetail | null>(null);
	const deferredSearch = useDeferredValue(searchQuery.trim());

	const searchParam =
		deferredSearch.length >= BOOKINGS_SEARCH_MIN_LENGTH ? deferredSearch : undefined;

	const queryParams = useMemo(
		() => ({
			page,
			pageSize: PAGE_SIZE,
			propertyId: filters.propertyId || undefined,
			customerId: filters.customerId || undefined,
			dateFrom: filters.dateFrom || undefined,
			dateTo: filters.dateTo || undefined,
			search: searchParam,
		}),
		[page, filters, searchParam],
	);

	const { data, isLoading, isFetching } = useBookingsPage(queryParams);

	const bookings = data?.items ?? [];
	const pagination = data?.pagination;
	const total = pagination?.total ?? 0;
	const loading = isLoading;
	const filtersActive = hasActiveBookingsFilters(filters);
	const searchActive = hasActiveBookingsSearch(searchQuery);
	const queryActive = filtersActive || searchActive;
	const searchPending = searchQuery.trim() !== deferredSearch;

	const clearQuery = () => {
		setFilters(emptyBookingsFilters());
		setSearchQuery('');
	};

	useEffect(() => {
		setPage(1);
	}, [filters.propertyId, filters.customerId, filters.dateFrom, filters.dateTo, searchParam]);

	useEffect(() => {
		if (!pagination || page <= pagination.totalPages) return;
		setPage(pagination.totalPages);
	}, [page, pagination]);

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Bookings</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Reservation flow</h1>
			</div>

			<BookingsSearch value={searchQuery} onChange={setSearchQuery} />
			<BookingsFiltersBar filters={filters} onChange={setFilters} />

			{loading ? <BookingsTableSkeleton rows={PAGE_SIZE} /> : null}
			{!loading && total === 0 ? (
				<div className="dashboard-panel rounded-2xl p-8 text-center">
					<p className="font-serif text-2xl">
						{queryActive ? 'No matching bookings' : 'No bookings yet'}
					</p>
					<p className="mt-2 text-sm text-espresso/60">
						{queryActive
							? 'Try a different search term or adjust the filters.'
							: 'Bookings will appear once guests reserve your properties.'}
					</p>
					{queryActive ? (
						<Button type="button" variant="ghostPill" onClick={clearQuery} className="mt-4 text-sm text-camel">
							Clear search and filters
						</Button>
					) : null}
				</div>
			) : null}

			{!loading && total > 0 ? (
				<div className="dashboard-panel overflow-hidden rounded-2xl">
					<div
						className={cn(
							'transition-opacity',
							(isFetching || searchPending) && 'pointer-events-none opacity-50',
						)}
					>
						<BookingsTable bookings={bookings} onSelect={setSelected} embedded />
					</div>
					{pagination ? (
						<DashboardPagination
							page={pagination.page}
							pageSize={pagination.pageSize}
							total={pagination.total}
							onPageChange={setPage}
						/>
					) : null}
				</div>
			) : null}

			<BookingDetailModal
				open={selected !== null}
				booking={selected}
				onClose={() => setSelected(null)}
				onUpdated={setSelected}
			/>
		</div>
	);
}
