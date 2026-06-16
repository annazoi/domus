'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, ChevronRight, Home, Mail, MapPin, Phone, Users, X } from 'lucide-react';
import { cloudinaryDisplayUrl, profileInitials } from '@/lib/profile/display';
import { HomeGuideShareCard } from '@/components/bookings/home-guide-share-card';
import { Button, Skeleton, cn } from '@/components/ui';
import { useGuestTrip } from '@/features/bookings/hooks/use-bookings';
import { BookingStatus } from '@/features/bookings/interfaces/booking-status';
import type { GuestTripDetail } from '@/features/bookings/interfaces/booking.interface';
import { formatEuropeanDateRange } from '@/features/property-availability/utils/date';
import { DateTime } from 'luxon';

function formatWhen(iso: string) {
	try {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short',
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}

function formatBookingRef(id: string) {
	return id.slice(0, 8).toUpperCase();
}

function formatMoney(value: number) {
	return `$${value.toFixed(2)}`;
}

function countNights(start: string, end: string) {
	const checkIn = DateTime.fromISO(start, { zone: 'utc' });
	const checkOut = DateTime.fromISO(end, { zone: 'utc' });
	if (!checkIn.isValid || !checkOut.isValid) return null;
	const nights = Math.round(checkOut.diff(checkIn, 'days').days);
	return nights > 0 ? nights : null;
}

function statusStyles(status: GuestTripDetail['status']) {
	if (status === BookingStatus.CONFIRMED) return 'bg-camel/15 text-camel-dark ring-1 ring-camel/20';
	if (status === BookingStatus.CANCELLED) return 'bg-dashboard-bg text-dashboard-muted line-through decoration-dashboard-muted/40';
	return 'bg-dashboard-inset text-dashboard-muted ring-1 ring-dashboard-border';
}

function StatusBadge({ status }: { status: GuestTripDetail['status'] }) {
	return (
		<span
			className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium capitalize tracking-wide ${statusStyles(status)}`}
		>
			{status}
		</span>
	);
}

function DetailRow({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
	return (
		<div className={cn('flex items-baseline justify-between gap-4 border-b border-dashboard-border/60 py-3 last:border-b-0', className)}>
			<span className="text-[10px] font-medium uppercase tracking-[0.16em] text-dashboard-muted">{label}</span>
			<span className="text-right text-sm text-espresso">{value}</span>
		</div>
	);
}

function ContactRow({ icon, label, value, href }: { icon: ReactNode; label: string; value: string | null | undefined; href?: string }) {
	const display = value?.trim() ? value : '—';
	const content = href && value?.trim() ? (
		<a href={href} className="break-words text-sm text-espresso transition hover:text-camel-dark">
			{display}
		</a>
	) : (
		<p className="break-words text-sm text-espresso">{display}</p>
	);

	return (
		<div className="flex gap-3 rounded-xl bg-dashboard-bg/80 px-4 py-3 ring-1 ring-dashboard-border/50">
			<span className="mt-0.5 text-camel">{icon}</span>
			<div className="min-w-0 flex-1">
				<p className="text-[10px] uppercase tracking-[0.14em] text-dashboard-muted">{label}</p>
				<div className="mt-1">{content}</div>
			</div>
		</div>
	);
}

function TripDetailContent({ trip }: { trip: GuestTripDetail }) {
	const nights = countNights(trip.start_date, trip.end_date);
	const extrasTotal = trip.service_orders.reduce((sum, order) => sum + order.line_total, 0);
	const stayTotal = Math.max(0, trip.total_price - extrasTotal);
	const location = [trip.property.city, trip.property.country].filter(Boolean).join(', ');
	const hostAvatarUrl = trip.host.avatar_url ? cloudinaryDisplayUrl(trip.host.avatar_url) : '';
	const hostMonogram = profileInitials(trip.host.first_name, trip.host.last_name);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.25, delay: 0.06 }}
			className="min-h-0 flex-1 overflow-y-auto"
		>
			<div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
				<div className="relative overflow-hidden border-b border-dashboard-border bg-gradient-to-br from-dashboard-inset via-dashboard-panel to-cream px-6 py-8 sm:px-8 lg:border-b-0 lg:border-r">
					<div
						className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-camel/8 blur-2xl"
						aria-hidden
					/>
					<div
						className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-camel/30 to-transparent"
						aria-hidden
					/>

					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35, delay: 0.1 }}
					>
						<p className="text-[10px] uppercase tracking-[0.2em] text-camel">Your stay</p>
						<h4 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-espresso">{trip.property_title}</h4>
						{location ? (
							<p className="mt-3 flex items-start gap-2 text-sm text-dashboard-muted">
								<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-camel" aria-hidden />
								<span>
									{trip.property.address ? `${trip.property.address}, ` : ''}
									{location}
								</span>
							</p>
						) : null}

						<div className="mt-6 flex flex-wrap gap-2">
							<span className="rounded-full bg-white/70 px-3 py-1 text-xs capitalize text-espresso/75 ring-1 ring-dashboard-border/60">
								{trip.property.property_type.replace(/_/g, ' ')}
							</span>
							<span className="rounded-full bg-white/70 px-3 py-1 text-xs capitalize text-espresso/75 ring-1 ring-dashboard-border/60">
								{trip.property.room_type.replace(/_/g, ' ')}
							</span>
						</div>

						<div className="mt-8">
							<Link
								href={`/${encodeURIComponent(trip.property.slug)}`}
								target="_blank"
								rel="noopener noreferrer"
								className="group inline-flex items-center gap-2 text-sm font-medium text-camel-dark transition hover:text-camel"
							>
								<Home className="h-4 w-4" aria-hidden />
								View property
								<ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
							</Link>
						</div>
					</motion.div>
				</div>

				<div className="px-6 py-8 sm:px-8">
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35, delay: 0.16 }}
						className="space-y-8"
					>
						<section>
							<h5 className="font-serif text-lg tracking-tight text-espresso">Reservation</h5>
							<div className="mt-3 rounded-xl bg-dashboard-bg/60 px-4 ring-1 ring-dashboard-border/50">
								<DetailRow
									label="Dates"
									value={
										<span className="inline-flex items-center gap-1.5">
											<CalendarDays className="h-3.5 w-3.5 text-camel" aria-hidden />
											{formatEuropeanDateRange(trip.start_date, trip.end_date)}
										</span>
									}
								/>
								{nights ? <DetailRow label="Nights" value={nights} /> : null}
								<DetailRow
									label="Guests"
									value={
										<span className="inline-flex items-center gap-1.5">
											<Users className="h-3.5 w-3.5 text-camel" aria-hidden />
											{trip.guests}
										</span>
									}
								/>
								<DetailRow label="Booked" value={formatWhen(trip.created_at)} />
								<DetailRow label="Reference" value={formatBookingRef(trip.id)} />
							</div>
						</section>

						<section>
							<h5 className="font-serif text-lg tracking-tight text-espresso">Your host</h5>
							<div className="mt-4 flex items-start gap-4 rounded-xl bg-dashboard-bg/80 p-4 ring-1 ring-dashboard-border/50">
								{hostAvatarUrl ? (
									<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-dashboard-border/60">
										<Image src={hostAvatarUrl} alt={trip.host_name} fill className="object-cover" unoptimized />
									</div>
								) : (
									<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-camel/10 font-serif text-lg text-camel-dark ring-1 ring-dashboard-border/60">
										{hostMonogram}
									</div>
								)}
								<div className="min-w-0 flex-1">
									<p className="font-serif text-xl tracking-tight text-espresso">{trip.host_name}</p>
									{trip.host.host_name ? (
										<p className="mt-0.5 text-sm text-dashboard-muted">@{trip.host.host_name}</p>
									) : null}
								</div>
							</div>
							<div className="mt-3 space-y-2">
								<ContactRow
									icon={<Mail className="h-4 w-4" />}
									label="Email"
									value={trip.host.email}
									href={`mailto:${trip.host.email}`}
								/>
								<ContactRow
									icon={<Phone className="h-4 w-4" />}
									label="Phone"
									value={trip.host.phone}
									href={trip.host.phone ? `tel:${trip.host.phone}` : undefined}
								/>
							</div>
						</section>

						{trip.status !== BookingStatus.CANCELLED ? (
							<section>
								<HomeGuideShareCard host={trip.host} bookingId={trip.id} />
							</section>
						) : null}

						<section>
							<h5 className="font-serif text-lg tracking-tight text-espresso">Payment</h5>
							<div className="mt-3 rounded-xl bg-dashboard-bg/60 px-4 py-1 ring-1 ring-dashboard-border/50">
								<DetailRow label="Stay" value={formatMoney(stayTotal)} />
								{trip.service_orders.length > 0 ? (
									<>
										{trip.service_orders.map((order) => (
											<DetailRow
												key={order.id}
												label={`${order.name} × ${order.quantity}`}
												value={formatMoney(order.line_total)}
											/>
										))}
									</>
								) : null}
								<DetailRow
									label="Total"
									value={<span className="font-medium text-camel-dark">{formatMoney(trip.total_price)}</span>}
									className="border-t border-dashboard-border/80 pt-3"
								/>
							</div>
						</section>
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
}

function TripDetailSkeleton() {
	return (
		<div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
			<div className="grid gap-8 lg:grid-cols-2">
				<div className="space-y-4">
					<Skeleton className="h-3 w-16 bg-black/10" />
					<Skeleton className="h-8 w-3/4 bg-black/10" />
					<Skeleton className="h-4 w-full bg-black/10" />
					<Skeleton className="h-4 w-2/3 bg-black/10" />
				</div>
				<div className="space-y-6">
					<Skeleton className="h-24 w-full rounded-xl bg-black/10" />
					<Skeleton className="h-32 w-full rounded-xl bg-black/10" />
				</div>
			</div>
		</div>
	);
}

export function TripDetailModal({
	tripId,
	onClose,
}: {
	tripId: string | null;
	onClose: () => void;
}) {
	const open = tripId !== null;
	const { data: trip, isPending, isError } = useGuestTrip(tripId);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [open, onClose]);

	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4"
					role="presentation"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					onClick={onClose}
				>
					<div className="absolute inset-0 bg-espresso/40 backdrop-blur-[3px]" aria-hidden />
					<motion.div
						role="dialog"
						aria-modal
						aria-labelledby="trip-detail-title"
						className="relative z-10 flex max-h-[min(94vh,780px)] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-dashboard-panel shadow-[0_32px_100px_-28px_rgba(0,0,0,0.45)] sm:rounded-2xl"
						initial={{ opacity: 0, y: 48 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 32 }}
						transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
						onClick={(event) => event.stopPropagation()}
					>
						<div className="shrink-0 border-b border-dashboard-border/70 px-6 pb-5 pt-6 sm:px-8">
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2.5">
										<p className="text-[10px] uppercase tracking-[0.18em] text-camel">Trip details</p>
										{trip ? <StatusBadge status={trip.status} /> : null}
									</div>
									<h3
										id="trip-detail-title"
										className="mt-2 font-serif text-2xl tracking-tight text-espresso sm:text-[1.75rem]"
									>
										{trip?.property_title ?? 'Loading…'}
									</h3>
									{trip ? (
										<p className="mt-1.5 text-sm text-dashboard-muted">
											with {trip.host_name} · Ref {formatBookingRef(trip.id)}
										</p>
									) : null}
								</div>
								<Button type="button" variant="ghostPill" className="shrink-0 p-2" onClick={onClose} aria-label="Close">
									<X className="h-5 w-5" />
								</Button>
							</div>
						</div>

						{isPending ? <TripDetailSkeleton /> : null}
						{isError ? (
							<div className="px-6 py-12 text-center sm:px-8">
								<p className="font-serif text-xl text-espresso">Could not load trip details</p>
								<p className="mt-2 text-sm text-dashboard-muted">Please try again in a moment.</p>
							</div>
						) : null}
						{trip ? <TripDetailContent trip={trip} /> : null}

						<div className="flex shrink-0 justify-end border-t border-dashboard-border/70 bg-dashboard-panel px-6 py-4 sm:px-8">
							<Button type="button" variant="secondary" onClick={onClose}>
								Close
							</Button>
						</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}

export function TripRowChevron() {
	return (
		<ChevronRight
			className="ml-auto hidden h-4 w-4 shrink-0 text-camel/50 transition-transform group-hover:translate-x-0.5 group-hover:text-camel md:block"
			aria-hidden
		/>
	);
}
