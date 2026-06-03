import { Skeleton } from '@/components/ui';

export default function DashboardLoading() {
	return (
		<div className="min-h-screen bg-dashboard-bg text-espresso">
			<div className="flex w-full">
				<aside className="fixed inset-y-0 left-0 hidden w-[250px] border-r border-black/5 bg-dashboard-bg px-3 py-6 md:block">
					<Skeleton className="mx-2 h-12 w-24 bg-black/10" />
					<div className="mt-8 space-y-2">
						{Array.from({ length: 7 }).map((_, index) => (
							<Skeleton key={index} className="h-10 w-full rounded-xl bg-black/10" />
						))}
					</div>
				</aside>

				<div className="min-w-0 w-full md:ml-[250px]">
					<header className="flex min-h-16 items-center justify-between gap-3 px-5 py-2 md:px-10">
						<Skeleton className="h-9 w-64 bg-black/10" />
						<Skeleton className="h-10 w-28 rounded-full bg-black/10" />
					</header>

					<main className="px-5 pb-14 pt-2 md:px-10">
						<div className="mx-auto w-full space-y-8">
							<div className="space-y-3">
								<Skeleton className="h-4 w-32 bg-black/10" />
								<Skeleton className="h-10 w-72 bg-black/10" />
							</div>

							<div className="grid gap-6 md:grid-cols-3">
								<Skeleton className="h-32 w-full rounded-2xl bg-black/10" />
								<Skeleton className="h-32 w-full rounded-2xl bg-black/10" />
								<Skeleton className="h-32 w-full rounded-2xl bg-black/10" />
							</div>

							<Skeleton className="h-64 w-full rounded-2xl bg-black/10" />
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}
