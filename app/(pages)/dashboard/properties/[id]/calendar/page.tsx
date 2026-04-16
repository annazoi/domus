'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import type { AvailabilityDay } from '@/features/property/interfaces/property.interface';
import { listAvailability, upsertAvailability } from '@/features/property/services/property.services';

const toDate = (day: number) => `2026-04-${String(day).padStart(2, '0')}`;

export default function PropertyCalendarPage() {
	const params = useParams<{ id: string }>();
	const [days, setDays] = useState<AvailabilityDay[]>([]);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [customPrice, setCustomPrice] = useState('');
	const [message, setMessage] = useState('');

	useEffect(() => {
		void (async () => {
			const result = await listAvailability(params.id);
			setDays(result);
		})();
	}, [params.id]);

	const dayMap = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);

	const saveDay = async (isAvailable: boolean) => {
		if (!selectedDate) return;
		try {
			const result = await upsertAvailability(
				params.id,
				selectedDate,
				isAvailable,
				customPrice.trim() ? Number(customPrice) : null,
			);
			setDays((previous) => {
				const next = previous.filter((item) => item.date !== selectedDate);
				next.push(result);
				return next;
			});
			setMessage('Availability saved.');
		} catch (error) {
			setMessage(error instanceof Error ? error.message : 'Could not update availability.');
		}
	};

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Availability</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Property calendar</h1>
			</div>

			<div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
				<div className="rounded-2xl bg-white/80 p-5">
					<div className="mb-4 grid grid-cols-7 text-center text-xs text-[#1A1A1A]/45">
						{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name) => (
							<div key={name}>{name}</div>
						))}
					</div>
					<div className="grid grid-cols-7 gap-2">
						{Array.from({ length: 30 }, (_, index) => index + 1).map((day) => {
							const date = toDate(day);
							const item = dayMap.get(date);
							const unavailable = item?.isAvailable === false;
							return (
								<button
									key={date}
									type="button"
									onClick={() => {
										setSelectedDate(date);
										setCustomPrice(item?.customPrice ? String(item.customPrice) : '');
										setMessage('');
									}}
									className={[
										'h-14 rounded-xl border text-sm',
										selectedDate === date
											? 'border-[#6B705C] bg-[#6B705C]/10'
											: unavailable
												? 'border-red-200 bg-red-50 text-red-700'
												: 'border-black/10 bg-white hover:border-[#6B705C]/40',
									].join(' ')}
								>
									{day}
								</button>
							);
						})}
					</div>
				</div>

				<div className="space-y-4 rounded-2xl bg-white/80 p-5">
					<h2 className="font-serif text-2xl">Date settings</h2>
					<p className="text-sm text-[#1A1A1A]/60">
						{selectedDate ? `Selected: ${selectedDate}` : 'Select a date to update availability.'}
					</p>
					<input
						value={customPrice}
						onChange={(event) => setCustomPrice(event.target.value)}
						placeholder="Custom price"
						className="w-full rounded-xl border border-black/10 px-4 py-3"
					/>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => void saveDay(true)}
							className="rounded-full border border-black/10 px-4 py-2 text-sm"
						>
							Set available
						</button>
						<button
							type="button"
							onClick={() => void saveDay(false)}
							className="rounded-full border border-black/10 px-4 py-2 text-sm"
						>
							Block date
						</button>
					</div>
					{message ? <p className="text-sm text-[#6B705C]">{message}</p> : null}
				</div>
			</div>
		</div>
	);
}
