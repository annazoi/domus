const transactions = [
	{ id: 'BK-2301', guest: 'Amelia Ford', amount: '$1,420', date: 'Apr 11' },
	{ id: 'BK-2294', guest: 'Luca Moretti', amount: '$980', date: 'Apr 09' },
	{ id: 'BK-2287', guest: 'Nora Kim', amount: '$1,760', date: 'Apr 06' },
];

const bars = [45, 58, 40, 67, 71, 62, 74];

export default function EarningsPage() {
	return (
		<div className="space-y-10">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Earnings</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Revenue in focus</h1>
			</div>

			<section className="rounded-2xl bg-white/80 p-6">
				<p className="text-sm text-[#1A1A1A]/55">Monthly earnings summary</p>
				<p className="mt-2 font-serif text-5xl">$24,860</p>

				<div className="mt-8 flex h-40 items-end gap-3">
					{bars.map((height, index) => (
						<div key={index} className="flex flex-1 flex-col items-center gap-2">
							<div
								className="w-full rounded-t-lg bg-[#6B705C]/30 transition hover:bg-[#6B705C]/45"
								style={{ height: `${height}%` }}
							/>
							<span className="text-xs text-[#1A1A1A]/45">W{index + 1}</span>
						</div>
					))}
				</div>
			</section>

			<section className="space-y-3">
				<h2 className="font-serif text-2xl">Recent transactions</h2>
				<div className="rounded-2xl bg-white/80">
					{transactions.map((tx) => (
						<div key={tx.id} className="flex items-center justify-between border-b border-black/5 px-5 py-4 last:border-b-0">
							<div>
								<p className="font-medium">{tx.guest}</p>
								<p className="text-sm text-[#1A1A1A]/55">
									{tx.id} - {tx.date}
								</p>
							</div>
							<p className="font-medium text-[#6B705C]">{tx.amount}</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
