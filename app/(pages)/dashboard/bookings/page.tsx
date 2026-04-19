'use client';

import { Button } from '@/components/ui';
import { useBookings } from '@/features/property/hooks/use-property';

export default function BookingsPage() {
	const { data: bookings = [], isLoading: loading } = useBookings();

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Bookings</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Reservation flow</h1>
			</div>

			{loading ? <p className="text-sm text-[#1A1A1A]/60">Loading bookings...</p> : null}
			{!loading && bookings.length === 0 ? (
				<div className="rounded-2xl bg-white/80 p-8 text-center">
					<p className="font-serif text-2xl">No bookings yet</p>
					<p className="mt-2 text-sm text-[#1A1A1A]/60">Bookings will appear once guests reserve your properties.</p>
				</div>
			) : null}

			<div className="overflow-hidden rounded-2xl bg-white/80">
				<div className="hidden grid-cols-4 gap-4 border-b border-black/5 px-5 py-3 text-xs uppercase tracking-wide text-[#1A1A1A]/45 md:grid">
					<span>Guest</span>
					<span>Property</span>
					<span>Dates</span>
					<span>Status</span>
				</div>
				{bookings.map((booking) => (
					<Button
						type="button"
						key={booking.id}
						variant="custom"
						className="grid w-full grid-cols-1 gap-2 border-b border-black/5 px-5 py-4 text-left font-normal transition hover:bg-black/[0.02] md:grid-cols-4 md:gap-4"
					>
						<span className="font-medium">{booking.guest_name}</span>
						<span className="text-sm text-[#1A1A1A]/65">{booking.property_title}</span>
						<span className="text-sm text-[#1A1A1A]/65">
							{booking.start_date} - {booking.end_date}
						</span>
						<span className="text-sm capitalize">{booking.status}</span>
					</Button>
				))}
			</div>
		</div>
	);
}
