import { Skeleton } from '@/components/ui';
import '../auth-shell.css';

export default function AuthLoading() {
	return (
		<main className="login-page">
			<aside className="login-aside hidden md:block">
				<div className="absolute inset-0 animate-pulse bg-espresso/10" />
			</aside>

			<section className="login-form">
				<div className="login-card w-full max-w-md space-y-6">
					<div className="space-y-3">
						<Skeleton className="h-10 w-44 bg-black/10" />
						<Skeleton className="h-4 w-60 bg-black/8" />
					</div>

					<div className="space-y-4">
						<Skeleton className="h-12 w-full rounded-xl bg-black/8" />
						<Skeleton className="h-12 w-full rounded-xl bg-black/8" />
						<Skeleton className="h-12 w-full rounded-xl bg-black/8" />
					</div>

					<Skeleton className="h-12 w-full rounded-full bg-camel/25" />
					<Skeleton className="mx-auto h-4 w-48 bg-black/8" />
				</div>
			</section>
		</main>
	);
}
