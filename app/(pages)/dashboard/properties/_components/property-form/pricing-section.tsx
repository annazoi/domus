'use client';

import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { DateTime } from 'luxon';
import { DayPicker, type DateRange } from 'react-day-picker';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Button, Checkbox, ConfirmationDialog, Input, cn, useToast } from '@/components/ui';
import { useUpdateProperty } from '@/features/property/hooks/use-property';
import {
	propertyAvailabilityQueryKey,
	useClearPropertyAvailability,
	usePropertyAvailability,
	useUpsertPropertyAvailability,
} from '@/features/property-availability/hooks/use-property-availability';
import { AvailabilityStatus, type AvailabilityStatus as AvailabilityStatusType } from '@/features/property-availability/interfaces/property-availability.interface';
import type { Property, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { toApiDate } from '@/features/property-availability/utils/date';
import { PROPERTY_FORM_DEFAULT_VALUES } from './constants';
import { PropertyFormSection } from './property-form-section';
import { pricingFormSchema, type PricingFormValues } from './schemas';
import { mergeAvailabilityRowsInCache } from './utils/availability-cache';

type PricingSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	propertyId?: string;
};

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
type RangeEntry = { id: string; value?: DateRange };

export function PricingSection({ initialProperty, propertyId: propertyIdProp }: PricingSectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const queryClient = useQueryClient();
	const { push } = useToast();
	const { mutateAsync: update, isPending: saving } = useUpdateProperty(propertyId);
	const defaultValues: UpsertPropertyInput = initialProperty ? { ...initialProperty } : PROPERTY_FORM_DEFAULT_VALUES;
	const {
		handleSubmit,
	} = useForm<PricingFormValues>({
		resolver: zodResolver(pricingFormSchema),
		defaultValues: {},
	});
	const [viewMonth, setViewMonth] = useState(() => DateTime.utc().startOf('month'));
	const [modalOpen, setModalOpen] = useState(false);
	const [ranges, setRanges] = useState<RangeEntry[]>([{ id: 'range-1' }]);
	const [activeRangeId, setActiveRangeId] = useState<string | null>(null);
	const [singleDayDate, setSingleDayDate] = useState<string | null>(null);
	const [singleDayPrice, setSingleDayPrice] = useState('');
	const [singleDayAvailable, setSingleDayAvailable] = useState(true);
	const [singleDayReason, setSingleDayReason] = useState<AvailabilityStatusType | ''>('');
	const [confirmClearOpen, setConfirmClearOpen] = useState(false);
	const monthStart = viewMonth.startOf('month');
	const monthEndExclusive = viewMonth.endOf('month').startOf('day').plus({ days: 1 });
	const { data: availabilityRows = [] } = usePropertyAvailability(
		propertyId,
		monthStart.toISODate() ?? undefined,
		monthEndExclusive.toISODate() ?? undefined,
	);
	const { mutateAsync: upsertAvailability, isPending: applyingAvailability } = useUpsertPropertyAvailability(propertyId);
	const { mutateAsync: clearAllAvailability, isPending: clearingAvailability } = useClearPropertyAvailability(propertyId);

	const availabilityMap = useMemo(
		() => new Map(availabilityRows.map((row) => [row.date, row])),
		[availabilityRows],
	);
	const [rangePrice, setRangePrice] = useState('');
	const [isAvailable, setIsAvailable] = useState(true);
	const [reason, setReason] = useState<AvailabilityStatusType | ''>('');

	const handleSave = handleSubmit(async (formValues) => {
		const payload: UpsertPropertyInput = { ...defaultValues, ...formValues };

		if (!propertyId) {
			push({ title: 'Save Basic info first to create the property.', tone: 'error' });
			return;
		}
		try {
			await update(payload);
			push({ title: 'Saved.', tone: 'success' });
		} catch (submitError) {
			push({ title: submitError instanceof Error ? submitError.message : 'Could not save.', tone: 'error' });
		}
	});

	const closeModal = () => {
		setModalOpen(false);
		setActiveRangeId(null);
	};

	const { days, label } = useMemo(() => {
		const first = viewMonth.startOf('month');
		const startPad = first.weekday % 7;
		const totalDays = first.daysInMonth;
		const cells: (DateTime | null)[] = [...Array(startPad).fill(null)];
		for (let day = 1; day <= totalDays; day++) {
			cells.push(first.set({ day }));
		}
		while (cells.length % 7 !== 0) {
			cells.push(null);
		}
		return {
			days: cells,
			label: first.toFormat('LLLL yyyy'),
		};
	}, [viewMonth]);

	const disabledDates = useMemo(
		() =>
			availabilityRows.filter((row) => row.is_available === false).map((row) => toUtcJsDate(row.date)),
		[availabilityRows],
	);

	const handleApplySingleDay = async () => {
		if (!singleDayDate || !propertyId) return;

		const nightlyPrice = Number(singleDayPrice);
		if (Number.isNaN(nightlyPrice) || nightlyPrice < 0) {
			push({ title: 'Price must be a non-negative number.', tone: 'error' });
			return;
		}

		const dayStart = DateTime.fromISO(singleDayDate, { zone: 'utc' }).startOf('day');
		const dayEnd = dayStart.plus({ days: 1 });

		try {
			const rows = await upsertAvailability({
				start: toApiDate(dayStart),
				end: toApiDate(dayEnd),
				price: nightlyPrice,
				is_available: singleDayAvailable,
				reason: singleDayAvailable ? null : singleDayReason || null,
			});
			mergeAvailabilityRowsInCache({
				queryClient,
				propertyId,
				start: monthStart.toISODate() ?? undefined,
				end: monthEndExclusive.toISODate() ?? undefined,
				rows,
			});
			push({ title: `Updated ${dayStart.toFormat('MMM d, yyyy')}.`, tone: 'success' });
		} catch (submitError) {
			push({
				title: submitError instanceof Error ? submitError.message : 'Could not update availability.',
				tone: 'error',
			});
		}
	};

	const handleApplyRanges = async () => {
		if (!propertyId) return;

		const completeRanges = ranges
			.map((item) => ({ id: item.id, from: item.value?.from, to: item.value?.to }))
			.filter((item) => item.from || item.to);
		if (!completeRanges.length) {
			push({ title: 'Select at least one date range.', tone: 'error' });
			return;
		}
		if (completeRanges.some((item) => !item.from || !item.to)) {
			push({ title: 'Complete all date ranges before applying.', tone: 'error' });
			return;
		}

		const nightlyPrice = Number(rangePrice);
		if (Number.isNaN(nightlyPrice) || nightlyPrice < 0) {
			push({ title: 'Price must be a non-negative number.', tone: 'error' });
			return;
		}

		for (const rangeItem of completeRanges) {
			const from = DateTime.fromJSDate(rangeItem.from!, { zone: 'utc' }).startOf('day');
			const checkout = DateTime.fromJSDate(rangeItem.to!, { zone: 'utc' }).plus({ days: 1 }).startOf('day');
			for (let cursor = from; cursor < checkout; cursor = cursor.plus({ days: 1 })) {
				const existing = availabilityMap.get(toApiDate(cursor));
				if (existing && !existing.is_available) {
					push({ title: 'One of the ranges includes unavailable dates.', tone: 'error' });
					return;
				}
			}
		}

		try {
			await Promise.all(
				completeRanges.map(async (rangeItem) => {
					const from = DateTime.fromJSDate(rangeItem.from!, { zone: 'utc' }).startOf('day');
					const checkout = DateTime.fromJSDate(rangeItem.to!, { zone: 'utc' }).plus({ days: 1 }).startOf('day');
					const rows = await upsertAvailability({
						start: toApiDate(from),
						end: toApiDate(checkout),
						price: nightlyPrice,
						is_available: isAvailable,
						reason: isAvailable ? null : reason || null,
					});
					mergeAvailabilityRowsInCache({
						queryClient,
						propertyId,
						start: monthStart.toISODate() ?? undefined,
						end: monthEndExclusive.toISODate() ?? undefined,
						rows,
					});
				}),
			);
			push({ title: 'Availability updated for selected ranges.', tone: 'success' });
			closeModal();
		} catch (submitError) {
			push({
				title: submitError instanceof Error ? submitError.message : 'Could not update availability.',
				tone: 'error',
			});
		}
	};

	const handleClearAllAvailability = async () => {
		if (!propertyId) return;

		try {
			await clearAllAvailability();
			queryClient.setQueryData(
				propertyAvailabilityQueryKey.all(
					propertyId,
					monthStart.toISODate() ?? undefined,
					monthEndExclusive.toISODate() ?? undefined,
				),
				[],
			);
			setSingleDayDate(null);
			setSingleDayPrice('');
			setSingleDayAvailable(true);
			setSingleDayReason('');
			push({ title: 'All availability was removed.', tone: 'success' });
		} catch (submitError) {
			push({
				title: submitError instanceof Error ? submitError.message : 'Could not remove availability.',
				tone: 'error',
			});
		}
	};

	const requestClearAllAvailability = () => {
		if (!propertyId || clearingAvailability) return;
		setConfirmClearOpen(true);
	};

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
							onClick={() => setViewMonth((month) => month.minus({ months: 1 }))}
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
							onClick={() => setViewMonth((month) => month.plus({ months: 1 }))}
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
								<DayCell
									key={i}
									day={day}
									selected={singleDayDate === toApiDate(day)}
									availability={availabilityMap.get(toApiDate(day))}
									onClick={() => {
										const iso = toApiDate(day);
										const existing = availabilityMap.get(iso);
										setSingleDayDate(iso);
										setSingleDayPrice(existing ? String(existing.price) : '');
										setSingleDayAvailable(existing?.is_available ?? true);
										setSingleDayReason(existing?.reason ?? '');
									}}
								/>
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
						disabled={!propertyId}
					>
						Set dates &amp; price
					</Button>
					<Button
						type="button"
						variant="secondary"
						className="w-full shrink-0 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
						onClick={requestClearAllAvailability}
						disabled={!propertyId || clearingAvailability}
					>
						{clearingAvailability ? 'Removing...' : 'Remove all availability'}
					</Button>
					<div className="rounded-2xl border border-black/8 bg-white/75 p-4">
						<p className="text-sm font-medium text-[#1A1A1A]">Single day edit</p>
						<p className="mt-1 text-xs text-[#1A1A1A]/60">
							Click any date on the calendar, then update that day here.
						</p>
						<p className="mt-2 text-sm text-[#1A1A1A]/70">
							{singleDayDate ? DateTime.fromISO(singleDayDate, { zone: 'utc' }).toFormat('MMM d, yyyy') : 'No date selected'}
						</p>
						<Input
							type="number"
							min={0}
							step={0.01}
							placeholder="Nightly price"
							value={singleDayPrice}
							onChange={(e) => setSingleDayPrice(e.target.value)}
							className="mt-2"
							disabled={!singleDayDate}
						/>
						<label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-black/8 px-3 py-2">
							<Checkbox
								checked={singleDayAvailable}
								onChange={(e) => setSingleDayAvailable(e.target.checked)}
								disabled={!singleDayDate}
							/>
							<span className="text-sm text-[#1A1A1A]">Available for booking</span>
						</label>
						<select
							value={singleDayReason}
							onChange={(e) => setSingleDayReason(e.target.value as AvailabilityStatusType | '')}
							className="mt-2 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
							disabled={!singleDayDate || singleDayAvailable}
						>
							<option value="">None</option>
							<option value={AvailabilityStatus.BLOCKED}>Blocked</option>
							<option value={AvailabilityStatus.MAINTENANCE}>Maintenance</option>
							<option value={AvailabilityStatus.BOOKED}>Booked</option>
						</select>
						<Button
							type="button"
							variant="primarySm"
							className="mt-3 w-full"
							disabled={!singleDayDate || applyingAvailability}
							onClick={() => void handleApplySingleDay()}
						>
							{applyingAvailability ? 'Applying...' : 'Apply day'}
						</Button>
					</div>
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
							{ranges.map((rangeItem, index) => (
								<div key={rangeItem.id} className="relative">
									<label className="block text-sm text-[#1A1A1A]/70">
										Date range {index + 1}
										<Input
											variant="compact"
											readOnly
											value={formatRangeLabel(rangeItem.value)}
											placeholder="Select dates"
											onClick={() =>
												setActiveRangeId((current) => (current === rangeItem.id ? null : rangeItem.id))
											}
											className="mt-1.5 cursor-pointer"
											aria-expanded={activeRangeId === rangeItem.id}
											aria-haspopup="dialog"
										/>
									</label>
									{index === 0 ? (
										<Button
											type="button"
											variant="ghostPill"
											className="mt-2 h-8 px-3"
											onClick={() =>
												setRanges((previous) => [...previous, { id: `range-${previous.length + 1}` }])
											}
										>
											<Plus className="mr-1 h-4 w-4" />
											Add another range
										</Button>
									) : null}
									{activeRangeId === rangeItem.id ? (
										<div
											className="absolute left-0 right-0 top-full z-[70] mt-2 w-full rounded-xl border border-black/10 bg-white p-3 shadow-xl [--rdp-accent-color:#1A1A1A] [--rdp-accent-background-color:rgba(26,26,26,0.08)] [&_.rdp-month]:w-full [&_.rdp-month_grid]:w-full [&_.rdp-day]:transition-[background,background-color] [&_.rdp-day]:duration-200 [&_.rdp-day]:ease-out [&_.rdp-day_button]:transition-[color,background-color,border-color,transform,box-shadow] [&_.rdp-day_button]:duration-200 [&_.rdp-day_button]:ease-out [&_.rdp-day_button]:active:scale-[0.94]"
										>
											<DayPicker
												mode="range"
												min={1}
												excludeDisabled
												disabled={disabledDates}
												selected={rangeItem.value}
												onSelect={(nextRange) =>
													setRanges((previous) =>
														previous.map((item) =>
															item.id === rangeItem.id ? { ...item, value: nextRange } : item,
														),
													)
												}
												className="w-full"
											/>
											<div className="mt-3 flex justify-end border-t border-black/8 pt-3">
												<Button
													type="button"
													variant="primarySm"
													disabled={!rangeItem.value?.from || !rangeItem.value?.to}
													onClick={() => setActiveRangeId(null)}
												>
													OK
												</Button>
											</div>
										</div>
									) : null}
								</div>
							))}
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
							<label className="block text-sm text-[#1A1A1A]/70">
								Reason (when unavailable)
								<select
									value={reason}
									onChange={(e) => setReason(e.target.value as AvailabilityStatusType | '')}
									className="mt-1.5 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
								>
									<option value="">None</option>
									<option value={AvailabilityStatus.BLOCKED}>Blocked</option>
									<option value={AvailabilityStatus.MAINTENANCE}>Maintenance</option>
									<option value={AvailabilityStatus.BOOKED}>Booked</option>
								</select>
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
								disabled={applyingAvailability}
								onClick={() => void handleApplyRanges()}
							>
								{applyingAvailability ? 'Applying...' : 'Apply'}
							</Button>
						</div>
					</div>
				</div>
			) : null}
			<ConfirmationDialog
				open={confirmClearOpen}
				title="Remove all availability?"
				description="This will delete all prices and availability days for this property. This action cannot be undone."
				confirmLabel="Remove all"
				cancelLabel="Keep data"
				confirmVariant="danger"
				loading={clearingAvailability}
				onCancel={() => setConfirmClearOpen(false)}
				onConfirm={() => {
					void handleClearAllAvailability().finally(() => {
						setConfirmClearOpen(false);
					});
				}}
			/>
			<div className="mt-2 flex justify-end border-t border-black/5 pt-5">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</PropertyFormSection>
	);
}

