'use client';

import { Skeleton } from '@/components/ui';
import { useBookings } from '@/features/bookings/hooks/use-bookings';
import { computeEarningsStats } from '../_utils/compute-earnings-stats';
import { MonthlyEarningsChart } from './_components/monthly-earnings-chart';

export default function EarningsPage() {
	const { data: bookings = [], isLoading: loading } = useBookings();
	const stats = computeEarningsStats(bookings);

	return (
		<div className="space-y-10">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Earnings</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Revenue in focus</h1>
			</div>

			<section className="relative dashboard-panel overflow-hidden rounded-2xl p-6 md:p-8">
				<div
					className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-camel/[0.08] blur-3xl"
					aria-hidden
				/>

				<div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-sm text-espresso/55">Monthly earnings summary</p>
						{loading ? (
							<Skeleton className="mt-2 h-4 w-28 bg-black/10" />
						) : (
							<p className="mt-1 text-xs uppercase tracking-[0.18em] text-camel/80">{stats.monthLabel}</p>
						)}
					</div>
					{loading ? (
						<Skeleton className="mt-3 h-14 w-40 bg-black/10 sm:mt-0" />
					) : (
						<p className="mt-3 font-serif text-5xl tracking-tight sm:mt-0">{stats.monthlyRevenueFormatted}</p>
					)}
				</div>

				<MonthlyEarningsChart bars={stats.weeklyBars} loading={loading} />
			</section>

			<section className="space-y-3">
				<h2 className="font-serif text-2xl">Recent transactions</h2>
				{loading ? (
					<div className="dashboard-panel rounded-2xl">
						{Array.from({ length: 3 }).map((_, index) => (
							<div
								key={index}
								className="flex items-center justify-between border-b border-dashboard-border px-5 py-4 last:border-b-0"
							>
								<div className="space-y-2">
									<Skeleton className="h-5 w-32 bg-black/10" />
									<Skeleton className="h-4 w-24 bg-black/10" />
								</div>
								<Skeleton className="h-5 w-16 bg-black/10" />
							</div>
						))}
					</div>
				) : null}
				{!loading && stats.recentTransactions.length === 0 ? (
					<div className="dashboard-panel rounded-2xl p-8 text-center">
						<p className="font-serif text-2xl">No transactions yet</p>
						<p className="mt-2 text-sm text-espresso/60">Earnings appear when guests complete bookings.</p>
					</div>
				) : null}
				{!loading && stats.recentTransactions.length > 0 ? (
					<div className="dashboard-panel rounded-2xl">
						{stats.recentTransactions.map((tx) => (
							<div key={tx.bookingId} className="flex items-center justify-between border-b border-dashboard-border px-5 py-4 last:border-b-0">
								<div>
									<p className="font-medium">{tx.guest}</p>
									<p className="text-sm text-espresso/55">
										{tx.id} - {tx.date}
									</p>
								</div>
								<p className="font-medium text-camel">{tx.amount}</p>
							</div>
						))}
					</div>
				) : null}
			</section>
		</div>
	);
}
