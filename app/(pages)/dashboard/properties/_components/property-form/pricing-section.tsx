'use client';

import { useCallback, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { DayPicker, type DateRange } from 'react-day-picker';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button, Checkbox, Input } from '@/components/ui';
import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type PricingSectionProps = {
	form: UpsertPropertyInput;
	onNumberChange: (field: 'cleaning_fee', value: number) => void;
};

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfMonth(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
	return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function PricingSection({ form, onNumberChange }: PricingSectionProps) {
	const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
	const [modalOpen, setModalOpen] = useState(false);
	const [range, setRange] = useState<DateRange | undefined>();
	const rangeLabel = useMemo(() => {
		if (!range?.from) return '';
		if (!range.to) return `${format(range.from, 'MMM d, yyyy')} – …`;
		return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`;
	}, [range]);
	const [rangePrice, setRangePrice] = useState('');
	const [isAvailable, setIsAvailable] = useState(true);
	const [calOpen, setCalOpen] = useState(false);

	const closeModal = useCallback(() => {
		setModalOpen(false);
		setCalOpen(false);
	}, []);

	const { days, label } = useMemo(() => {
		const first = startOfMonth(viewMonth);
		const year = first.getFullYear();
		const month = first.getMonth();
		const lastDay = new Date(year, month + 1, 0).getDate();
		const startPad = first.getDay();
		const cells: (number | null)[] = [...Array(startPad).fill(null)];
		for (let d = 1; d <= lastDay; d++) cells.push(d);
		while (cells.length % 7 !== 0) cells.push(null);
		return {
			days: cells,
			label: first.toLocaleString('default', { month: 'long', year: 'numeric' }),
		};
	}, [viewMonth]);

	return (
		<PropertyFormSection id="pricing-availability" title="Pricing & availability">
			<p className="text-sm text-[#1A1A1A]/65">
				Nightly rates are set per day on the property calendar.
			</p>

			<div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
				<div className="rounded-2xl bg-white/75 p-5">
					<div className="mb-5 flex items-center justify-between gap-3 border-b border-black/5 pb-4">
						<Button
							type="button"
							variant="iconSquare"
							onClick={() => setViewMonth((m) => addMonths(m, -1))}
							aria-label="Previous month"
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<p className="min-w-0 flex-1 text-center font-serif text-lg tracking-tight text-[#1A1A1A]">
							{label}
						</p>
						<Button
							type="button"
							variant="iconSquare"
							onClick={() => setViewMonth((m) => addMonths(m, 1))}
							aria-label="Next month"
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>

					<div className="grid grid-cols-7 gap-2 text-center text-xs text-[#1A1A1A]/50">
						{weekdays.map((w) => (
							<div key={w} className="py-2">
								{w}
							</div>
						))}
					</div>
					<div className="grid grid-cols-7 gap-2">
						{days.map((day, i) =>
							day ? (
								<Button
									key={i}
									type="button"
									variant="custom"
									className="h-16 rounded-xl border border-black/5 bg-white text-sm text-[#1A1A1A]/70 transition-all duration-200 ease-out hover:border-[#6B705C]/30 active:scale-[0.98]"
								>
									{day}
								</Button>
							) : (
								<div key={i} className="h-16" aria-hidden />
							),
						)}
					</div>
				</div>

				<div className="flex w-full flex-col gap-5 md:max-w-[260px]">
					<Button
						type="button"
						variant="secondary"
						className="w-full shrink-0"
						onClick={() => setModalOpen(true)}
					>
						Set dates &amp; price
					</Button>
					
				</div>
			</div>

			{modalOpen ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					role="presentation"
					onClick={closeModal}
				>
					<div className="absolute inset-0 bg-black/45" aria-hidden />
					<div
						role="dialog"
						aria-modal
						aria-labelledby="availability-range-title"
						className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="mb-6 flex items-start justify-between gap-4">
							<h3 id="availability-range-title" className="font-serif text-xl text-[#1A1A1A]">
								Availability &amp; pricing
							</h3>
							<Button
								type="button"
								variant="ghostIcon"
								onClick={closeModal}
								className="rounded-full text-[#1A1A1A]/60 hover:bg-black/5"
								aria-label="Close"
							>
								<X className="h-5 w-5" />
							</Button>
						</div>

						<div className="space-y-4">
							<div className="relative">
								<label className="block text-sm text-[#1A1A1A]/70">
									Date range
									<Input
										variant="compact"
										readOnly
										value={rangeLabel}
										placeholder="Select dates"
										onClick={() => setCalOpen((o) => !o)}
										className="mt-1.5 cursor-pointer"
										aria-expanded={calOpen}
										aria-haspopup="dialog"
									/>
								</label>
								{calOpen ? (
									<div
										className="absolute left-0 right-0 top-full z-[70] mt-2 w-full rounded-xl border border-black/10 bg-white p-3 shadow-xl [--rdp-accent-color:#1A1A1A] [--rdp-accent-background-color:rgba(26,26,26,0.08)] [&_.rdp-month]:w-full [&_.rdp-month_grid]:w-full [&_.rdp-day]:transition-[background,background-color] [&_.rdp-day]:duration-200 [&_.rdp-day]:ease-out [&_.rdp-day_button]:transition-[color,background-color,border-color,transform,box-shadow] [&_.rdp-day_button]:duration-200 [&_.rdp-day_button]:ease-out [&_.rdp-day_button]:active:scale-[0.94]"
									>
										<DayPicker
											mode="range"
											min={1}
											selected={range}
											onSelect={setRange}
											className="w-full"
										/>
										<div className="mt-3 flex justify-end border-t border-black/8 pt-3">
											<Button
												type="button"
												variant="primarySm"
												disabled={!range?.from || !range?.to}
												onClick={() => setCalOpen(false)}
											>
												OK
											</Button>
										</div>
									</div>
								) : null}
							</div>
							<label className="block text-sm text-[#1A1A1A]/70">
								Price for this range (per night)
								<Input
									type="number"
									min={0}
									step={0.01}
									placeholder="0.00"
									value={rangePrice}
									onChange={(e) => setRangePrice(e.target.value)}
									className="mt-1.5"
								/>
							</label>
							<label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/8 px-4 py-3">
								<Checkbox checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
								<span className="text-sm text-[#1A1A1A]">Available for booking</span>
							</label>
						</div>

						<div className="mt-8 flex justify-end gap-3">
							<Button type="button" variant="ghostPill" onClick={closeModal}>
								Cancel
							</Button>
							<Button
								type="button"
								variant="primary"
								className="opacity-90"
								disabled={!range?.from || !range?.to}
							>
								Apply
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</PropertyFormSection>
	);
}
