'use client';

import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DateTime } from 'luxon';
import { DayPicker, type DateRange } from 'react-day-picker';
import { Check, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Button, Checkbox, ConfirmationDialog, Input, cn, useToast } from '@/components/ui';
import { useUpdateProperty } from '@/features/property/hooks/use-property';
import {
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
import { DashboardPortal } from '@/app/(pages)/dashboard/_components/dashboard-portal';
import { PropertyFormSection, dashboardFormFields } from './property-form-section';
import { pricingFormSchema, type PricingFormInput, type PricingFormValues } from './schemas';
import './availability-day-picker.css';

type PricingSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	propertyId?: string;
};

type SelectionMode = 'single' | 'range';
type ConfirmKind = 'selection' | 'month' | 'all';
type RangeEntry = { id: string; value?: DateRange };

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_RANGE_NIGHTS = 366;
const VISIBLE_MONTHS = 24;

const fieldLabel = 'mb-2 block text-[13px] font-semibold text-espresso';
const fieldHelp = 'mt-1.5 text-xs text-dashboard-muted';
const fieldControl = 'h-11 rounded-lg px-3 text-sm';

export function PricingSection({ initialProperty, propertyId: propertyIdProp }: PricingSectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const { push } = useToast();
	const { mutateAsync: update, isPending: saving } = useUpdateProperty(propertyId);
	const defaultValues: UpsertPropertyInput = initialProperty ? { ...initialProperty } : PROPERTY_FORM_DEFAULT_VALUES;
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<PricingFormInput, unknown, PricingFormValues>({
		resolver: zodResolver(pricingFormSchema),
		defaultValues: {
			minimum_advance_reservation_hours: defaultValues.minimum_advance_reservation_hours,
			minimum_rental_period_nights: defaultValues.minimum_rental_period_nights,
			maximum_rental_period_nights: defaultValues.maximum_rental_period_nights,
		},
	});

	const today = useMemo(() => DateTime.utc().startOf('day'), []);
	const currentMonthStart = useMemo(() => today.startOf('month'), [today]);
	const lastMonthStart = useMemo(() => currentMonthStart.plus({ months: VISIBLE_MONTHS - 1 }), [currentMonthStart]);
	const [viewMonth, setViewMonth] = useState<DateTime>(currentMonthStart);
	const [selectionMode, setSelectionMode] = useState<SelectionMode>('range');
	const [anchor, setAnchor] = useState<string | null>(null);
	const [selected, setSelected] = useState<string[]>([]);
	const [price, setPrice] = useState('');
	const [isAvailable, setIsAvailable] = useState(true);
	const [reason, setReason] = useState<AvailabilityStatusType | ''>('');
	const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [ranges, setRanges] = useState<RangeEntry[]>([{ id: 'range-1' }]);
	const [activeRangeId, setActiveRangeId] = useState<string | null>(null);
	const [selectionPickerOpen, setSelectionPickerOpen] = useState(false);
	const [selectionDraft, setSelectionDraft] = useState<DateRange | undefined>(undefined);
	const rangeIdCounter = useRef(1);
	const [rangePrice, setRangePrice] = useState('');
	const [rangeAvailable, setRangeAvailable] = useState(true);
	const [rangeReason, setRangeReason] = useState<AvailabilityStatusType | ''>('');

	const { data: availabilityRows = [] } = usePropertyAvailability(
		propertyId,
		currentMonthStart.toISODate() ?? undefined,
		lastMonthStart.endOf('month').plus({ days: 1 }).startOf('day').toISODate() ?? undefined,
	);
	const { mutateAsync: upsertAvailability, isPending: applying } = useUpsertPropertyAvailability(propertyId);
	const { mutateAsync: clearAvailability, isPending: clearing } = useClearPropertyAvailability(propertyId);

	const availabilityMap = useMemo(() => new Map(availabilityRows.map((row) => [row.date, row])), [availabilityRows]);

	const isEditable = (iso: string) => {
		if (DateTime.fromISO(iso, { zone: 'utc' }) < today) return false;
		return availabilityMap.get(iso)?.reason !== AvailabilityStatus.BOOKED;
	};
	const editableDays = selected.filter(isEditable);
	const protectedCount = selected.length - editableDays.length;
	const busy = applying || clearing;

	const isAtCurrentMonth = viewMonth <= currentMonthStart;
	const isAtLastMonth = viewMonth >= lastMonthStart;

	const { cells, label, availableNights } = useMemo(() => {
		const first = viewMonth.startOf('month');
		const cellList: (DateTime | null)[] = [...Array(first.weekday % 7).fill(null)];
		let available = 0;
		for (let day = 1; day <= (first.daysInMonth ?? 30); day++) {
			const date = first.set({ day });
			cellList.push(date);
			const row = availabilityMap.get(toApiDate(date));
			if (row?.is_available && date >= today) available++;
		}
		while (cellList.length % 7 !== 0) cellList.push(null);
		return {
			cells: cellList,
			label: first.toFormat('LLLL yyyy'),
			availableNights: available,
		};
	}, [viewMonth, availabilityMap, today]);

	const handleSave = handleSubmit(async (formValues) => {
		const payload: UpsertPropertyInput = { ...defaultValues, ...formValues };

		if (!propertyId) {
			push({
				title: 'Save Basic info first to create the property.',
				tone: 'error',
			});
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
			push({
				title: submitError instanceof Error ? submitError.message : 'Could not save.',
				tone: 'error',
			});
		}
	});

	const syncEditorFrom = (days: string[]) => {
		const first = days.find(isEditable);
		const row = first ? availabilityMap.get(first) : undefined;
		setPrice(row ? String(row.price) : '');
		setIsAvailable(row?.is_available ?? true);
		setReason(row?.reason ?? '');
	};

	const applySelection = (days: string[]) => {
		const sorted = [...days].sort();
		setSelected(sorted);
		syncEditorFrom(sorted);
	};

	const selectDay = (iso: string) => {
		if (!isEditable(iso)) {
			push({
				title: 'This date is booked or in the past and cannot be edited.',
				tone: 'error',
			});
			return;
		}
		if (selectionMode === 'single' || anchor === null) {
			setAnchor(selectionMode === 'single' ? null : iso);
			applySelection([iso]);
			return;
		}
		applySelection(daysBetween(anchor, iso));
		setAnchor(null);
	};

	const changeMode = (next: SelectionMode) => {
		setSelectionMode(next);
		setAnchor(null);
		if (next === 'single' && selected.length) applySelection([selected[0]]);
	};

	const setRangeFromInputs = (from: string, to: string) => {
		const nights = daysBetween(from, to);
		if (nights.length > MAX_RANGE_NIGHTS) {
			push({
				title: `Choose a range of up to ${MAX_RANGE_NIGHTS} nights.`,
				tone: 'error',
			});
			return;
		}
		setAnchor(null);
		applySelection(nights);
		setViewMonth(DateTime.fromISO(from, { zone: 'utc' }).startOf('month'));
	};

	const priceValue = Number(price);
	const invalidPrice = isAvailable && (price.trim() === '' || Number.isNaN(priceValue) || priceValue < 0);
	const canApply = Boolean(propertyId) && editableDays.length > 0 && !invalidPrice && !busy;

	const handleApply = async () => {
		if (!canApply) return;
		const dayPrice = (iso: string) => {
			if (isAvailable) return priceValue;
			const typed = price.trim() === '' ? NaN : priceValue;
			return Number.isNaN(typed) ? (availabilityMap.get(iso)?.price ?? 0) : typed;
		};
		try {
			await Promise.all(
				toRuns(editableDays, dayPrice).map((run) =>
					upsertAvailability({
						start: run.start,
						end: toApiDate(DateTime.fromISO(run.end, { zone: 'utc' }).plus({ days: 1 })),
						price: run.price,
						is_available: isAvailable,
						reason: isAvailable ? null : reason || null,
					}),
				),
			);
			push({
				title: `Updated ${editableDays.length} ${editableDays.length === 1 ? 'night' : 'nights'}.`,
				tone: 'success',
			});
		} catch (submitError) {
			push({
				title: submitError instanceof Error ? submitError.message : 'Could not update availability.',
				tone: 'error',
			});
		}
	};

	const clearDays = async (days: string[], successTitle: string) => {
		try {
			await Promise.all(
				toRuns(days, () => 0).map((run) =>
					clearAvailability({
						start: run.start,
						end: toApiDate(DateTime.fromISO(run.end, { zone: 'utc' }).plus({ days: 1 })),
					}),
				),
			);
			push({ title: successTitle, tone: 'success' });
		} catch (submitError) {
			push({
				title: submitError instanceof Error ? submitError.message : 'Could not remove availability.',
				tone: 'error',
			});
		}
	};

	const handleConfirm = async () => {
		if (!propertyId || !confirm) return;
		if (confirm === 'selection') {
			await clearDays(editableDays, 'Availability cleared. Existing bookings were kept.');
		} else if (confirm === 'month') {
			const monthDays = cells
				.filter((cell): cell is DateTime => Boolean(cell))
				.map(toApiDate)
				.filter((iso) => availabilityMap.has(iso) && isEditable(iso));
			await clearDays(monthDays, 'Month cleared. Existing bookings were kept.');
		} else {
			try {
				await clearAvailability(undefined);
				push({ title: 'All availability was removed.', tone: 'success' });
			} catch (submitError) {
				push({
					title: submitError instanceof Error ? submitError.message : 'Could not remove availability.',
					tone: 'error',
				});
			}
		}
		setSelected([]);
		setAnchor(null);
	};

	const selectedRanges = useMemo(
		() =>
			ranges
				.map((item) => ({
					id: item.id,
					from: item.value?.from,
					to: item.value?.to,
				}))
				.filter((item) => item.from || item.to),
		[ranges],
	);
	const hasIncompleteRanges = selectedRanges.some((item) => !item.from || !item.to);
	const hasSelectedRangeOverlap = useMemo(() => {
		const complete = selectedRanges
			.filter((item): item is { id: string; from: Date; to: Date } => Boolean(item.from && item.to))
			.map((item) => ({
				start: fromPickerDate(item.from),
				endExclusive: fromPickerDate(item.to).plus({ days: 1 }),
			}))
			.sort((a, b) => a.start.toMillis() - b.start.toMillis());
		for (let i = 1; i < complete.length; i++) {
			if (complete[i].start < complete[i - 1].endExclusive) return true;
		}
		return false;
	}, [selectedRanges]);
	const hasOverlapWithSavedAvailability = useMemo(
		() => selectedRangesOverlapSavedDates(selectedRanges, availabilityRows),
		[selectedRanges, availabilityRows],
	);
	const rangePriceValue = Number(rangePrice);
	const invalidRangePrice = Number.isNaN(rangePriceValue) || rangePriceValue < 0;
	const disableApplyRanges =
		applying ||
		!selectedRanges.length ||
		hasIncompleteRanges ||
		invalidRangePrice ||
		hasSelectedRangeOverlap ||
		hasOverlapWithSavedAvailability;

	const resetRangeModalForm = () => {
		rangeIdCounter.current = 1;
		setRanges([{ id: 'range-1' }]);
		setActiveRangeId(null);
		setRangePrice('');
		setRangeAvailable(true);
		setRangeReason('');
	};

	const openModal = () => {
		resetRangeModalForm();
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		resetRangeModalForm();
	};

	const bookedDates = useMemo(
		() =>
			availabilityRows.filter((row) => row.reason === AvailabilityStatus.BOOKED).map((row) => toPickerDate(row.date)),
		[availabilityRows],
	);

	const openSelectionPicker = () => {
		setSelectionDraft(
			first ? { from: toPickerDate(first), to: last && last !== first ? toPickerDate(last) : undefined } : undefined,
		);
		setSelectionPickerOpen(true);
	};

	const closeSelectionPicker = () => setSelectionPickerOpen(false);

	const commitSelectionDraft = () => {
		const from = selectionDraft?.from;
		if (!from) return;
		const to = selectionMode === 'single' ? from : (selectionDraft?.to ?? from);
		setRangeFromInputs(toApiDate(fromPickerDate(from)), toApiDate(fromPickerDate(to)));
		closeSelectionPicker();
	};

	const addRange = () => {
		rangeIdCounter.current += 1;
		const id = `range-${rangeIdCounter.current}`;
		setRanges((previous) => [...previous, { id }]);
		setActiveRangeId(id);
	};

	const removeRange = (id: string) => {
		setRanges((previous) => (previous.length > 1 ? previous.filter((item) => item.id !== id) : previous));
		setActiveRangeId((current) => (current === id ? null : current));
	};

	const handleApplyRanges = async () => {
		if (!propertyId) return;
		if (!selectedRanges.length) {
			push({ title: 'Select at least one date range.', tone: 'error' });
			return;
		}
		if (hasIncompleteRanges) {
			push({
				title: 'Complete all date ranges before applying.',
				tone: 'error',
			});
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
			push({
				title: 'Selected dates overlap existing availability. Choose dates that are not already set.',
				tone: 'error',
			});
			return;
		}
		try {
			await Promise.all(
				selectedRanges.map((rangeItem) =>
					upsertAvailability({
						start: toApiDate(fromPickerDate(rangeItem.from!)),
						end: toApiDate(fromPickerDate(rangeItem.to!).plus({ days: 1 })),
						price: rangePriceValue,
						is_available: rangeAvailable,
						reason: rangeAvailable ? null : rangeReason || null,
					}),
				),
			);
			push({
				title: 'Availability updated for selected ranges.',
				tone: 'success',
			});
			closeModal();
		} catch (submitError) {
			push({
				title: submitError instanceof Error ? submitError.message : 'Could not update availability.',
				tone: 'error',
			});
		}
	};

	const confirmCopy: Record<ConfirmKind, { title: string; description: string; confirmLabel: string }> = {
		selection: {
			title: 'Clear selected dates?',
			description: `Remove prices and availability from ${editableDays.length} selected ${editableDays.length === 1 ? 'night' : 'nights'}? Existing bookings will not change.`,
			confirmLabel: 'Clear dates',
		},
		month: {
			title: `Clear ${label}?`,
			description: `Remove all unbooked prices and availability for ${label}? Existing bookings will not change.`,
			confirmLabel: 'Clear month',
		},
		all: {
			title: 'Remove all availability?',
			description: 'This will delete all prices and availability days for this property. This action cannot be undone.',
			confirmLabel: 'Remove all',
		},
	};

	const first = selected[0];
	const last = selected[selected.length - 1];
	const selectionLabel = first
		? first === last
			? formatDay(first, true)
			: `${formatDay(first)} — ${formatDay(last, true)}`
		: 'No dates selected';
	const editableLabel = `${editableDays.length} ${editableDays.length === 1 ? 'night' : 'nights'}`;

	return (
		<PropertyFormSection id="pricing-availability" title="Pricing & availability">
			<p className="max-w-2xl text-sm leading-relaxed text-dashboard-muted">
				Set booking rules, then pick dates on the calendar to set nightly prices or block nights.
			</p>

			<div className="overflow-hidden rounded-xl border border-dashboard-border bg-dashboard-surface">
				<div className="border-b border-dashboard-border p-5 sm:p-6">
					<p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-dashboard-muted">Booking rules</p>
					<div className="grid gap-5 md:grid-cols-3 md:gap-8">
						<div>
							<label htmlFor="minimum-advance-reservation-hours" className={fieldLabel}>
								Advance notice
							</label>
							<div className="relative">
								<Input
									id="minimum-advance-reservation-hours"
									type="number"
									min={0}
									step={1}
									placeholder="No minimum"
									className={cn(fieldControl, 'pr-28')}
									{...register('minimum_advance_reservation_hours')}
								/>
								<span className="pointer-events-none absolute inset-y-0 right-10 flex items-center text-sm text-dashboard-muted">
									hours
								</span>
							</div>
							<p className={fieldHelp}>Time before check-in</p>
							{errors.minimum_advance_reservation_hours?.message ? (
								<p className="mt-1 text-xs text-red-700">{errors.minimum_advance_reservation_hours.message}</p>
							) : null}
						</div>
						<div>
							<label htmlFor="minimum-rental-period-nights" className={fieldLabel}>
								Minimum stay
							</label>
							<div className="relative">
								<Input
									id="minimum-rental-period-nights"
									type="number"
									min={1}
									step={1}
									placeholder="No minimum"
									className={cn(fieldControl, 'pr-28')}
									{...register('minimum_rental_period_nights')}
								/>
								<span className="pointer-events-none absolute inset-y-0 right-10 flex items-center text-sm text-dashboard-muted">
									nights
								</span>
							</div>
							<p className={fieldHelp}>Shortest guest stay</p>
							{errors.minimum_rental_period_nights?.message ? (
								<p className="mt-1 text-xs text-red-700">{errors.minimum_rental_period_nights.message}</p>
							) : null}
						</div>
						<div>
							<label htmlFor="maximum-rental-period-nights" className={fieldLabel}>
								Maximum stay
							</label>
							<div className="relative">
								<Input
									id="maximum-rental-period-nights"
									type="number"
									min={1}
									step={1}
									placeholder="No maximum"
									className={cn(fieldControl, 'pr-28')}
									{...register('maximum_rental_period_nights')}
								/>
								<span className="pointer-events-none absolute inset-y-0 right-10 flex items-center text-sm text-dashboard-muted">
									nights
								</span>
							</div>
							<p className={fieldHelp}>Longest guest stay</p>
							{errors.maximum_rental_period_nights?.message ? (
								<p className="mt-1 text-xs text-red-700">{errors.maximum_rental_period_nights.message}</p>
							) : null}
						</div>
					</div>
				</div>
				<div className="grid 2xl:grid-cols-[minmax(0,1fr)_20rem]">
					<div className="min-w-0 p-4 sm:p-6">
						<div>
							<div className="flex items-center justify-between gap-3 pb-5">
								<button
									type="button"
									onClick={() => setViewMonth((month) => month.minus({ months: 1 }))}
									disabled={isAtCurrentMonth}
									aria-label="Previous month"
									className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full bg-dashboard-inset text-espresso transition hover:bg-dashboard-row-hover disabled:cursor-not-allowed disabled:opacity-40"
								>
									<ChevronLeft className="h-5 w-5" />
								</button>
								<div className="min-w-0 text-center">
									<p className="font-serif text-xl text-espresso">{label}</p>
									<p className="mt-1 text-xs text-dashboard-muted">Nightly prices · USD</p>
								</div>
								<button
									type="button"
									onClick={() => setViewMonth((month) => month.plus({ months: 1 }))}
									disabled={isAtLastMonth}
									aria-label="Next month"
									className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full bg-dashboard-inset text-espresso transition hover:bg-dashboard-row-hover disabled:cursor-not-allowed disabled:opacity-40"
								>
									<ChevronRight className="h-5 w-5" />
								</button>
							</div>

							<div className="grid grid-cols-7 pb-2 text-center text-xs font-medium text-dashboard-muted">
								{weekdays.map((w) => (
									<span key={w}>{w}</span>
								))}
							</div>
							<div role="group" aria-label={`${label} dates`} className="grid grid-cols-7 gap-[3px] sm:gap-[5px]">
								{cells.map((day, i) =>
									day ? (
										<DayCell
											key={i}
											day={day}
											isPast={day < today}
											selected={selected.includes(toApiDate(day))}
											availability={availabilityMap.get(toApiDate(day))}
											onClick={() => selectDay(toApiDate(day))}
										/>
									) : (
										<div key={i} className="min-h-[4.5rem] sm:min-h-[5.5rem]" aria-hidden />
									),
								)}
							</div>
							<CalendarLegend />
						</div>

						<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
							<span className="text-xs text-dashboard-muted">
								{availableNights} {availableNights === 1 ? 'night' : 'nights'} available
							</span>
							<div className="flex items-center gap-1">
								<button
									type="button"
									className="cursor-pointer rounded-md px-2.5 py-2 text-[13px] text-[#c4785a] transition hover:bg-dashboard-row-hover disabled:cursor-not-allowed disabled:opacity-50"
									disabled={!propertyId || busy}
									onClick={() => setConfirm('month')}
								>
									Clear month availability
								</button>
								<button
									type="button"
									className="cursor-pointer rounded-md px-2.5 py-2 text-[13px] text-dashboard-muted transition hover:bg-dashboard-row-hover hover:text-espresso disabled:cursor-not-allowed disabled:opacity-50"
									disabled={!propertyId || busy}
									onClick={() => setConfirm('all')}
								>
									Clear all
								</button>
							</div>
						</div>
					</div>

					<aside
						aria-label="Selected date settings"
						className="border-t border-dashboard-border bg-dashboard-bg/60 p-5 sm:p-6 2xl:border-l 2xl:border-t-0"
					>
						<div className="mx-auto w-full max-w-xl 2xl:max-w-none">
							<h3 className="mb-3 text-sm font-semibold text-espresso">Selected dates</h3>
							<div className="rounded-lg bg-camel/10 p-4">
								<p className="text-sm font-semibold text-espresso">{selectionLabel}</p>
								<p className="mt-1 text-xs text-dashboard-muted">
									{selected.length} {selected.length === 1 ? 'night' : 'nights'} selected
								</p>
							</div>

							<div
								className="mt-4 flex gap-1 rounded-lg bg-dashboard-inset p-1"
								role="group"
								aria-label="Date selection mode"
							>
								{(['single', 'range'] as const).map((value) => (
									<button
										key={value}
										type="button"
										aria-pressed={selectionMode === value}
										onClick={() => changeMode(value)}
										className={cn(
											'flex-1 cursor-pointer rounded-md px-1 py-2 text-xs transition',
											selectionMode === value
												? 'bg-dashboard-surface text-espresso shadow-[var(--shadow-dashboard-panel)]'
												: 'text-dashboard-muted hover:text-espresso',
										)}
									>
										{value === 'single' ? 'Single date' : 'Date range'}
									</button>
								))}
							</div>

							<div className={cn('mt-4 grid gap-2', selectionMode === 'range' ? 'grid-cols-2' : 'grid-cols-1')}>
								<div>
									<span className="mb-1.5 block text-xs font-semibold text-espresso">
										{selectionMode === 'single' ? 'Date' : 'From'}
									</span>
									<Input
										variant="compact"
										readOnly
										value={first ? formatDay(first, true) : ''}
										placeholder="Select date"
										onClick={openSelectionPicker}
										aria-haspopup="dialog"
										className="h-10 min-w-0 cursor-pointer rounded-lg px-3 text-xs"
									/>
								</div>
								{selectionMode === 'range' ? (
									<div>
										<span className="mb-1.5 block text-xs font-semibold text-espresso">Through</span>
										<Input
											variant="compact"
											readOnly
											value={last ? formatDay(last, true) : ''}
											placeholder="Select date"
											onClick={openSelectionPicker}
											aria-haspopup="dialog"
											className="h-10 min-w-0 cursor-pointer rounded-lg px-3 text-xs"
										/>
									</div>
								) : null}
							</div>

							<div className="mt-6 space-y-5">
								<div className="flex items-center justify-between gap-3">
									<label htmlFor="availability-switch" className="text-sm font-semibold text-espresso">
										Available for booking
									</label>
									<span className="relative h-6 w-10 shrink-0">
										<input
											id="availability-switch"
											type="checkbox"
											role="switch"
											checked={isAvailable}
											disabled={!editableDays.length}
											onChange={(e) => setIsAvailable(e.target.checked)}
											className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
										/>
										<span
											aria-hidden
											className="pointer-events-none absolute inset-0 rounded-full bg-dashboard-muted/60 transition peer-checked:bg-[#4d7c6f] peer-disabled:opacity-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-camel peer-checked:[&>span]:translate-x-4"
										>
											<span className="absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-transform" />
										</span>
									</span>
								</div>

								<div>
									<label htmlFor="availability-price" className={fieldLabel}>
										Nightly price
									</label>
									<div className="relative">
										<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dashboard-muted">
											$
										</span>
										<Input
											id="availability-price"
											type="number"
											min={0}
											step={0.01}
											placeholder="0.00"
											value={price}
											onChange={(e) => setPrice(e.target.value)}
											disabled={!editableDays.length}
											className={cn(fieldControl, 'pl-8')}
										/>
									</div>
								</div>

								{!isAvailable ? (
									<div>
										<label htmlFor="availability-reason" className={fieldLabel}>
											Why are these dates blocked?
										</label>
										<select
											id="availability-reason"
											value={reason}
											onChange={(e) => setReason(e.target.value as AvailabilityStatusType | '')}
											disabled={!editableDays.length}
											className="h-11 w-full rounded-lg border border-dashboard-border bg-dashboard-surface px-3 text-sm text-espresso outline-none focus:border-camel/40 focus:ring-2 focus:ring-camel/12"
										>
											<option value="">Not specified</option>
											<option value={AvailabilityStatus.BLOCKED}>Blocked</option>
											<option value={AvailabilityStatus.MAINTENANCE}>Maintenance</option>
											<option value={AvailabilityStatus.BOOKED}>Booked</option>
										</select>
									</div>
								) : null}

								{protectedCount > 0 ? (
									<p className="text-xs text-[#c4785a]" role="status">
										{protectedCount} booked or past {protectedCount === 1 ? 'night is' : 'nights are'} protected and
										will not be changed.
									</p>
								) : null}
							</div>

							<div className="mt-8 space-y-3">
								<Button type="button" variant="secondary" className="w-full" onClick={openModal} disabled={!propertyId}>
									Set dates &amp; price
								</Button>
								<Button
									type="button"
									variant="primarySm"
									className="w-full"
									disabled={!canApply}
									onClick={() => void handleApply()}
								>
									{applying
										? 'Applying…'
										: editableDays.length
											? `Apply to ${editableLabel}`
											: 'Select available dates'}
								</Button>
								<button
									type="button"
									className="w-full cursor-pointer rounded-md px-2.5 py-2 text-[13px] text-[#c4785a] transition hover:bg-dashboard-row-hover disabled:cursor-not-allowed disabled:opacity-50"
									disabled={!editableDays.length || busy}
									onClick={() => setConfirm('selection')}
								>
									Clear selected availability
								</button>
							</div>
						</div>
					</aside>
				</div>
				<div className="flex justify-end border-t border-dashboard-border bg-dashboard-bg/60 px-5 py-4 sm:px-6">
					<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
						{saving ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</div>

			<DashboardPortal>
				<AnimatePresence>
					{modalOpen ? (
						<motion.div
							key="range-modal"
							className="fixed inset-0 z-[70] flex items-center justify-center p-4"
							role="presentation"
							onClick={closeModal}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.18 }}
						>
							<div className="absolute inset-0 bg-black/45" aria-hidden />
							<motion.div
								role="dialog"
								aria-modal
								aria-labelledby="availability-range-title"
								className={cn(
									'relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-dashboard-panel p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]',
									dashboardFormFields,
								)}
								onClick={(e) => e.stopPropagation()}
								initial={{ opacity: 0, y: 14, scale: 0.98 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: 8, scale: 0.98 }}
								transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
							>
								<div className="mb-6 flex items-start justify-between gap-4">
									<div>
										<h3 id="availability-range-title" className="font-serif text-xl text-espresso">
											Availability &amp; pricing
										</h3>
										<p className="mt-1 text-sm text-dashboard-muted">
											Set one price and availability for one or more date ranges.
										</p>
									</div>
									<Button type="button" variant="ghostIcon" onClick={closeModal} aria-label="Close">
										<X className="h-5 w-5" />
									</Button>
								</div>

								<div>
									<AnimatePresence initial={false}>
										{ranges.map((rangeItem, index) => (
											<motion.div
												key={rangeItem.id}
												initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
												animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
												exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
												transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
											>
												<div className="relative pb-4">
													{ranges.length > 1 ? (
														<button
															type="button"
															onClick={() => removeRange(rangeItem.id)}
															className="absolute right-0 top-0 z-10 inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-dashboard-muted transition hover:bg-red-500/10 hover:text-red-600"
														>
															<X className="h-3.5 w-3.5" />
															Remove
														</button>
													) : null}
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
													<AnimatePresence initial={false}>
														{activeRangeId === rangeItem.id ? (
															<motion.div
																key="picker"
																role="dialog"
																aria-label={`Select date range ${index + 1}`}
																initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
																animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
																exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
																transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
																className="availability-day-picker mt-2 w-full rounded-xl border border-dashboard-border bg-dashboard-surface [&_.rdp-month]:w-full [&_.rdp-month_grid]:w-full [&_.rdp-day]:transition-[background,background-color] [&_.rdp-day]:duration-200 [&_.rdp-day]:ease-out [&_.rdp-day_button]:transition-[color,background-color,border-color,transform,box-shadow] [&_.rdp-day_button]:duration-200 [&_.rdp-day_button]:ease-out [&_.rdp-day_button]:active:scale-[0.94]"
															>
																<div className="p-3">
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
																			...getDisabledDatesForRangePicker(ranges, rangeItem.id, availabilityRows),
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
																		defaultMonth={rangeItem.value?.from ?? today.toJSDate()}
																		className="w-full"
																	/>
																	<p
																		className="mt-2 rounded-lg bg-camel/10 px-3 py-2 text-xs text-espresso"
																		role="status"
																	>
																		{rangeItem.value?.from && rangeItem.value?.to
																			? `${formatRangeLabel(rangeItem.value)} · ${nightsInRange(rangeItem.value)} nights`
																			: rangeItem.value?.from
																				? 'Now choose the last night'
																				: 'Choose the first night'}
																	</p>
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
															</motion.div>
														) : null}
													</AnimatePresence>
												</div>
											</motion.div>
										))}
									</AnimatePresence>
									<button
										type="button"
										onClick={addRange}
										className="mb-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-camel/60 bg-camel/[0.07] py-3 text-sm font-semibold text-camel-deep transition hover:border-camel hover:bg-camel/[0.14] active:scale-[0.99]"
									>
										<Plus className="h-4 w-4" />
										Add another range
									</button>
									<div className="space-y-4">
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
											<Checkbox checked={rangeAvailable} onChange={(e) => setRangeAvailable(e.target.checked)} />
											<span className="text-sm text-espresso">Available for booking</span>
										</label>
										<label className="block text-xs font-medium uppercase tracking-[0.12em] text-dashboard-muted">
											Reason (when unavailable)
											<select
												value={rangeReason}
												onChange={(e) => setRangeReason(e.target.value as AvailabilityStatusType | '')}
												className="mt-1.5 h-10 w-full rounded-lg border-0 bg-dashboard-bg px-3 text-sm text-espresso focus:outline-none focus:ring-0"
											>
												<option value="">None</option>
												<option value={AvailabilityStatus.BLOCKED}>Blocked</option>
												<option value={AvailabilityStatus.MAINTENANCE}>Maintenance</option>
												<option value={AvailabilityStatus.BOOKED}>Booked</option>
											</select>
										</label>
									</div>
								</div>

								<div className="mt-8 flex justify-end gap-3 border-t border-dashboard-border pt-5">
									<Button type="button" variant="ghostPill" onClick={closeModal}>
										Cancel
									</Button>
									<Button
										type="button"
										variant="primary"
										disabled={disableApplyRanges}
										onClick={() => void handleApplyRanges()}
									>
										{applying ? 'Applying...' : 'Apply'}
									</Button>
								</div>
							</motion.div>
						</motion.div>
					) : null}
				</AnimatePresence>
				<AnimatePresence>
					{selectionPickerOpen ? (
						<motion.div
							key="selection-picker"
							className="fixed inset-0 z-[75] flex items-center justify-center p-4"
							role="presentation"
							onClick={closeSelectionPicker}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.16 }}
						>
							<div className="absolute inset-0 bg-black/45" aria-hidden />
							<motion.div
								role="dialog"
								aria-modal
								aria-label={selectionMode === 'single' ? 'Select a date' : 'Select dates'}
								className="availability-day-picker relative z-10 w-full max-w-sm rounded-2xl bg-dashboard-panel p-5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] [&_.rdp-month]:w-full [&_.rdp-month_grid]:w-full"
								onClick={(e) => e.stopPropagation()}
								initial={{ opacity: 0, y: 12, scale: 0.98 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: 8, scale: 0.98 }}
								transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
							>
								<div className="mb-3 flex items-center justify-between gap-2">
									<p className="font-serif text-lg text-espresso">
										{selectionMode === 'single' ? 'Select a date' : 'Select dates'}
									</p>
									<Button type="button" variant="ghostIcon" onClick={closeSelectionPicker} aria-label="Close">
										<X className="h-5 w-5" />
									</Button>
								</div>
								{selectionMode === 'single' ? (
									<DayPicker
										mode="single"
										disabled={[{ before: today.toJSDate() }, ...bookedDates]}
										startMonth={today.toJSDate()}
										endMonth={lastMonthStart.toJSDate()}
										defaultMonth={selectionDraft?.from ?? today.toJSDate()}
										selected={selectionDraft?.from}
										onSelect={(date) => setSelectionDraft(date ? { from: date } : undefined)}
										className="w-full"
									/>
								) : (
									<DayPicker
										mode="range"
										disabled={[{ before: today.toJSDate() }, ...bookedDates]}
										startMonth={today.toJSDate()}
										endMonth={lastMonthStart.toJSDate()}
										defaultMonth={selectionDraft?.from ?? today.toJSDate()}
										selected={selectionDraft}
										onSelect={setSelectionDraft}
										className="w-full"
									/>
								)}
								<p className="mt-3 rounded-lg bg-camel/10 px-3 py-2 text-xs text-espresso" role="status">
									{selectionDraft?.from && (selectionMode === 'single' || selectionDraft.to)
										? selectionMode === 'single'
											? formatRangeLabel({ from: selectionDraft.from, to: selectionDraft.from })
											: `${formatRangeLabel(selectionDraft)} · ${nightsInRange(selectionDraft)} nights`
										: selectionDraft?.from
											? 'Now choose the last night'
											: selectionMode === 'single'
												? 'Choose a date'
												: 'Choose the first night'}
								</p>
								<div className="mt-4 flex items-center justify-between gap-2 border-t border-dashboard-border pt-4">
									<Button
										type="button"
										variant="ghostPill"
										className="h-9 px-3"
										disabled={!selectionDraft?.from}
										onClick={() => setSelectionDraft(undefined)}
									>
										Clear
									</Button>
									<Button
										type="button"
										variant="primarySm"
										disabled={!selectionDraft?.from || (selectionMode === 'range' && !selectionDraft.to)}
										onClick={commitSelectionDraft}
									>
										Done
									</Button>
								</div>
							</motion.div>
						</motion.div>
					) : null}
				</AnimatePresence>
			</DashboardPortal>
			<ConfirmationDialog
				open={confirm !== null}
				title={confirm ? confirmCopy[confirm].title : ''}
				description={confirm ? confirmCopy[confirm].description : ''}
				confirmLabel={confirm ? confirmCopy[confirm].confirmLabel : ''}
				cancelLabel="Keep data"
				confirmVariant="danger"
				loading={clearing}
				onCancel={() => setConfirm(null)}
				onConfirm={() => {
					void handleConfirm().finally(() => setConfirm(null));
				}}
			/>
		</PropertyFormSection>
	);
}

