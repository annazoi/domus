export default function WebsiteBuilderPage() {
	return (
		<div className="space-y-10">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Website Builder</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Your digital storefront</h1>
			</div>

			<section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
				<div className="rounded-2xl bg-white/80 p-6">
					<p className="text-sm text-[#1A1A1A]/55">Current website preview</p>
					<div className="mt-4 h-64 rounded-xl bg-gradient-to-br from-[#6B705C]/15 to-white" />
					<button
						type="button"
						className="cursor-pointer mt-5 rounded-full bg-[#1A1A1A] px-5 py-2.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-[#1A1A1A]/90"
					>
						Edit Website
					</button>
				</div>

				<div className="rounded-2xl bg-white/80 p-6">
					<p className="font-serif text-2xl">Builder options</p>
					<div className="mt-5 space-y-3">
						<button type="button" className="w-full cursor-pointer rounded-xl border border-black/10 px-4 py-3 text-left text-sm hover:border-[#6B705C]/40">
							Change theme
						</button>
						<button type="button" className="w-full cursor-pointer rounded-xl border border-black/10 px-4 py-3 text-left text-sm hover:border-[#6B705C]/40">
							Update branding
						</button>
						<button type="button" className="w-full cursor-pointer rounded-xl border border-black/10 px-4 py-3 text-left text-sm hover:border-[#6B705C]/40">
							Manage sections
						</button>
					</div>
				</div>
			</section>
		</div>
	);
}
