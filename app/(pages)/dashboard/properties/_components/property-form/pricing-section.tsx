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
import {
	AvailabilityStatus,
	type AvailabilityDay,
	type AvailabilityStatus as AvailabilityStatusType,
} from '@/features/property-availability/interfaces/property-availability.interface';
import type { Property, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { toApiDate } from '@/features/property-availability/utils/date';
import { PROPERTY_FORM_DEFAULT_VALUES } from './constants';
import { PropertyFormSection, dashboardFormFields } from './property-form-section';
import { pricingFormSchema, type PricingFormValues } from './schemas';
import { mergeAvailabilityRowsInCache } from './utils/availability-cache';
import './availability-day-picker.css';

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
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<PricingFormValues>({
		resolver: zodResolver(pricingFormSchema),
		defaultValues: {
			minimum_advance_reservation_hours: defaultValues.minimum_advance_reservation_hours,
			minimum_rental_period_nights: defaultValues.minimum_rental_period_nights,
			maximum_rental_period_nights: defaultValues.maximum_rental_period_nights,
		},
	});
	const today = useMemo(() => DateTime.utc().startOf('day'), []);
	const currentMonthStart = useMemo(() => today.startOf('month'), [today]);
	const [viewMonth, setViewMonth] = useState(() => DateTime.utc().startOf('month'));
	const isAtCurrentMonth = viewMonth.toMillis() <= currentMonthStart.toMillis();
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
	const modalRangeEnd = useMemo(() => today.plus({ months: 24 }), [today]);
	const { data: availabilityRows = [] } = usePropertyAvailability(
		propertyId,
		monthStart.toISODate() ?? undefined,
		monthEndExclusive.toISODate() ?? undefined,
	);
	const { data: savedAvailabilityRows = [] } = usePropertyAvailability(
		propertyId,
		today.toISODate() ?? undefined,
		modalRangeEnd.toISODate() ?? undefined,
		modalOpen,
	);
	const { mutateAsync: upsertAvailability, isPending: applyingAvailability } = useUpsertPropertyAvailability(propertyId);
	const { mutateAsync: clearAllAvailability, isPending: clearingAvailability } = useClearPropertyAvailability(propertyId);

	const availabilityMap = useMemo(
		() => new Map(availabilityRows.map((row) => [row.date, row])),
		[availabilityRows],
	);
	const selectedDayRow = singleDayDate ? availabilityMap.get(singleDayDate) : undefined;
	const hasExistingDay = Boolean(selectedDayRow);
	const [rangePrice, setRangePrice] = useState('');
	const [isAvailable, setIsAvailable] = useState(true);
	const [reason, setReason] = useState<AvailabilityStatusType | ''>('');
	const selectedRanges = useMemo(
		() =>
			ranges
				.map((item) => ({ id: item.id, from: item.value?.from, to: item.value?.to }))
				.filter((item) => item.from || item.to),
		[ranges],
	);
	const hasIncompleteRanges = selectedRanges.some((item) => !item.from || !item.to);
	const hasSelectedRangeOverlap = useMemo(() => {
		const completeRanges = selectedRanges
			.filter((item): item is { id: string; from: Date; to: Date } => Boolean(item.from && item.to))
			.map((item) => ({
				start: fromPickerDate(item.from),
				endExclusive: fromPickerDate(item.to).plus({ days: 1 }),
			}))
			.sort((a, b) => a.start.toMillis() - b.start.toMillis());
		for (let i = 1; i < completeRanges.length; i++) {
			if (completeRanges[i].start < completeRanges[i - 1].endExclusive) return true;
		}
		return false;
	}, [selectedRanges]);
	const hasOverlapWithSavedAvailability = useMemo(
		() => selectedRangesOverlapSavedDates(selectedRanges, savedAvailabilityRows),
		[selectedRanges, savedAvailabilityRows],
	);
	const rangePriceValue = Number(rangePrice);
	const invalidRangePrice = Number.isNaN(rangePriceValue) || rangePriceValue < 0;
	const disableApplyRanges =
		applyingAvailability ||
		!selectedRanges.length ||
		hasIncompleteRanges ||
		invalidRangePrice ||
		hasSelectedRangeOverlap ||
		hasOverlapWithSavedAvailability;

	const handleSave = handleSubmit(async (formValues) => {
		const payload: UpsertPropertyInput = { ...defaultValues, ...formValues };

		if (!propertyId) {
			push({ title: 'Save Basic info first to create the property.', tone: 'error' });
			return;
		}
		try {
			const saved = await update(payload);
			reset({
				minimum_advance_reservation_hours: saved.minimum_advance_reservation_hours,
				minimum_rental_period_nights: saved.minimum_rental_period_nights,
				maximum_rental_period_nights: saved.maximum_rental_period_nights,
			});
			push({ title: 'Saved.', tone: 'success' });
		} catch (submitError) {
			push({ title: submitError instanceof Error ? submitError.message : 'Could not save.', tone: 'error' });
		}
	});

	const resetRangeModalForm = () => {
		setRanges([{ id: 'range-1' }]);
		setActiveRangeId(null);
		setRangePrice('');
		setIsAvailable(true);
		setReason('');
	};

	const openModal = () => {
		resetRangeModalForm();
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		resetRangeModalForm();
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

		if (!selectedRanges.length) {
			push({ title: 'Select at least one date range.', tone: 'error' });
			return;
		}
		if (hasIncompleteRanges) {
			push({ title: 'Complete all date ranges before applying.', tone: 'error' });
			return;
		}

		if (invalidRangePrice) {
			push({ title: 'Price must be a non-negative number.', tone: 'error' });
			return;
		}

		if (hasSelectedRangeOverlap) {
			push({ title: 'Date ranges cannot overlap each other.', tone: 'error' });
			return;
		}

		if (hasOverlapWithSavedAvailability) {
			push({ title: 'Selected dates overlap existing availability. Choose dates that are not already set.', tone: 'error' });
			return;
		}

		try {
			await Promise.all(
				selectedRanges.map(async (rangeItem) => {
					const from = fromPickerDate(rangeItem.from!);
					const checkout = fromPickerDate(rangeItem.to!).plus({ days: 1 });
					const rows = await upsertAvailability({
						start: toApiDate(from),
						end: toApiDate(checkout),
						price: rangePriceValue,
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
			await clearAllAvailability(undefined);
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
			resetRangeModalForm();
			push({ title: 'All availability was removed.', tone: 'success' });
		} catch (submitError) {
			push({
				title: submitError instanceof Error ? submitError.message : 'Could not remove availability.',
				tone: 'error',
			});
		}
	};

	const handleDeleteSingleDay = async () => {
		if (!singleDayDate || !propertyId) return;
		const dayStart = DateTime.fromISO(singleDayDate, { zone: 'utc' }).startOf('day');
		const dayEnd = dayStart.plus({ days: 1 });
		try {
			await clearAllAvailability({
				start: toApiDate(dayStart),
				end: toApiDate(dayEnd),
			});
			queryClient.setQueryData<AvailabilityDay[] | undefined>(
				propertyAvailabilityQueryKey.all(
					propertyId,
					monthStart.toISODate() ?? undefined,
					monthEndExclusive.toISODate() ?? undefined,
				),
				(previous) => (previous ?? []).filter((row) => row.date !== singleDayDate),
			);
			setSingleDayDate(null);
			setSingleDayPrice('');
			setSingleDayAvailable(true);
			setSingleDayReason('');
			push({ title: `Deleted ${dayStart.toFormat('MMM d, yyyy')}.`, tone: 'success' });
		} catch (submitError) {
			push({ title: submitError instanceof Error ? submitError.message : 'Could not delete day.', tone: 'error' });
		}
	};

	const requestClearAllAvailability = () => {
		if (!propertyId || clearingAvailability) return;
		setConfirmClearOpen(true);
	};

	const selectedDayLabel = singleDayDate
		? DateTime.fromISO(singleDayDate, { zone: 'utc' }).toFormat('EEEE, MMM d')
		: null;

	return (
		<PropertyFormSection id="pricing-availability" title="Pricing & availability">
			<p className="max-w-2xl text-sm leading-relaxed text-espresso/60">
				Set booking rules, nightly rates, and availability per day. Select a date on the calendar to edit individually, or apply pricing across a range.
			</p>

			<div className="overflow-hidden rounded-2xl border border-dashboard-border/70 bg-dashboard-surface shadow-[0_1px_0_rgba(26,26,26,0.04)]">
				<div className="border-b border-dashboard-border/60 bg-dashboard-inset/50 px-5 py-3">
					<p className="text-xs font-semibold uppercase tracking-[0.12em] text-espresso/50">Booking rules</p>
				</div>
				<div className="grid gap-5 p-5 md:grid-cols-3">
					<div className="space-y-1.5">
						<label htmlFor="minimum-advance-reservation-hours" className="text-sm font-medium text-espresso">
							Minimum advance reservation
						</label>
						<div className="relative">
							<Input
								id="minimum-advance-reservation-hours"
								type="number"
								min={0}
								step={1}
								placeholder="No minimum"
								className="pr-14"
								{...register('minimum_advance_reservation_hours')}
							/>
							<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium uppercase tracking-[0.1em] text-espresso/40">
								hours
							</span>
						</div>
						<p className="text-xs leading-relaxed text-espresso/45">How far ahead guests must book before check-in.</p>
						{errors.minimum_advance_reservation_hours?.message ? (
							<p className="text-xs text-red-700">{errors.minimum_advance_reservation_hours.message}</p>
						) : null}
					</div>
					<div className="space-y-1.5">
						<label htmlFor="minimum-rental-period-nights" className="text-sm font-medium text-espresso">
							Minimum rental period
						</label>
						<div className="relative">
							<Input
								id="minimum-rental-period-nights"
								type="number"
								min={1}
								step={1}
								placeholder="No minimum"
								className="pr-14"
								{...register('minimum_rental_period_nights')}
							/>
							<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium uppercase tracking-[0.1em] text-espresso/40">
								nights
							</span>
						</div>
						<p className="text-xs leading-relaxed text-espresso/45">Shortest stay guests can book.</p>
						{errors.minimum_rental_period_nights?.message ? (
							<p className="text-xs text-red-700">{errors.minimum_rental_period_nights.message}</p>
						) : null}
					</div>
					<div className="space-y-1.5">
						<label htmlFor="maximum-rental-period-nights" className="text-sm font-medium text-espresso">
							Maximum rental period
						</label>
						<div className="relative">
							<Input
								id="maximum-rental-period-nights"
								type="number"
								min={1}
								step={1}
								placeholder="No maximum"
								className="pr-14"
								{...register('maximum_rental_period_nights')}
							/>
							<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium uppercase tracking-[0.1em] text-espresso/40">
								nights
							</span>
						</div>
						<p className="text-xs leading-relaxed text-espresso/45">Longest stay guests can book.</p>
						{errors.maximum_rental_period_nights?.message ? (
							<p className="text-xs text-red-700">{errors.maximum_rental_period_nights.message}</p>
						) : null}
					</div>
				</div>
			</div>

			<div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start">
				<div className="overflow-hidden rounded-2xl border border-dashboard-border/70 bg-dashboard-surface shadow-[0_1px_0_rgba(26,26,26,0.04)]">
					<div className="flex items-center justify-between gap-3 border-b border-dashboard-border/60 px-5 py-4">
						<Button
							type="button"
							variant="iconSquare"
							onClick={() => setViewMonth((month) => month.minus({ months: 1 }))}
							disabled={isAtCurrentMonth}
							aria-label="Previous month"
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<div className="min-w-0 flex-1 text-center">
							<p className="font-serif text-xl tracking-tight text-espresso">{label}</p>
							<p className="mt-0.5 text-xs font-medium uppercase tracking-[0.14em] text-espresso/45">
								Property calendar
							</p>
						</div>
						<Button
							type="button"
							variant="iconSquare"
							onClick={() => setViewMonth((month) => month.plus({ months: 1 }))}
							aria-label="Next month"
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>

					<div className="px-4 pb-5 pt-4 sm:px-5">
						<div className="mb-2 grid grid-cols-7 gap-1.5">
							{weekdays.map((w) => (
								<div
									key={w}
									className="py-1.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-espresso/45"
								>
									{w}
								</div>
							))}
						</div>
						<div className="grid grid-cols-7 gap-1.5">
							{days.map((day, i) =>
								day ? (
									<DayCell
										key={i}
										day={day}
										today={day.hasSame(today, 'day')}
										selected={singleDayDate === toApiDate(day)}
										availability={availabilityMap.get(toApiDate(day))}
										isPast={day < today}
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
									<div key={i} className="h-[4.5rem]" aria-hidden />
								),
							)}
						</div>
						<CalendarLegend />
					</div>
				</div>

				<div className="flex flex-col gap-4 lg:sticky lg:top-24">
					<div className="overflow-hidden rounded-2xl border border-dashboard-border/70 bg-dashboard-surface shadow-[0_1px_0_rgba(26,26,26,0.04)]">
						<div className="border-b border-dashboard-border/60 bg-dashboard-inset/50 px-4 py-3">
							<p className="text-xs font-semibold uppercase tracking-[0.12em] text-espresso/50">Bulk actions</p>
						</div>
						<div className="space-y-2 p-4">
							<Button
								type="button"
								variant="secondary"
								className="w-full"
								onClick={openModal}
								disabled={!propertyId}
							>
								Set dates &amp; price
							</Button>
							<Button
								type="button"
								variant="secondary"
								className="w-full border-red-300/40 text-red-300 hover:border-red-300/60 hover:bg-red-950/20"
								onClick={requestClearAllAvailability}
								disabled={!propertyId || clearingAvailability}
							>
								{clearingAvailability ? 'Removing…' : 'Clear all availability'}
							</Button>
						</div>
					</div>

					<div className="overflow-hidden rounded-2xl border border-dashboard-border/70 bg-dashboard-surface shadow-[0_1px_0_rgba(26,26,26,0.04)]">
						<div className="border-b border-dashboard-border/60 bg-dashboard-inset/50 px-4 py-3">
							<p className="text-xs font-semibold uppercase tracking-[0.12em] text-espresso/50">Day editor</p>
						</div>
						<div className="p-4">
							{selectedDayLabel ? (
								<div className="rounded-xl border border-camel/25 bg-camel/[0.07] px-3 py-2.5">
									<p className="text-xs font-medium uppercase tracking-[0.12em] text-camel-deep/75">Selected</p>
									<p className="mt-1 font-serif text-base leading-snug text-espresso">{selectedDayLabel}</p>
								</div>
							) : (
								<div className="rounded-xl border border-dashed border-dashboard-border/80 bg-dashboard-inset/40 px-3 py-4 text-center">
									<p className="text-sm text-espresso/45">Select a date on the calendar</p>
								</div>
							)}

							<div className="mt-4 space-y-3">
								<label className="block">
									<span className="text-xs font-medium uppercase tracking-[0.12em] text-espresso/50">
										Nightly rate
									</span>
									<Input
										type="number"
										min={0}
										step={0.01}
										placeholder="0.00"
										value={singleDayPrice}
										onChange={(e) => setSingleDayPrice(e.target.value)}
										className="mt-1.5"
										disabled={!singleDayDate}
									/>
								</label>
								<label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashboard-border/60 bg-dashboard-inset/30 px-3 py-2.5">
									<Checkbox
										checked={singleDayAvailable}
										onChange={(e) => setSingleDayAvailable(e.target.checked)}
										disabled={!singleDayDate}
									/>
									<span className="text-sm text-espresso">Available for booking</span>
								</label>
								<label className="block">
									<span className="text-xs font-medium uppercase tracking-[0.12em] text-espresso/50">
										Unavailable reason
									</span>
									<select
										value={singleDayReason}
										onChange={(e) => setSingleDayReason(e.target.value as AvailabilityStatusType | '')}
										className="mt-1.5 h-10 w-full rounded-xl border border-dashboard-border/60 bg-dashboard-inset/30 px-3 text-sm text-espresso focus:outline-none focus:ring-1 focus:ring-camel/30"
										disabled={!singleDayDate || singleDayAvailable}
									>
										<option value="">None</option>
										<option value={AvailabilityStatus.BLOCKED}>Blocked</option>
										<option value={AvailabilityStatus.MAINTENANCE}>Maintenance</option>
										<option value={AvailabilityStatus.BOOKED}>Booked</option>
									</select>
								</label>
							</div>

							{hasExistingDay ? (
								<div className="mt-4 flex flex-col gap-2 border-t border-dashboard-border/50 pt-4">
									<Button
										type="button"
										variant="primarySm"
										className="w-full"
										disabled={!singleDayDate || applyingAvailability}
										onClick={() => void handleApplySingleDay()}
									>
										{applyingAvailability ? 'Updating…' : 'Update day'}
									</Button>
									<Button
										type="button"
										variant="secondary"
										className="w-full border-red-300/40 text-red-300 hover:bg-red-950/20"
										disabled={!singleDayDate || clearingAvailability}
										onClick={() => void handleDeleteSingleDay()}
									>
										{clearingAvailability ? 'Deleting…' : 'Remove day'}
									</Button>
								</div>
							) : (
								<Button
									type="button"
									variant="primarySm"
									className="mt-4 w-full"
									disabled={!singleDayDate || applyingAvailability}
									onClick={() => void handleApplySingleDay()}
								>
									{applyingAvailability ? 'Applying…' : 'Apply day'}
								</Button>
							)}
						</div>
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
						className={cn(
							'relative z-10 w-full max-w-md rounded-2xl bg-dashboard-panel p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]',
							dashboardFormFields,
						)}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="mb-5 flex items-start justify-between gap-4">
							<h3 id="availability-range-title" className="font-serif text-xl text-espresso">
								Availability &amp; pricing
							</h3>
							<Button type="button" variant="ghostIcon" onClick={closeModal} aria-label="Close">
								<X className="h-5 w-5" />
							</Button>
						</div>

						<div className="space-y-4">
							{ranges.map((rangeItem, index) => (
								<div key={rangeItem.id} className="relative">
									<label className="block text-xs font-medium uppercase tracking-[0.12em] text-dashboard-muted">
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
											className="mt-2 h-8 !px-2 flex items-center gap-1/2"
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
											role="dialog"
											aria-label={`Select date range ${index + 1}`}
											className="availability-day-picker absolute left-0 right-0 top-full z-[70] mt-2 w-full rounded-xl border border-dashboard-border/60 bg-dashboard-bg p-3 shadow-[var(--shadow-dashboard-panel)] [&_.rdp-month]:w-full [&_.rdp-month_grid]:w-full [&_.rdp-day]:transition-[background,background-color] [&_.rdp-day]:duration-200 [&_.rdp-day]:ease-out [&_.rdp-day_button]:transition-[color,background-color,border-color,transform,box-shadow] [&_.rdp-day_button]:duration-200 [&_.rdp-day_button]:ease-out [&_.rdp-day_button]:active:scale-[0.94]"
										>
											<div className="mb-2 flex items-center justify-between gap-2 border-b border-dashboard-border/50 pb-2">
												<p className="text-sm font-medium text-espresso">Select dates</p>
												<Button
													type="button"
													variant="ghostIcon"
													className="h-8 w-8"
													onClick={() => setActiveRangeId(null)}
													aria-label="Close date picker"
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
											<DayPicker
												mode="range"
												min={1}
												excludeDisabled
												disabled={[
													{ before: today.toJSDate() },
													...getDisabledDatesForRangePicker(ranges, rangeItem.id, savedAvailabilityRows),
												]}
												startMonth={today.toJSDate()}
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
											<div className="mt-3 flex items-center justify-between gap-2 border-t border-dashboard-border/50 pt-3">
												<Button
													type="button"
													variant="ghostPill"
													className="h-8 px-3"
													disabled={!rangeItem.value?.from && !rangeItem.value?.to}
													onClick={() =>
														setRanges((previous) =>
															previous.map((item) =>
																item.id === rangeItem.id ? { ...item, value: undefined } : item,
															),
														)
													}
												>
													Clear
												</Button>
												<Button
													type="button"
													variant="primarySm"
													disabled={!rangeItem.value?.from || !rangeItem.value?.to}
													onClick={() => setActiveRangeId(null)}
												>
													Done
												</Button>
											</div>
										</div>
									) : null}
								</div>
							))}
							<label className="block text-xs font-medium uppercase tracking-[0.12em] text-dashboard-muted">
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
							<label className="flex cursor-pointer items-center gap-3 rounded-lg bg-dashboard-bg px-4 py-3">
								<Checkbox checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
								<span className="text-sm text-espresso">Available for booking</span>
							</label>
							<label className="block text-xs font-medium uppercase tracking-[0.12em] text-dashboard-muted">
								Reason (when unavailable)
								<select
									value={reason}
									onChange={(e) => setReason(e.target.value as AvailabilityStatusType | '')}
									className="mt-1.5 h-10 w-full rounded-lg border-0 bg-dashboard-bg px-3 text-sm text-espresso focus:outline-none focus:ring-0"
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
								disabled={disableApplyRanges}
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

function selectedRangesOverlapSavedDates(
	selectedRanges: { from?: Date; to?: Date }[],
	savedRows: AvailabilityDay[],
) {
	if (!savedRows.length) return false;
	const savedDates = new Set(savedRows.map((row) => row.date));
	for (const rangeItem of selectedRanges) {
		if (!rangeItem.from || !rangeItem.to) continue;
		let cursor = fromPickerDate(rangeItem.from);
		const end = fromPickerDate(rangeItem.to);
		while (cursor <= end) {
			if (savedDates.has(toApiDate(cursor))) return true;
			cursor = cursor.plus({ days: 1 });
		}
	}
	return false;
}

function getDisabledDatesForRangePicker(
	allRanges: RangeEntry[],
	currentRangeId: string,
	savedRows: AvailabilityDay[],
) {
	const seen = new Set<number>();
	const dates: Date[] = [];

	const addDate = (date: DateTime) => {
		const jsDate = new Date(date.year, date.month - 1, date.day);
		const key = jsDate.getTime();
		if (seen.has(key)) return;
		seen.add(key);
		dates.push(jsDate);
	};

	for (const item of allRanges) {
		if (item.id === currentRangeId || !item.value?.from || !item.value?.to) continue;
		let cursor = fromPickerDate(item.value.from);
		const end = fromPickerDate(item.value.to);
		while (cursor <= end) {
			addDate(cursor);
			cursor = cursor.plus({ days: 1 });
		}
	}

	for (const row of savedRows) {
		addDate(DateTime.fromISO(row.date, { zone: 'utc' }).startOf('day'));
	}

	return dates;
}

function formatRangeLabel(range: DateRange | undefined) {
	if (!range?.from) return '';
	const from = fromPickerDate(range.from);
	if (!range.to) return `${from.toFormat('MMM d, yyyy')} - ...`;
	const to = fromPickerDate(range.to);
	return `${from.toFormat('MMM d, yyyy')} - ${to.toFormat('MMM d, yyyy')}`;
}

function fromPickerDate(date: Date) {
	return DateTime.fromObject(
		{ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() },
		{ zone: 'utc' },
	).startOf('day');
}

const legendItems = [
	{ key: 'selected', label: 'Selected', swatch: 'border-camel/50 bg-camel/[0.08] ring-1 ring-camel/20' },
	{ key: 'priced', label: 'Priced', swatch: 'border-dashboard-border/70 bg-dashboard-surface' },
	{ key: 'unset', label: 'Unset', swatch: 'border-dashed border-dashboard-border/60 bg-dashboard-inset/50' },
	{ key: 'booked', label: 'Booked', swatch: 'border-dashboard-border bg-dashboard-inset ring-1 ring-espresso/15' },
	{ key: 'blocked', label: 'Blocked', swatch: 'border-red-300/40 bg-red-950/30' },
] as const;

function CalendarLegend() {
	return (
		<div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-dashboard-border/50 pt-4">
			{legendItems.map((item) => (
				<div key={item.key} className="flex items-center gap-2">
					<span className={cn('h-3.5 w-3.5 shrink-0 rounded-[4px] border', item.swatch)} aria-hidden />
					<span className="text-xs text-espresso/55">{item.label}</span>
				</div>
			))}
		</div>
	);
}

type DayCellProps = {
	day: DateTime;
	today: boolean;
	selected: boolean;
	availability: { is_available: boolean; price: number; reason: AvailabilityStatusType | null } | undefined;
	isPast: boolean;
	onClick: () => void;
};

function DayCell({ day, today, selected, availability, isPast, onClick }: DayCellProps) {
	const isBlocked = Boolean(availability && !availability.is_available);
	const isBooked = availability?.reason === AvailabilityStatus.BOOKED;
	const isPriced = Boolean(availability?.is_available);

	const stateClass = isPast
		? 'cursor-not-allowed border-transparent bg-dashboard-bg/60 text-espresso/28'
		: selected
			? 'border-camel/55 bg-camel/[0.08] text-espresso shadow-[inset_0_0_0_1px_rgba(150,131,112,0.18)]'
			: isBlocked && isBooked
				? 'border-dashboard-border/70 bg-dashboard-inset text-espresso/75 hover:border-espresso/20 hover:bg-dashboard-surface'
				: isBlocked
					? 'border-red-300/35 bg-red-950/25 text-red-300 hover:border-red-300/50'
					: isPriced
						? 'border-dashboard-border/65 bg-dashboard-surface text-espresso hover:border-camel/30 hover:bg-dashboard-inset/20'
						: 'border-dashed border-dashboard-border/55 bg-dashboard-inset/35 text-espresso/55 hover:border-camel/25 hover:bg-dashboard-inset/55';

	return (
		<Button
			type="button"
			variant="custom"
			onClick={onClick}
			disabled={isPast}
			className={cn(
				'relative h-[4.5rem] rounded-lg border px-0.5 py-1.5 transition-[border-color,background-color,box-shadow] duration-150',
				stateClass,
				today && !selected && !isPast ? 'ring-1 ring-espresso/12' : '',
			)}
		>
			<div className="flex h-full w-full flex-col items-center justify-between">
				<span
					className={cn(
						'text-sm font-medium tabular-nums leading-none',
						today && !isPast ? 'text-camel-deep' : '',
					)}
				>
					{day.day}
				</span>
				{isPast ? (
					<span className="h-3" />
				) : isPriced ? (
					<span className="text-xs font-medium tabular-nums text-espresso/55">
						${availability!.price.toFixed(0)}
					</span>
				) : isBlocked ? (
					<span
						className={cn(
							'max-w-full truncate px-0.5 text-xs font-medium uppercase tracking-wide',
							isBooked ? 'text-espresso/55' : 'text-red-300',
						)}
					>
						{availability!.reason ?? 'Off'}
					</span>
				) : (
					<span className="h-3" />
				)}
			</div>
			{selected ? (
				<span className="absolute bottom-1 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full bg-camel" aria-hidden />
			) : null}
		</Button>
	);
}
