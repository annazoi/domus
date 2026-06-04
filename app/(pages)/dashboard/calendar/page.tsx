'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Skeleton, cn } from '@/components/ui';
import { BookingDetailModal } from '@/app/(pages)/dashboard/bookings/_components/booking-detail-modal';
import { useBookings } from '@/features/bookings/hooks/use-bookings';
import { BookingStatus } from '@/features/bookings/interfaces/booking-status';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';
import { formatDisplayDate } from '@/features/property-availability/utils/date';
import {
	activeBookingsForDate,
	bookingsForDate,
	buildBookingsByDate,
} from './_utils/calendar-bookings';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function statusLabel(status: HostBookingDetail['status']) {
	if (status === BookingStatus.CONFIRMED) return 'Confirmed';
	if (status === BookingStatus.CANCELLED) return 'Cancelled';
	return 'Pending';
}

export default function CalendarPage() {
	const { data: bookings = [], isLoading } = useBookings();
	const today = useMemo(() => DateTime.now().startOf('day'), []);
	const [viewMonth, setViewMonth] = useState(() => today.startOf('month'));
	const [selectedDate, setSelectedDate] = useState<string | null>(today.toISODate());
	const [selectedBooking, setSelectedBooking] = useState<HostBookingDetail | null>(null);

	const monthStart = viewMonth.startOf('month');
	const monthLabel = monthStart.toFormat('MMMM yyyy');
	const todayISO = today.toISODate() ?? '';

	const bookingsByDate = useMemo(() => buildBookingsByDate(bookings), [bookings]);

	const calendarCells = useMemo(() => {
		const daysInMonth = monthStart.daysInMonth ?? 30;
		const startOffset = monthStart.weekday % 7;
		const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

		return Array.from({ length: totalCells }, (_, index) => {
			const dayIndex = index - startOffset;
			if (dayIndex < 0 || dayIndex >= daysInMonth) {
				return null;
			}

			const date = monthStart.plus({ days: dayIndex });
			const dateISO = date.toISODate() ?? '';

			return {
				day: dayIndex + 1,
				date: dateISO,
				isPast: date < today,
				isToday: dateISO === todayISO,
			};
		});
	}, [monthStart, today, todayISO]);

	const selectedDayBookings = useMemo(() => {
		if (!selectedDate) return [];
		return bookingsForDate(bookings, selectedDate);
	}, [bookings, selectedDate]);

	const selectedDayActiveBookings = useMemo(() => {
		if (!selectedDate) return [];
		return activeBookingsForDate(bookings, selectedDate);
	}, [bookings, selectedDate]);

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Calendar</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Reservations overview</h1>
			</div>

			<div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
				<div className="dashboard-panel rounded-2xl p-5">
					<div className="mb-5 flex items-center justify-between gap-3">
						<Button
							type="button"
							variant="ghostIcon"
							onClick={() => setViewMonth((month) => month.minus({ months: 1 }))}
							aria-label="Previous month"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<p className="font-serif text-xl tracking-tight text-espresso">{monthLabel}</p>
						<Button
							type="button"
							variant="ghostIcon"
							onClick={() => setViewMonth((month) => month.plus({ months: 1 }))}
							aria-label="Next month"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>

					<div className="mb-2 grid grid-cols-7 text-center text-xs text-espresso/45">
						{weekdays.map((name) => (
							<div key={name} className="py-2">
								{name}
							</div>
						))}
					</div>

					{isLoading ? (
						<div className="grid grid-cols-7 gap-2">
							{Array.from({ length: 35 }).map((_, index) => (
								<Skeleton key={index} className="h-14 rounded-xl bg-black/10" />
							))}
						</div>
					) : (
						<div className="grid grid-cols-7 gap-2">
							{calendarCells.map((cell, index) => {
								if (!cell) {
									return <div key={`empty-${index}`} className="h-14" aria-hidden />;
								}

								const dayBookings = bookingsByDate.get(cell.date) ?? [];
								const activeCount = dayBookings.filter(
									(booking) => booking.status !== BookingStatus.CANCELLED,
								).length;
								const cancelledOnly = dayBookings.length > 0 && activeCount === 0;
								const isSelected = selectedDate === cell.date;

								return (
									<Button
										key={cell.date}
										type="button"
										variant="custom"
										onClick={() => setSelectedDate(cell.date)}
										className={cn(
											'relative h-14 rounded-xl border-0 text-sm transition',
											isSelected
												? 'bg-camel/15 text-camel-dark'
												: activeCount > 0
													? 'bg-camel/10 text-camel-dark hover:bg-camel/15'
													: cancelledOnly
														? 'bg-dashboard-bg text-dashboard-muted/70 line-through decoration-dashboard-muted/25'
														: cell.isPast
															? 'bg-dashboard-inset/80 text-dashboard-muted/60 hover:bg-dashboard-inset'
															: 'bg-dashboard-inset text-dashboard-muted hover:bg-dashboard-surface',
											cell.isToday && !isSelected ? 'bg-dashboard-surface' : '',
										)}
									>
										<span>{cell.day}</span>
										{activeCount > 0 ? (
											<span className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-0.5">
												{Array.from({ length: Math.min(activeCount, 3) }).map((_, dotIndex) => (
													<span
														key={dotIndex}
														className="h-1 w-1 rounded-full bg-camel"
														aria-hidden
													/>
												))}
											</span>
										) : null}
									</Button>
								);
							})}
						</div>
					)}

					<div className="mt-5 flex flex-wrap gap-4 text-xs text-espresso/55">
						<span className="inline-flex items-center gap-2">
							<span className="h-3 w-3 rounded bg-camel/10" />
							Has bookings
						</span>
						<span className="inline-flex items-center gap-2">
							<span className="h-3 w-3 rounded bg-dashboard-surface" />
							Today
						</span>
					</div>
				</div>

				<div className="space-y-4 dashboard-panel rounded-2xl p-5">
					<h2 className="font-serif text-2xl">Booking details</h2>
					<p className="text-sm text-espresso/60">
						{selectedDate
							? formatDisplayDate(selectedDate)
							: 'Select a date to view reservations for that day.'}
					</p>

					{isLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-16 rounded-xl bg-black/10" />
							<Skeleton className="h-16 rounded-xl bg-black/10" />
						</div>
					) : null}

					{!isLoading && selectedDate && selectedDayBookings.length === 0 ? (
						<p className="dashboard-soft rounded-xl px-4 py-5 text-sm text-dashboard-muted">
							No bookings on this date.
						</p>
					) : null}

					{!isLoading && selectedDayBookings.length > 0 ? (
						<div className="space-y-3">
							{selectedDayActiveBookings.length > 0 ? (
								<p className="text-xs uppercase tracking-[0.14em] text-espresso/40">
									{selectedDayActiveBookings.length}{' '}
									{selectedDayActiveBookings.length === 1 ? 'stay' : 'stays'}
								</p>
							) : null}
							{selectedDayBookings.map((booking) => (
								<Button
									key={booking.id}
									type="button"
									variant="custom"
									onClick={() => setSelectedBooking(booking)}
									className={cn(
										'flex h-auto w-full flex-col items-start gap-1 rounded-xl border-0 px-4 py-3 text-left transition hover:bg-dashboard-surface',
										booking.status === BookingStatus.CANCELLED
											? 'bg-dashboard-bg/80 opacity-70'
											: 'bg-dashboard-inset',
									)}
								>
									<span className="font-medium text-espresso">{booking.guest_name}</span>
									<Link
										href={`/${encodeURIComponent(booking.property.slug)}`}
										target="_blank"
										rel="noopener noreferrer"
										onClick={(event) => event.stopPropagation()}
										className="text-sm text-espresso/65 transition hover:text-camel"
									>
										{booking.property_title}
									</Link>
									<span className="text-sm text-espresso/55">
										{booking.start_date} – {booking.end_date}
									</span>
									<span className="text-xs capitalize text-camel-dark">{statusLabel(booking.status)}</span>
								</Button>
							))}
						</div>
					) : null}
				</div>
			</div>

			<BookingDetailModal
				open={selectedBooking !== null}
				booking={selectedBooking}
				onClose={() => setSelectedBooking(null)}
				onUpdated={setSelectedBooking}
			/>
		</div>
	);
}
