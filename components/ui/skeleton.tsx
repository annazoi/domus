import { cn } from './cn';

type SkeletonProps = {
	className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
	return <div className={cn('animate-pulse rounded-md bg-black/10', className)} aria-hidden />;
}