function toUtcJsDate(date: string) {
	return DateTime.fromISO(date, { zone: 'utc' }).toJSDate();
}

function formatRangeLabel(range: DateRange | undefined) {
	if (!range?.from) return '';
	const from = DateTime.fromJSDate(range.from, { zone: 'utc' });
	if (!range.to) return `${from.toFormat('MMM d, yyyy')} - ...`;
	const to = DateTime.fromJSDate(range.to, { zone: 'utc' });
	return `${from.toFormat('MMM d, yyyy')} - ${to.toFormat('MMM d, yyyy')}`;
}

type DayCellProps = {
	day: DateTime;
	selected: boolean;
	availability: { is_available: boolean; price: number; reason: AvailabilityStatusType | null } | undefined;
	onClick: () => void;
};

function DayCell({ day, selected, availability, onClick }: DayCellProps) {
	const stateClass = !availability
		? 'border-black/5 bg-white text-[#1A1A1A]/70 hover:border-[#6B705C]/30'
		: availability.is_available
			? 'border-emerald-200 bg-emerald-50 text-emerald-900'
			: 'border-red-200 bg-red-50 text-red-800';

	return (
		<Button
			type="button"
			variant="custom"
			onClick={onClick}
			className={cn(
				'h-16 rounded-xl border text-sm transition-all duration-200 ease-out active:scale-[0.98]',
				stateClass,
				selected ? 'ring-2 ring-[#6B705C]/40' : '',
			)}
		>
			<div className="flex w-full flex-col items-center gap-1">
				<span>{day.day}</span>
				{availability?.is_available ? (
					<span className="text-[11px] font-medium">${availability.price.toFixed(0)}</span>
				) : availability ? (
					<span className="text-[10px] uppercase tracking-wide">{availability.reason ?? 'UNAVAILABLE'}</span>
				) : null}
			</div>
		</Button>
	);
}
