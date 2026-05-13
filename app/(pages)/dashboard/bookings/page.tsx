'use client';

import { useState } from 'react';
import { Button, Skeleton } from '@/components/ui';
import { useBookings } from '@/features/bookings/hooks/use-bookings';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';
import { BookingDetailModal } from './_components/booking-detail-modal';

export default function BookingsPage() {
	const { data: bookings = [], isLoading: loading } = useBookings();
	const [selected, setSelected] = useState<HostBookingDetail | null>(null);

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Bookings</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Reservation flow</h1>
			</div>

			{loading ? (
				<div className="overflow-hidden rounded-2xl bg-white/80">
					{Array.from({ length: 4 }).map((_, index) => (
						<div
							key={index}
							className="flex flex-col gap-3 border-b border-black/5 px-5 py-5 md:flex-row md:flex-wrap md:items-center md:gap-x-8 md:px-8 lg:px-10"
						>
							<Skeleton className="h-5 w-36 bg-black/10 md:h-6" />
							<Skeleton className="h-4 flex-1 min-w-[12rem] bg-black/10" />
							<Skeleton className="h-4 w-44 bg-black/10" />
							<Skeleton className="h-4 w-20 bg-black/10 md:ml-auto" />
						</div>
					))}
				</div>
			) : null}
			{!loading && bookings.length === 0 ? (
				<div className="rounded-2xl bg-white/80 p-8 text-center">
					<p className="font-serif text-2xl">No bookings yet</p>
					<p className="mt-2 text-sm text-[#1A1A1A]/60">Bookings will appear once guests reserve your properties.</p>
				</div>
			) : null}

			{!loading && bookings.length > 0 ? (
				<div className="overflow-hidden rounded-2xl bg-white/80">
					{bookings.map((booking) => (
						<Button
							type="button"
							key={booking.id}
							variant="custom"
							className="flex h-auto w-full flex-col items-start gap-2 border-b border-black/5 px-5 py-5 text-left font-normal transition hover:bg-black/[0.02] last:border-b-0 md:flex-row md:flex-wrap md:items-baseline md:gap-x-8 md:gap-y-2 md:px-8 md:py-6 lg:gap-x-12 lg:px-10"
							onClick={() => setSelected(booking)}
						>
							<span className="max-w-full shrink-0 text-lg font-medium leading-snug md:text-xl">{booking.guest_name}</span>
							<span className="min-w-0 flex-1 text-base leading-snug text-[#1A1A1A]/70 md:text-lg">
								{booking.property_title}
							</span>
							<span className="shrink-0 text-sm text-[#1A1A1A]/60 md:text-base">
								{booking.start_date} – {booking.end_date}
							</span>
							<span className="shrink-0 text-sm capitalize text-[#1A1A1A]/80 md:ml-auto md:text-base">
								{booking.status}
							</span>
						</Button>
					))}
				</div>
			) : null}

			<BookingDetailModal open={selected !== null} booking={selected} onClose={() => setSelected(null)} />
		</div>
	);
}
