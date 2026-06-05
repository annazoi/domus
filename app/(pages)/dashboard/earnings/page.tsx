'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn, Skeleton } from '@/components/ui';
import { DashboardPagination } from '@/app/(pages)/dashboard/_components/dashboard-pagination';
import { useBookings, useEarningsTransactionsPage } from '@/features/bookings/hooks/use-bookings';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { RecentTransactionsTable, RecentTransactionsTableSkeleton } from '../_components/recent-transactions-table';
import {
	computeEarningsStats,
	mapBookingToEarningsTransaction,
} from '../_utils/compute-earnings-stats';
import { MonthlyEarningsChart } from './_components/monthly-earnings-chart';

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

export default function EarningsPage() {
	const [page, setPage] = useState(1);
	const { data: bookings = [], isLoading: statsLoading } = useBookings();
	const { data: transactionsData, isLoading: transactionsLoading, isFetching } = useEarningsTransactionsPage(page, PAGE_SIZE);
	const stats = computeEarningsStats(bookings);

	const transactions = useMemo(
		() => (transactionsData?.items ?? []).map(mapBookingToEarningsTransaction),
		[transactionsData?.items],
	);
	const pagination = transactionsData?.pagination;
	const total = pagination?.total ?? 0;
	const loadingTransactions = transactionsLoading;

	useEffect(() => {
		if (!pagination || page <= pagination.totalPages) return;
		setPage(pagination.totalPages);
	}, [page, pagination]);

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
						{statsLoading ? (
							<Skeleton className="mt-2 h-4 w-28 bg-black/10" />
						) : (
							<p className="mt-1 text-xs uppercase tracking-[0.18em] text-camel/80">{stats.monthLabel}</p>
						)}
					</div>
					{statsLoading ? (
						<Skeleton className="mt-3 h-14 w-40 bg-black/10 sm:mt-0" />
					) : (
						<p className="mt-3 font-serif text-5xl tracking-tight sm:mt-0">{stats.monthlyRevenueFormatted}</p>
					)}
				</div>

				<MonthlyEarningsChart bars={stats.weeklyBars} loading={statsLoading} />
			</section>

			<section className="space-y-3">
				<h2 className="font-serif text-2xl">Recent transactions</h2>
				{loadingTransactions ? <RecentTransactionsTableSkeleton rows={PAGE_SIZE} /> : null}
				{!loadingTransactions && total === 0 ? (
					<div className="dashboard-panel rounded-2xl p-8 text-center">
						<p className="font-serif text-2xl">No transactions yet</p>
						<p className="mt-2 text-sm text-espresso/60">Earnings appear when guests complete bookings.</p>
					</div>
				) : null}
				{!loadingTransactions && total > 0 ? (
					<div className="dashboard-panel overflow-hidden rounded-2xl">
						<div className={cn('transition-opacity', isFetching && 'pointer-events-none opacity-50')}>
							<RecentTransactionsTable transactions={transactions} embedded />
						</div>
						{pagination ? (
							<DashboardPagination
								page={pagination.page}
								pageSize={pagination.pageSize}
								total={pagination.total}
								onPageChange={setPage}
								itemLabel="transactions"
							/>
						) : null}
					</div>
				) : null}
			</section>
		</div>
	);
}
