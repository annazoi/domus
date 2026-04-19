import { Button } from '@/components/ui';

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
					<Button type="button" variant="primarySm" className="mt-5">
						Edit Website
					</Button>
				</div>

				<div className="rounded-2xl bg-white/80 p-6">
					<p className="font-serif text-2xl">Builder options</p>
					<div className="mt-5 space-y-3">
						<Button type="button" variant="cardRow">
							Change theme
						</Button>
						<Button type="button" variant="cardRow">
							Update branding
						</Button>
						<Button type="button" variant="cardRow">
							Manage sections
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
