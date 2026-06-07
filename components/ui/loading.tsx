import { Skeleton } from '@/components/ui';

export default function RootLoading() {
	return (
		<div className="min-h-screen bg-cream">
			<div className="fixed left-0 top-0 z-40 flex w-full items-center justify-between px-8 py-6">
				<Skeleton className="h-10 w-20 rounded-full bg-camel/15" />
				<div className="hidden gap-4 md:flex">
					<Skeleton className="h-4 w-20 bg-camel/15" />
					<Skeleton className="h-4 w-20 bg-camel/15" />
					<Skeleton className="h-4 w-20 bg-camel/15" />
				</div>
				<Skeleton className="h-10 w-24 rounded-full bg-camel/15" />
			</div>

			<div className="mx-auto max-w-7xl space-y-14 px-6 pb-16 pt-28">
				<Skeleton className="h-[55vh] w-full rounded-3xl bg-camel/12" />

				<div className="grid gap-6 md:grid-cols-3">
					<Skeleton className="h-40 w-full rounded-2xl bg-camel/10" />
					<Skeleton className="h-40 w-full rounded-2xl bg-camel/10" />
					<Skeleton className="h-40 w-full rounded-2xl bg-camel/10" />
				</div>

				<div className="grid gap-6 lg:grid-cols-12">
					<Skeleton className="h-80 w-full rounded-2xl bg-camel/10 lg:col-span-7" />
					<Skeleton className="h-80 w-full rounded-2xl bg-camel/10 lg:col-span-5" />
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<Skeleton className="h-96 w-full rounded-2xl bg-camel/10" />
					<Skeleton className="h-96 w-full rounded-2xl bg-camel/10" />
				</div>
			</div>
		</div>
	);
}
