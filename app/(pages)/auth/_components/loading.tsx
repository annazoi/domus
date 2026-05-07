import { Skeleton } from '@/components/ui';

export default function AuthLoading() {
	return (
		<div className="min-h-screen bg-stone-50 antialiased md:flex-row">
			<div className="flex min-h-screen flex-col md:flex-row">
				<div className="hidden flex-1 bg-stone-900/95 md:block" />

				<div className="flex flex-1 items-center justify-center px-8 py-12 sm:px-16 lg:px-32">
					<div className="w-full max-w-md space-y-6">
						<div className="space-y-3">
							<Skeleton className="h-10 w-44 bg-stone-200" />
							<Skeleton className="h-4 w-60 bg-stone-200" />
						</div>

						<div className="space-y-4">
							<Skeleton className="h-14 w-full bg-stone-200" />
							<Skeleton className="h-14 w-full bg-stone-200" />
							<Skeleton className="h-14 w-full bg-stone-200" />
						</div>

						<Skeleton className="h-12 w-full rounded-full bg-stone-300/80" />
						<Skeleton className="mx-auto h-4 w-48 bg-stone-200" />
					</div>
				</div>
			</div>
		</div>
	);
}
