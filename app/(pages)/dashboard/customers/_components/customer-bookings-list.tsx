'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui';
import { BookingDetailModal } from '@/app/(pages)/dashboard/bookings/_components/booking-detail-modal';
import { useBookings } from '@/features/bookings/hooks/use-bookings';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';

export function CustomerBookingsList({ customerId }: { customerId: string }) {
	const { data: bookings = [], isLoading } = useBookings();
	const [selected, setSelected] = useState<HostBookingDetail | null>(null);

	const customerBookings = useMemo(
		() => bookings.filter((booking) => booking.customer_id === customerId),
		[bookings, customerId],
	);

	if (isLoading) {
		return (
			<div className="dashboard-panel overflow-hidden rounded-2xl">
				{Array.from({ length: 3 }).map((_, index) => (
					<div
						key={index}
						className="flex flex-col gap-3 border-b border-dashboard-border px-5 py-5 md:flex-row md:flex-wrap md:items-center md:gap-x-8 md:px-8 lg:px-10"
					>
						<Skeleton className="h-5 w-36 bg-black/10 md:h-6" />
						<Skeleton className="h-4 flex-1 min-w-[12rem] bg-black/10" />
						<Skeleton className="h-4 w-44 bg-black/10" />
						<Skeleton className="h-4 w-20 bg-black/10 md:ml-auto" />
					</div>
				))}
			</div>
		);
	}

	if (customerBookings.length === 0) {
		return (
			<div className="dashboard-panel rounded-2xl p-8 text-center">
				<p className="font-serif text-2xl">No bookings yet</p>
				<p className="mt-2 text-sm text-[#1A1A1A]/60">This customer has not made any reservations.</p>
			</div>
		);
	}

	return (
		<>
			<div className="dashboard-panel overflow-hidden rounded-2xl">
				{customerBookings.map((booking) => (
					<div
						key={booking.id}
						role="button"
						tabIndex={0}
						className="cursor-pointer flex w-full flex-col items-start gap-2 border-b border-dashboard-border px-5 py-5 text-left transition hover:bg-dashboard-row-hover last:border-b-0 md:flex-row md:flex-wrap md:items-baseline md:gap-x-8 md:gap-y-2 md:px-8 md:py-6 lg:gap-x-12 lg:px-10"
						onClick={() => setSelected(booking)}
						onKeyDown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								setSelected(booking);
							}
						}}
					>
						<Link
							href={`/${encodeURIComponent(booking.property.slug)}`}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(event) => event.stopPropagation()}
							className="min-w-0 flex-1 text-lg font-medium leading-snug text-[#1A1A1A] transition hover:text-camel md:text-[1.05rem]"
						>
							{booking.property_title}
						</Link>
						<span className="shrink-0 text-sm text-[#1A1A1A]/60 md:text-base">
							{booking.start_date} – {booking.end_date}
						</span>
						<span className="shrink-0 text-sm capitalize text-[#1A1A1A]/80 md:ml-auto md:text-base">
							{booking.status}
						</span>
					</div>
				))}
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
