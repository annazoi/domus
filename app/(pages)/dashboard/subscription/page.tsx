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
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Subscription</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Your plan and billing</h1>
			</div>

			<div className="grid gap-5 md:grid-cols-2">
				{plans.map((plan) => (
					<div
						key={plan.name}
						className={[
							'rounded-2xl bg-white/85 p-6',
							plan.current ? 'ring-1 ring-[#6B705C]/35' : 'ring-1 ring-black/5',
						].join(' ')}
					>
						<div className="flex items-start justify-between">
							<div>
								<p className="font-serif text-3xl">{plan.name}</p>
								<p className="mt-1 text-sm text-[#1A1A1A]/55">{plan.description}</p>
							</div>
							{plan.current ? (
								<span className="rounded-full bg-[#6B705C]/12 px-3 py-1 text-xs text-[#6B705C]">Current</span>
							) : null}
						</div>

						<p className="mt-5 font-serif text-4xl">{plan.price}</p>
						<ul className="mt-5 space-y-2 text-sm text-[#1A1A1A]/70">
							{plan.features.map((feature) => (
								<li key={feature}>- {feature}</li>
							))}
						</ul>

						<button
							type="button"
							className={[
								'mt-6 rounded-full px-5 py-2.5 text-sm transition cursor-pointer',
								plan.current
									? 'bg-black/5 text-[#1A1A1A]/50'
									: 'bg-[#1A1A1A] text-white hover:-translate-y-0.5 hover:bg-[#1A1A1A]/90',
							].join(' ')}
							disabled={plan.current}
						>
							{plan.current ? 'Current plan' : 'Switch plan'}
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