function selectedRangesOverlapSavedDates(selectedRanges: { from?: Date; to?: Date }[], savedRows: AvailabilityDay[]) {
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

function getDisabledDatesForRangePicker(allRanges: RangeEntry[], currentRangeId: string, savedRows: AvailabilityDay[]) {
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

function toPickerDate(iso: string) {
	const [year, month, day] = iso.split('-').map(Number);
	return new Date(year, month - 1, day);
}

function fromPickerDate(date: Date) {
	return DateTime.fromObject(
		{
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate(),
		},
		{ zone: 'utc' },
	).startOf('day');
}

function nightsInRange(range: DateRange) {
	if (!range.from || !range.to) return 0;
	return Math.round(fromPickerDate(range.to).diff(fromPickerDate(range.from), 'days').days) + 1;
}

function daysBetween(a: string, b: string) {
	const [from, to] = a <= b ? [a, b] : [b, a];
	const out: string[] = [];
	let cursor = DateTime.fromISO(from, { zone: 'utc' }).startOf('day');
	const end = DateTime.fromISO(to, { zone: 'utc' }).startOf('day');
	while (cursor <= end && out.length <= MAX_RANGE_NIGHTS) {
		out.push(toApiDate(cursor));
		cursor = cursor.plus({ days: 1 });
	}
	return out;
}

/** Groups sorted ISO days into contiguous runs that share the same price. */
function toRuns(days: string[], priceFor: (iso: string) => number) {
	const runs: { start: string; end: string; price: number }[] = [];
	for (const iso of [...days].sort()) {
		const price = priceFor(iso);
		const current = runs[runs.length - 1];
		const nextAfterCurrent = current
			? toApiDate(DateTime.fromISO(current.end, { zone: 'utc' }).plus({ days: 1 }))
			: null;
		if (current && nextAfterCurrent === iso && current.price === price) current.end = iso;
		else runs.push({ start: iso, end: iso, price });
	}
	return runs;
}

function formatDay(iso: string, withYear = false) {
	return DateTime.fromISO(iso, { zone: 'utc' }).toFormat(withYear ? 'MMM d, yyyy' : 'MMM d');
}

const legendItems = [
	{ key: 'available', label: 'Available', dot: 'bg-[#4d7c6f]' },
	{ key: 'blocked', label: 'Blocked', dot: 'bg-[#c4785a]' },
	{ key: 'booked', label: 'Booked', dot: 'bg-dashboard-muted' },
	{ key: 'selected', label: 'Selected', dot: 'bg-[#d4a853]' },
	{ key: 'unset', label: 'No price', dot: 'bg-dashboard-border' },
] as const;

function CalendarLegend() {
	return (
		<div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-dashboard-border pt-4 text-xs text-dashboard-muted">
			{legendItems.map((item) => (
				<span key={item.key} className="flex items-center gap-2">
					<i className={cn('inline-block h-2 w-2 rounded-full', item.dot)} aria-hidden />
					{item.label}
				</span>
			))}
		</div>
	);
}

type DayCellProps = {
	day: DateTime;
	selected: boolean;
	availability: Pick<AvailabilityDay, 'is_available' | 'price' | 'reason'> | undefined;
	isPast: boolean;
	onClick: () => void;
};

function DayCell({ day, selected, availability, isPast, onClick }: DayCellProps) {
	const isBooked = availability?.reason === AvailabilityStatus.BOOKED;
	const isBlocked = Boolean(availability && !availability.is_available) && !isBooked;
	const isPriced = Boolean(availability?.is_available);

	const tone = isPast
		? 'cursor-not-allowed bg-transparent text-dashboard-muted/50'
		: isBooked
			? 'cursor-not-allowed bg-dashboard-inset text-dashboard-muted'
			: isBlocked
				? 'bg-[color-mix(in_srgb,#c4785a_14%,var(--color-dashboard-surface))] text-[#c4785a]'
				: isPriced
					? 'bg-[color-mix(in_srgb,#4d7c6f_13%,var(--color-dashboard-surface))] text-[#4d7c6f]'
					: 'bg-dashboard-bg text-dashboard-muted';

	const caption = isPast
		? ''
		: isBooked
			? 'Booked'
			: isBlocked
				? 'Blocked'
				: isPriced
					? `$${availability!.price.toFixed(0)}`
					: '—';

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={isPast}
			aria-pressed={selected}
			aria-label={`${day.toFormat('MMMM d, yyyy')}${caption ? `, ${caption}` : ''}`}
			className={cn(
				'relative flex min-h-[4.5rem] cursor-pointer flex-col items-start justify-between rounded-md p-2 text-left transition hover:brightness-[0.97] sm:min-h-[5.5rem] sm:p-3',
				tone,
				selected &&
					'outline outline-2 -outline-offset-2 outline-[#d4a853] !bg-[color-mix(in_srgb,#d4a853_16%,var(--color-dashboard-surface))] !text-espresso',
			)}
		>
			<span className={cn('text-sm font-semibold', isPast ? '' : 'text-espresso')}>{day.day}</span>
			<span className="text-[10px] font-semibold tabular-nums sm:text-[13px]">{caption}</span>
			{selected ? (
				<Check className="absolute right-1.5 top-2 h-3 w-3 text-espresso sm:right-2 sm:top-2.5" aria-hidden />
			) : null}
		</button>
	);
}
