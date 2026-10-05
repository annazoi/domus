'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CalendarDays, CircleUser, Home, Percent, Plus, ReceiptText, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { BookingDetailModal } from '@/app/(pages)/dashboard/bookings/_components/booking-detail-modal';
import { BookingsTable, BookingsTableSkeleton } from '@/app/(pages)/dashboard/bookings/_components/bookings-table';
import { useBookings } from '@/features/bookings/hooks/use-bookings';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';
import { useProperties } from '@/features/property/hooks/use-property';
import { useAuthStore } from '@/store/auth';
import {
	computeOverviewStats,
	formatOverviewCurrency,
	formatOverviewPercent,
} from './_utils/compute-overview-stats';

const quickActions = [
	{ label: 'Add a property', hint: 'Create a new listing', href: '/dashboard/properties/new', icon: Plus },
	{ label: 'Manage bookings', hint: 'Review reservations', href: '/dashboard/bookings', icon: ReceiptText },
	{ label: 'Open calendar', hint: 'See what is coming up', href: '/dashboard/calendar', icon: CalendarDays },
	{ label: 'Edit profile', hint: 'Keep details current', href: '/dashboard/profile', icon: CircleUser },
] as const;

function greeting() {
	const hour = new Date().getHours();
	if (hour < 12) return 'Good morning';
	if (hour < 18) return 'Good afternoon';
	return 'Good evening';
}

export default function DashboardOverviewPage() {
	const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
	const { data: properties = [], isLoading: propertiesLoading } = useProperties();
	const firstName = useAuthStore((state) => state.first_name);
	const [selected, setSelected] = useState<HostBookingDetail | null>(null);

	const loading = bookingsLoading || propertiesLoading;
	const stats = computeOverviewStats(bookings, properties.length);
	const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

	const statCards = [
		{
			label: 'Total bookings',
			value: String(stats.totalBookings),
			note: `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} live`,
			icon: Home,
		},
		{
			label: 'Revenue this month',
			value: formatOverviewCurrency(stats.revenueThisMonth),
			note: 'Confirmed stays',
			icon: Wallet,
		},
		{
			label: 'Occupancy rate',
			value: formatOverviewPercent(stats.occupancyRate),
			note: 'Across all properties',
			icon: Percent,
		},
	];

	return (
		<div className="space-y-8">
			<section className="relative overflow-hidden rounded-3xl bg-[#231d17] px-6 py-8 text-[#fffdf9] sm:px-10 sm:py-10">
				<span
					aria-hidden
					className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[#d4a853]/30"
				/>
				<span
					aria-hidden
					className="pointer-events-none absolute -right-4 -top-12 h-48 w-48 rounded-full border border-[#d4a853]/20"
				/>
				<div className="relative max-w-xl">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4a853]">{today}</p>
					<h1 className="mt-3 font-serif !text-[2.25rem] leading-tight tracking-tight text-[#fffdf9]">
						{greeting()}
						{firstName ? `, ${firstName}` : ''}.
					</h1>
					<p className="mt-3 text-sm leading-relaxed text-[#fffdf9]/70">
						{loading
							? 'Loading your portfolio…'
							: `You have ${properties.length} ${properties.length === 1 ? 'property' : 'properties'} and ${stats.totalBookings} ${stats.totalBookings === 1 ? 'booking' : 'bookings'} on record.`}
					</p>
					<div className="mt-6 flex flex-wrap gap-3">
						<Link
							href="/dashboard/properties/new"
							className="inline-flex items-center gap-2 rounded-full bg-[#d4a853] px-5 py-2.5 text-sm font-semibold text-[#231d17] transition hover:bg-[#e0b866]"
						>
							<Plus className="h-4 w-4" />
							Add property
						</Link>
						<Link
							href="/dashboard/bookings"
							className="inline-flex items-center gap-2 rounded-full border border-[#fffdf9]/25 px-5 py-2.5 text-sm font-medium text-[#fffdf9] transition hover:border-[#fffdf9]/60"
						>
							View bookings
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-3">
				{loading
					? Array.from({ length: 3 }).map((_, index) => (
							<div key={index} className="dashboard-panel rounded-2xl p-5">
								<Skeleton className="h-4 w-32 bg-black/10" />
								<Skeleton className="mt-4 h-9 w-24 bg-black/10" />
							</div>
						))
					: statCards.map((card) => (
							<div key={card.label} className="dashboard-panel rounded-2xl p-5">
								<div className="flex items-center justify-between gap-3">
									<p className="text-xs font-semibold uppercase tracking-[0.12em] text-dashboard-muted">{card.label}</p>
									<span className="grid h-9 w-9 place-items-center rounded-xl bg-camel/12 text-camel">
										<card.icon className="h-[18px] w-[18px]" />
									</span>
								</div>
								<p className="mt-4 font-serif text-4xl tabular-nums tracking-tight">{card.value}</p>
								<p className="mt-1.5 text-xs text-dashboard-muted">{card.note}</p>
							</div>
						))}
			</section>

			<div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
				<section className="min-w-0 space-y-4">
					<div className="flex items-center justify-between gap-3">
						<h2 className="font-serif text-2xl">Recent activity</h2>
						<Link
							href="/dashboard/bookings"
							className="inline-flex items-center gap-1 text-sm font-medium text-camel-deep transition hover:gap-2"
						>
							All bookings
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
					{loading ? <BookingsTableSkeleton rows={3} /> : null}
					{!loading && stats.recentBookings.length === 0 ? (
						<div className="dashboard-panel rounded-2xl px-5 py-12 text-center">
							<span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-camel/12 text-camel">
								<ReceiptText className="h-5 w-5" />
							</span>
							<p className="mt-4 font-serif text-2xl">No bookings yet</p>
							<p className="mt-2 text-sm text-dashboard-muted">
								Activity will show up when guests reserve your properties.
							</p>
						</div>
					) : null}
					{!loading && stats.recentBookings.length > 0 ? (
						<BookingsTable bookings={stats.recentBookings} onSelect={setSelected} />
					) : null}
				</section>

				<section className="space-y-4">
					<h2 className="font-serif text-2xl">Quick actions</h2>
					<div className="grid gap-3">
						{quickActions.map((action) => (
							<Link
								key={action.href}
								href={action.href}
								className="dashboard-panel group flex items-center gap-4 rounded-2xl p-4"
							>
								<span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-camel/12 text-camel transition group-hover:bg-camel group-hover:text-white">
									<action.icon className="h-[18px] w-[18px]" />
								</span>
								<span className="min-w-0 flex-1">
									<span className="block text-sm font-semibold text-espresso">{action.label}</span>
									<span className="block text-xs text-dashboard-muted">{action.hint}</span>
								</span>
								<ArrowRight className="h-4 w-4 text-dashboard-muted transition group-hover:translate-x-0.5 group-hover:text-camel" />
							</Link>
						))}
					</div>
				</section>
			</div>

			<BookingDetailModal
				open={selected !== null}
				booking={selected}
				onClose={() => setSelected(null)}
				onUpdated={setSelected}
			/>
		</div>
	);
}
