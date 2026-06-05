'use client';

import { useEffect, useState } from 'react';
import { Button, cn, Skeleton } from '@/components/ui';
import { DashboardPagination } from '@/app/(pages)/dashboard/_components/dashboard-pagination';
import { useGuestTripsPage } from '@/features/bookings/hooks/use-bookings';
import { BookingStatus } from '@/features/bookings/interfaces/booking-status';
import type { Booking } from '@/features/bookings/interfaces/booking.interface';
import { formatEuropeanDateRange } from '@/features/property-availability/utils/date';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { useAuthStore } from '@/store/auth';
import { TripDetailModal, TripRowChevron } from './_components/trip-detail-modal';

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

function statusLabelClass(status: Booking['status']) {
	if (status === BookingStatus.CONFIRMED) return 'text-camel-dark';
	if (status === BookingStatus.CANCELLED) return 'text-dashboard-muted line-through';
	return 'text-espresso/70';
}

export default function TripsPage() {
	const authEmail = useAuthStore((state) => state.email);
	const [page, setPage] = useState(1);
	const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
	const { data, isLoading, isFetching } = useGuestTripsPage(page, PAGE_SIZE);

	const trips = data?.items ?? [];
	const pagination = data?.pagination;
	const total = pagination?.total ?? 0;
	const loading = isLoading;

	useEffect(() => {
		if (!pagination || page <= pagination.totalPages) return;
		setPage(pagination.totalPages);
	}, [page, pagination]);

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Stays</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">My trips</h1>
			</div>

			{loading ? (
				<div className="dashboard-panel overflow-hidden rounded-2xl">
					<div className="hidden grid-cols-[1fr_1.2fr_1.2fr_auto_auto] gap-4 border-b border-dashboard-border px-5 py-3 md:grid">
						<Skeleton className="h-3 w-14 bg-black/10" />
						<Skeleton className="h-3 w-16 bg-black/10" />
						<Skeleton className="h-3 w-12 bg-black/10" />
						<Skeleton className="h-3 w-12 bg-black/10" />
						<Skeleton className="h-3 w-4 bg-black/10" />
					</div>
					{Array.from({ length: PAGE_SIZE }).map((_, index) => (
						<div
							key={index}
							className="grid grid-cols-1 gap-2 border-b border-dashboard-border px-5 py-4 md:grid-cols-[1fr_1.2fr_1.2fr_auto_auto] md:gap-4"
						>
							<Skeleton className="h-4 w-28 bg-black/10" />
							<Skeleton className="h-4 w-32 bg-black/10" />
							<Skeleton className="h-4 w-36 bg-black/10" />
							<Skeleton className="h-4 w-16 bg-black/10" />
						</div>
					))}
				</div>
			) : null}
			{!loading && total === 0 ? (
				<div className="dashboard-panel rounded-2xl p-8 text-center">
					<p className="font-serif text-2xl">No trips yet</p>
					<p className="mt-2 text-sm text-espresso/60">
						{authEmail
							? `No guest bookings found for ${authEmail}. Sign in with the email you used when booking, or book a new stay while signed in.`
							: 'After you book a stay, it will show up here when you sign in with the same email.'}
					</p>
				</div>
			) : null}

			{!loading && total > 0 ? (
				<div className="dashboard-panel overflow-hidden rounded-2xl">
					<div className={cn('transition-opacity', isFetching && 'pointer-events-none opacity-50')}>
						<div className="hidden grid-cols-[1fr_1.2fr_1.2fr_auto_auto] gap-4 border-b border-dashboard-border px-5 py-3 text-xs uppercase tracking-wide text-espresso/45 md:grid">
							<span>Host</span>
							<span>Property</span>
							<span>Dates</span>
							<span>Status</span>
							<span className="sr-only">Details</span>
						</div>
						{trips.map((trip) => (
							<Button
								type="button"
								key={trip.id}
								variant="custom"
								className="cursor-pointer group grid w-full grid-cols-1 gap-2 border-b border-dashboard-border px-5 py-4 text-left font-normal transition hover:bg-dashboard-row-hover last:border-b-0 md:grid-cols-[1fr_1.2fr_1.2fr_auto_auto] md:items-center md:gap-4"
								onClick={() => setSelectedTripId(trip.id)}
							>
								<span className="font-medium">{trip.guest_name}</span>
								<span className="text-sm text-espresso/65">{trip.property_title}</span>
								<span className="text-sm text-espresso/65">{formatEuropeanDateRange(trip.start_date, trip.end_date)}</span>
								<span className={`text-sm capitalize ${statusLabelClass(trip.status)}`}>{trip.status}</span>
								<TripRowChevron />
							</Button>
						))}
					</div>
					{pagination ? (
						<DashboardPagination
							page={pagination.page}
							pageSize={pagination.pageSize}
							total={pagination.total}
							onPageChange={setPage}
							itemLabel="trips"
						/>
					) : null}
				</div>
			) : null}

			<TripDetailModal tripId={selectedTripId} onClose={() => setSelectedTripId(null)} />
		</div>
	);
}
