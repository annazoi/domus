import { Button } from '@/components/ui';

const recentBookings = [
	{ guest: 'Amelia Ford', dates: 'Apr 19 - Apr 24', status: 'Confirmed' },
	{ guest: 'Luca Moretti', dates: 'Apr 25 - Apr 28', status: 'Pending' },
	{ guest: 'Nora Kim', dates: 'May 02 - May 08', status: 'Confirmed' },
];

const quickActions = ['Add new property', 'Edit website', 'View bookings'];

export default function DashboardOverviewPage() {
	return (
		<div className="space-y-16">
			<section className="space-y-3">
				<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Overview</p>
				<h1 className="font-serif text-4xl tracking-tight md:text-5xl">A calm view of your business.</h1>
			</section>

			<section className="grid gap-10 md:grid-cols-3">
				<div>
					<p className="text-sm text-[#1A1A1A]/55">Total bookings</p>
					<p className="mt-2 font-serif text-5xl">128</p>
				</div>
				<div>
					<p className="text-sm text-[#1A1A1A]/55">Revenue this month</p>
					<p className="mt-2 font-serif text-5xl">$24,860</p>
				</div>
				<div>
					<p className="text-sm text-[#1A1A1A]/55">Occupancy rate</p>
					<p className="mt-2 font-serif text-5xl">82%</p>
				</div>
			</section>

			<section className="space-y-5">
				<h2 className="font-serif text-2xl">Recent activity</h2>
				<div className="divide-y divide-black/5 rounded-2xl bg-white/70">
					{recentBookings.map((booking) => (
						<div key={booking.guest} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
							<div>
								<p className="font-medium">{booking.guest}</p>
								<p className="text-sm text-[#1A1A1A]/55">{booking.dates}</p>
							</div>
							<span className="rounded-full bg-[#6B705C]/10 px-3 py-1 text-xs text-[#6B705C]">{booking.status}</span>
						</div>
					))}
				</div>
			</section>

			<section className="space-y-5">
				<h2 className="font-serif text-2xl">Quick actions</h2>
				<div className="flex flex-wrap gap-3">
					{quickActions.map((action) => (
						<Button key={action} type="button" variant="quickAction">
							{action}
						</Button>
					))}
				</div>
			</section>
		</div>
	);
}
