'use client';

import Link from 'next/link';
import { Button, Skeleton } from '@/components/ui';
import { useBookings } from '@/features/bookings/hooks/use-bookings';
import { useProperties } from '@/features/property/hooks/use-property';
import {
	computeOverviewStats,
	formatOverviewCurrency,
	formatOverviewPercent,
} from './_utils/compute-overview-stats';

const quickActions = [
	{ label: 'Add new property', href: '/dashboard/properties/new' },
	{ label: 'View bookings', href: '/dashboard/bookings' },
] as const;

export default function DashboardOverviewPage() {
	const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
	const { data: properties = [], isLoading: propertiesLoading } = useProperties();

	const loading = bookingsLoading || propertiesLoading;
	const stats = computeOverviewStats(bookings, properties.length);

	return (
		<div className="space-y-16">
			<section className="space-y-3">
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Overview</p>
				<h1 className="font-serif text-4xl tracking-tight md:text-5xl">A calm view of your business.</h1>
			</section>

			<section className="grid gap-10 md:grid-cols-3">
				{loading ? (
					Array.from({ length: 3 }).map((_, index) => (
						<div key={index}>
							<Skeleton className="h-4 w-32 bg-black/10" />
							<Skeleton className="mt-2 h-12 w-24 bg-black/10" />
						</div>
					))
				) : (
					<>
						<div>
							<p className="text-sm text-[#1A1A1A]/55">Total bookings</p>
							<p className="mt-2 font-serif text-5xl">{stats.totalBookings}</p>
						</div>
						<div>
							<p className="text-sm text-[#1A1A1A]/55">Revenue this month</p>
							<p className="mt-2 font-serif text-5xl">{formatOverviewCurrency(stats.revenueThisMonth)}</p>
						</div>
						<div>
							<p className="text-sm text-[#1A1A1A]/55">Occupancy rate</p>
							<p className="mt-2 font-serif text-5xl">{formatOverviewPercent(stats.occupancyRate)}</p>
						</div>
					</>
				)}
			</section>

			<section className="space-y-5">
				<h2 className="font-serif text-2xl">Recent activity</h2>
				{loading ? (
					<div className="dashboard-panel divide-y divide-dashboard-border rounded-2xl">
						{Array.from({ length: 3 }).map((_, index) => (
							<div key={index} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
								<div className="space-y-2">
									<Skeleton className="h-5 w-36 bg-black/10" />
									<Skeleton className="h-4 w-28 bg-black/10" />
								</div>
								<Skeleton className="h-6 w-20 rounded-full bg-black/10" />
							</div>
						))}
					</div>
				) : null}
				{!loading && stats.recentBookings.length === 0 ? (
					<div className="dashboard-panel rounded-2xl px-5 py-8 text-center">
						<p className="font-serif text-2xl">No bookings yet</p>
						<p className="mt-2 text-sm text-[#1A1A1A]/55">Activity will show up when guests reserve your properties.</p>
					</div>
				) : null}
				{!loading && stats.recentBookings.length > 0 ? (
					<div className="dashboard-panel divide-y divide-dashboard-border rounded-2xl">
						{stats.recentBookings.map((booking) => (
							<div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
								<div>
									<p className="font-medium">{booking.guest_name}</p>
									<p className="text-sm text-[#1A1A1A]/55">
										{booking.start_date} – {booking.end_date}
									</p>
									<p className="text-sm text-[#1A1A1A]/45">{booking.property_title}</p>
								</div>
								<span className="rounded-full bg-camel/10 px-3 py-1 text-xs capitalize text-camel">
									{booking.status}
								</span>
							</div>
						))}
					</div>
				) : null}
			</section>

			<section className="space-y-5">
				<h2 className="font-serif text-2xl">Quick actions</h2>
				<div className="flex flex-wrap gap-3">
					{quickActions.map((action) => (
						<Link key={action.href} href={action.href}>
							<Button type="button" variant="quickAction">
								{action.label}
							</Button>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
