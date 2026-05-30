'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { useStripeConnectOnboarding, useStripeConnectStatus } from '@/features/stripe/hooks/use-stripe-connect';

export default function PaymentsContent() {
	const params = useSearchParams();
	const { data: status, isLoading, isError, refetch } = useStripeConnectStatus();
	const { mutate: startOnboarding, isPending } = useStripeConnectOnboarding();

	useEffect(() => {
		if (params.get('stripe') === 'return' || params.get('stripe') === 'refresh') {
			void refetch();
		}
	}, [params, refetch]);

	const ready = status?.stripe_onboarding_completed && status.charges_enabled && status.payouts_enabled;

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Payments</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Stripe payouts</h1>
				<p className="mt-3 max-w-2xl text-sm text-[#1A1A1A]/65">
					Connect your Stripe Express account to receive payouts when guests book your properties. Domus
					automatically deducts the platform commission at checkout.
				</p>
			</div>

			<section className="space-y-5 rounded-2xl bg-white/80 p-6">
				{isLoading ? <p className="text-sm text-[#1A1A1A]/55">Loading payout status…</p> : null}
				{isError ? <p className="text-sm text-red-600">Could not load Stripe status.</p> : null}

				{status ? (
					<div className="grid gap-3 text-sm sm:grid-cols-2">
						<div className="flex justify-between gap-3 rounded-xl bg-[#f7f5f2] px-4 py-3">
							<span className="text-[#1A1A1A]/65">Account</span>
							<span className="font-medium text-[#1A1A1A]">{status.stripe_account_id ?? 'Not connected'}</span>
						</div>
						<div className="flex justify-between gap-3 rounded-xl bg-[#f7f5f2] px-4 py-3">
							<span className="text-[#1A1A1A]/65">Details submitted</span>
							<span className="font-medium text-[#1A1A1A]">{status.details_submitted ? 'Yes' : 'No'}</span>
						</div>
						<div className="flex justify-between gap-3 rounded-xl bg-[#f7f5f2] px-4 py-3">
							<span className="text-[#1A1A1A]/65">Charges enabled</span>
							<span className="font-medium text-[#1A1A1A]">{status.charges_enabled ? 'Yes' : 'No'}</span>
						</div>
						<div className="flex justify-between gap-3 rounded-xl bg-[#f7f5f2] px-4 py-3">
							<span className="text-[#1A1A1A]/65">Payouts enabled</span>
							<span className="font-medium text-[#1A1A1A]">{status.payouts_enabled ? 'Yes' : 'No'}</span>
						</div>
					</div>
				) : null}

				{ready ? (
					<p className="text-sm text-emerald-700">Your Stripe account is connected and ready to receive payouts.</p>
				) : (
					<Button
						type="button"
						variant="primarySm"
						disabled={isPending || isLoading}
						onClick={() => startOnboarding()}
					>
						{isPending ? 'Redirecting…' : status?.stripe_account_id ? 'Continue Stripe setup' : 'Connect with Stripe'}
					</Button>
				)}
			</section>
		</div>
	);
}
