import { Skeleton } from '@/components/ui';

export default function TemplatePreviewLoading() {
	return (
		<div className="min-h-screen bg-neutral-100 px-4 py-6 sm:px-8">
			<div className="mx-auto max-w-7xl space-y-8">
				<div className="grid gap-4 sm:grid-cols-12">
					<Skeleton className="h-72 w-full rounded-2xl bg-black/10 sm:col-span-7" />
					<div className="space-y-4 sm:col-span-5">
						<Skeleton className="h-34 w-full rounded-2xl bg-black/10" />
						<Skeleton className="h-34 w-full rounded-2xl bg-black/10" />
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-[1fr_380px]">
					<div className="space-y-5">
						<Skeleton className="h-8 w-64 bg-black/10" />
						<Skeleton className="h-4 w-full bg-black/10" />
						<Skeleton className="h-4 w-11/12 bg-black/10" />
						<Skeleton className="h-56 w-full rounded-2xl bg-black/10" />
					</div>
					<Skeleton className="h-80 w-full rounded-2xl bg-black/10" />
				</div>
			</div>
		</div>
	);
}
