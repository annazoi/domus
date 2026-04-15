const bookings = [
	{
		guest: 'Sophie Martin',
		property: 'Villa Azure',
		dates: 'Apr 20 - Apr 24',
		status: 'Confirmed',
		payment: 'Paid',
	},
	{
		guest: 'Ethan Gray',
		property: 'Maison Cedre',
		dates: 'Apr 25 - Apr 29',
		status: 'Pending',
		payment: 'Pending',
	},
	{
		guest: 'Mia Rossi',
		property: 'Ridge House',
		dates: 'May 03 - May 05',
		status: 'Cancelled',
		payment: 'Refunded',
	},
];

export default function BookingsPage() {
	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Bookings</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Reservation flow</h1>
			</div>

			<div className="overflow-hidden rounded-2xl bg-white/80">
				<div className="hidden grid-cols-5 gap-4 border-b border-black/5 px-5 py-3 text-xs uppercase tracking-wide text-[#1A1A1A]/45 md:grid">
					<span>Guest</span>
					<span>Property</span>
					<span>Dates</span>
					<span>Status</span>
					<span>Payment</span>
				</div>
				{bookings.map((booking) => (
					<button
						type="button"
						key={`${booking.guest}-${booking.dates}`}
						className="grid w-full grid-cols-1 gap-2 border-b border-black/5 px-5 py-4 text-left transition hover:bg-black/[0.02] md:grid-cols-5 md:gap-4"
					>
						<span className="font-medium">{booking.guest}</span>
						<span className="text-sm text-[#1A1A1A]/65">{booking.property}</span>
						<span className="text-sm text-[#1A1A1A]/65">{booking.dates}</span>
						<span className="text-sm">{booking.status}</span>
						<span className="text-sm text-[#6B705C]">{booking.payment}</span>
					</button>
				))}
			</div>
		</div>
	);
}
