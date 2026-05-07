import { Skeleton } from '@/components/ui';

export default function PropertyEditorLoading() {
	return (
		<div className="space-y-8">
			<div className="space-y-3">
				<Skeleton className="h-4 w-40 bg-black/10" />
				<Skeleton className="h-10 w-96 max-w-full bg-black/10" />
			</div>

			<div className="grid gap-6 xl:grid-cols-[1fr_320px]">
				<div className="space-y-6">
					<Skeleton className="h-56 w-full rounded-2xl bg-black/10" />
					<Skeleton className="h-56 w-full rounded-2xl bg-black/10" />
					<Skeleton className="h-56 w-full rounded-2xl bg-black/10" />
				</div>
				<Skeleton className="h-80 w-full rounded-2xl bg-black/10" />
			</div>
		</div>
	);
}
