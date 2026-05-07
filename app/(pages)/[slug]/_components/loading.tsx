import { Skeleton } from '@/components/ui';

export default function PublicPropertyLoading() {
	return (
		<div className="min-h-screen bg-[#f4f2ee] px-4 py-5 sm:px-8">
			<div className="mx-auto max-w-[1440px] space-y-8">
				<Skeleton className="h-16 w-full rounded-2xl bg-black/10" />

				<div className="grid gap-4 lg:grid-cols-12">
					<Skeleton className="h-80 w-full rounded-2xl bg-black/10 lg:col-span-8" />
					<div className="space-y-4 lg:col-span-4">
						<Skeleton className="h-38 w-full rounded-2xl bg-black/10" />
						<Skeleton className="h-38 w-full rounded-2xl bg-black/10" />
					</div>
				</div>

				<div className="grid gap-8 lg:grid-cols-[1fr_380px]">
					<div className="space-y-6">
						<Skeleton className="h-10 w-2/3 bg-black/10" />
						<Skeleton className="h-4 w-full bg-black/10" />
						<Skeleton className="h-4 w-10/12 bg-black/10" />
						<Skeleton className="h-56 w-full rounded-2xl bg-black/10" />
					</div>
					<Skeleton className="h-96 w-full rounded-2xl bg-black/10" />
				</div>
			</div>
		</div>
	);
}
