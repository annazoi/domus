import { Button } from '@/components/ui';
import { PageHeader } from '@/app/(pages)/dashboard/_components/page-header';

const plans = [
	{
		name: 'Essential',
		price: '$29/mo',
		description: 'For one premium property.',
		features: ['Direct bookings', 'Custom domain', 'Basic analytics'],
		current: false,
	},
	{
		name: 'Portfolio',
		price: '$79/mo',
		description: 'For multi-property hosts.',
		features: ['Up to 10 properties', 'Revenue reports', 'Priority support'],
		current: true,
	},
];

export default function SubscriptionPage() {
	return (
		<div className="space-y-8">
			<PageHeader eyebrow="Subscription" title="Your plan and billing" />

			<div className="grid gap-5 md:grid-cols-2">
				{plans.map((plan) => (
					<div
						key={plan.name}
						className={[
							'dashboard-panel rounded-2xl p-6',
							plan.current ? 'ring-1 ring-camel/35' : 'ring-1 ring-black/5',
						].join(' ')}
					>
						<div className="flex items-start justify-between">
							<div>
								<p className="font-serif text-3xl">{plan.name}</p>
								<p className="mt-1 text-sm text-espresso/55">{plan.description}</p>
							</div>
							{plan.current ? (
								<span className="rounded-full bg-camel/12 px-3 py-1 text-xs text-camel">Current</span>
							) : null}
						</div>

						<p className="mt-5 font-serif text-4xl">{plan.price}</p>
						<ul className="mt-5 space-y-2 text-sm text-espresso/70">
							{plan.features.map((feature) => (
								<li key={feature}>- {feature}</li>
							))}
						</ul>

						<Button
							type="button"
							variant={plan.current ? 'subscriptionInactive' : 'primarySm'}
							className="mt-6"
							disabled={plan.current}
						>
							{plan.current ? 'Current plan' : 'Switch plan'}
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
