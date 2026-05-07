import { Skeleton } from '@/components/ui';

export default function LegacyPropertyRedirectLoading() {
	return (
		<div className="flex min-h-[40vh] items-center justify-center bg-stone-50">
			<Skeleton className="h-10 w-72 rounded-full bg-stone-200" />
		</div>
	);
}
