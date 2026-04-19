import { Button, cn } from '@/components/ui';

const days = Array.from({ length: 30 }, (_, index) => index + 1);
const booked = new Set([2, 3, 8, 9, 15, 16, 21, 22, 23]);

export default function CalendarPage() {
	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Calendar</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">April availability</h1>
			</div>

			<div className="rounded-2xl bg-white/75 p-5">
				<div className="grid grid-cols-7 gap-2 text-center text-xs text-[#1A1A1A]/50">
					{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
						<div key={day} className="py-2">
							{day}
						</div>
					))}
				</div>
				<div className="grid grid-cols-7 gap-2">
					{days.map((day) => {
						const isBooked = booked.has(day);
						return (
							<Button
								type="button"
								key={day}
								variant="custom"
								className={cn(
									'h-16 rounded-xl border text-sm transition',
									isBooked
										? 'border-[#6B705C]/25 bg-[#6B705C]/10 text-[#6B705C]'
										: 'border-black/5 bg-white text-[#1A1A1A]/70 hover:border-[#6B705C]/30',
								)}
							>
								{day}
							</Button>
						);
					})}
				</div>
			</div>

			<div className="rounded-2xl bg-white/75 p-5">
				<h2 className="font-serif text-2xl">Booking details</h2>
				<p className="mt-3 text-sm text-[#1A1A1A]/60">
					Select a booked date to view reservation details for that day.
				</p>
			</div>
		</div>
	);
}
