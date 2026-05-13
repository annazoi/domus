'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';

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

function Row({ label, value }: { label: string; value: string | null | undefined }) {
	const display = value?.trim() ? value : '—';
	return (
		<div className="border-b border-black/[0.06] py-4 md:py-5">
			<dt className="text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/45">{label}</dt>
			<dd className="mt-1.5 max-w-none break-words text-base leading-snug text-[#1A1A1A] md:text-lg md:leading-relaxed">
				{display}
			</dd>
		</div>
	);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section>
			<h4 className="font-serif text-xl tracking-tight text-[#1A1A1A] md:text-2xl">{title}</h4>
			<dl className="mt-4 md:mt-5">{children}</dl>
		</section>
	);
}

export function BookingDetailModal({
	open,
	booking,
	onClose,
}: {
	open: boolean;
	booking: HostBookingDetail | null;
	onClose: () => void;
}) {
	return (
		<AnimatePresence>
			{open && booking ? (
				<motion.div
					className="fixed inset-0 z-[80] flex items-center justify-center p-4"
					role="presentation"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.18 }}
					onClick={onClose}
				>
					<div className="absolute inset-0 bg-black/45" aria-hidden />
					<motion.div
						role="dialog"
						aria-modal
						aria-labelledby="booking-detail-title"
						className="relative z-10 flex max-h-[min(90vh,800px)] w-full max-w-[min(100vw-2rem,28rem)] flex-col rounded-2xl border border-black/10 bg-white shadow-xl sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl"
						initial={{ opacity: 0, scale: 0.96, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: 10 }}
						transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/5 px-5 py-5 sm:px-8 md:px-10 md:py-6">
							<div className="min-w-0 flex-1">
								<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Booking</p>
								<h3
									id="booking-detail-title"
									className="mt-1 break-words font-serif text-2xl tracking-tight text-[#1A1A1A] md:text-3xl lg:text-4xl"
								>
									{booking.property_title}
								</h3>
								<p className="mt-2 text-sm capitalize text-[#1A1A1A]/60 md:text-base">{booking.status}</p>
							</div>
							<Button type="button" variant="ghostPill" className="shrink-0 p-2" onClick={onClose} aria-label="Close">
								<X className="h-5 w-5" />
							</Button>
						</div>
						<div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2 sm:px-8 md:px-10 md:pb-8">
							<div className="space-y-8 md:space-y-10 lg:grid lg:grid-cols-2 lg:gap-x-14 lg:gap-y-14 lg:space-y-0">
								<Section title="Reservation">
								<Row label="Booking id" value={booking.id} />
								<Row label="Check-in" value={formatWhen(booking.check_in_iso)} />
								<Row label="Check-out" value={formatWhen(booking.check_out_iso)} />
								<Row label="Dates (calendar)" value={`${booking.start_date} → ${booking.end_date}`} />
								<Row label="Guests" value={String(booking.guests)} />
								<Row
									label="Total"
									value={Number.isFinite(booking.total_price) ? booking.total_price.toFixed(2) : '—'}
								/>
								<Row label="Created" value={formatWhen(booking.created_at)} />
								<Row label="Updated" value={formatWhen(booking.updated_at)} />
							</Section>
							<Section title="Property">
								<Row label="Title" value={booking.property_title} />
								<Row label="Slug" value={booking.property.slug} />
								<Row label="Type" value={booking.property.property_type} />
								<Row label="Room" value={booking.property.room_type} />
								<Row label="Address" value={booking.property.address} />
								<Row label="City" value={booking.property.city} />
								<Row label="Country" value={booking.property.country} />
							</Section>
							<Section title="Guest account">
								<Row label="Name" value={`${booking.guest.first_name} ${booking.guest.last_name}`.trim()} />
								<Row label="Email" value={booking.guest.email} />
								<Row label="Phone" value={booking.guest.phone} />
							</Section>
							<Section title="Guest profile (booking)">
								<Row label="Name" value={`${booking.customer.first_name} ${booking.customer.last_name}`.trim()} />
								<Row label="Email" value={booking.customer.email} />
								<Row label="Phone" value={booking.customer.phone} />
								<Row label="VAT" value={booking.customer.vat_number} />
								<Row label="Notes" value={booking.customer.notes} />
								<Row label="Address" value={booking.customer.address} />
								<Row label="City" value={booking.customer.city} />
								<Row label="State" value={booking.customer.state} />
								<Row label="ZIP" value={booking.customer.zip} />
								<Row label="Country" value={booking.customer.country} />
							</Section>
							</div>
						</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
