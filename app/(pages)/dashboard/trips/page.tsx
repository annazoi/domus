'use client';

import { Button, Skeleton } from '@/components/ui';
import { useGuestTrips } from '@/features/bookings/hooks/use-bookings';

export default function TripsPage() {
	const { data: trips = [], isLoading: loading } = useGuestTrips();

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Stays</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">My trips</h1>
			</div>

			{loading ? (
				<div className="overflow-hidden rounded-2xl bg-white/80">
					<div className="hidden grid-cols-4 gap-4 border-b border-black/5 px-5 py-3 md:grid">
						<Skeleton className="h-3 w-14 bg-black/10" />
						<Skeleton className="h-3 w-16 bg-black/10" />
						<Skeleton className="h-3 w-12 bg-black/10" />
						<Skeleton className="h-3 w-12 bg-black/10" />
					</div>
					{Array.from({ length: 4 }).map((_, index) => (
						<div key={index} className="grid grid-cols-1 gap-2 border-b border-black/5 px-5 py-4 md:grid-cols-4 md:gap-4">
							<Skeleton className="h-4 w-28 bg-black/10" />
							<Skeleton className="h-4 w-32 bg-black/10" />
							<Skeleton className="h-4 w-36 bg-black/10" />
							<Skeleton className="h-4 w-16 bg-black/10" />
						</div>
					))}
				</div>
			) : null}
			{!loading && trips.length === 0 ? (
				<div className="rounded-2xl bg-white/80 p-8 text-center">
					<p className="font-serif text-2xl">No trips yet</p>
					<p className="mt-2 text-sm text-[#1A1A1A]/60">After you book a stay, it will show up here when you sign in with the same email.</p>
				</div>
			) : null}

			{trips.length > 0 ? (
				<div className="overflow-hidden rounded-2xl bg-white/80">
					<div className="hidden grid-cols-4 gap-4 border-b border-black/5 px-5 py-3 text-xs uppercase tracking-wide text-[#1A1A1A]/45 md:grid">
						<span>Host</span>
						<span>Property</span>
						<span>Dates</span>
						<span>Status</span>
					</div>
					{trips.map((trip) => (
						<Button
							type="button"
							key={trip.id}
							variant="custom"
							className="grid w-full grid-cols-1 gap-2 border-b border-black/5 px-5 py-4 text-left font-normal transition hover:bg-black/[0.02] md:grid-cols-4 md:gap-4"
						>
							<span className="font-medium">{trip.guest_name}</span>
							<span className="text-sm text-[#1A1A1A]/65">{trip.property_title}</span>
							<span className="text-sm text-[#1A1A1A]/65">
								{trip.start_date} - {trip.end_date}
							</span>
							<span className="text-sm capitalize">{trip.status}</span>
						</Button>
					))}
				</div>
			) : null}
		</div>
	);
}
