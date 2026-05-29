'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
	CalendarRange,
	Home,
	Mail,
	MapPin,
	MessageCircle,
	Phone,
	Receipt,
	StickyNote,
	Users,
	X,
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { HostBookingDetail } from '@/features/bookings/interfaces/booking.interface';
import { useCreateConversation } from '@/features/messaging/hooks/use-conversations';
import { formatOverviewCurrency } from '../../_utils/compute-overview-stats';

type BookingStatus = HostBookingDetail['status'];

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

function formatDateRange(start: string, end: string) {
	return `${start} – ${end}`;
}

function formatBookingRef(id: string) {
	return id.slice(0, 8).toUpperCase();
}

function statusStyles(status: BookingStatus) {
	if (status === 'confirmed') {
		return 'border-camel/20 bg-camel/10 text-camel-dark';
	}
	if (status === 'cancelled') {
		return 'border-black/8 bg-black/[0.04] text-[#1A1A1A]/45 line-through decoration-[#1A1A1A]/25';
	}
	return 'border-camel/15 bg-cream text-camel-deep';
}

function StatusBadge({ status }: { status: BookingStatus }) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize tracking-wide ${statusStyles(status)}`}
		>
			{status}
		</span>
	);
}

function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
	return (
		<div className="relative overflow-hidden rounded-xl border border-black/[0.05] bg-white/70 px-4 py-4 backdrop-blur-sm">
			<div
				className="pointer-events-none absolute inset-0 opacity-60"
				style={{
					backgroundImage:
						'radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--color-camel) 10%, transparent), transparent 55%)',
				}}
			/>
			<div className="relative flex items-start gap-3">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-camel/10 text-camel-dark">
					{icon}
				</div>
				<div className="min-w-0">
					<p className="text-[10px] uppercase tracking-[0.16em] text-[#1A1A1A]/45">{label}</p>
					<p className="mt-1 break-words font-serif text-xl leading-tight tracking-tight text-[#1A1A1A]">{value}</p>
				</div>
			</div>
		</div>
	);
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white/60">
			<div className="border-b border-black/[0.05] px-5 py-4 md:px-6">
				<h4 className="font-serif text-xl tracking-tight text-[#1A1A1A]">{title}</h4>
			</div>
			<div className="space-y-0 px-5 py-1 md:px-6">{children}</div>
		</section>
	);
}

function DetailRow({
	icon,
	label,
	value,
	href,
}: {
	icon: ReactNode;
	label: string;
	value: string | null | undefined;
	href?: string;
}) {
	const display = value?.trim() ? value : '—';
	const content = href && value?.trim() ? (
		<a href={href} className="break-words text-base text-camel-dark transition hover:text-camel">
			{display}
		</a>
	) : (
		<p className="break-words text-base leading-snug text-[#1A1A1A]">{display}</p>
	);

	return (
		<div className="flex gap-3 border-b border-black/[0.05] py-4 last:border-b-0">
			<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.03] text-[#1A1A1A]/45">
				{icon}
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-[10px] uppercase tracking-[0.14em] text-[#1A1A1A]/40">{label}</p>
				<div className="mt-1">{content}</div>
			</div>
		</div>
	);
}

function hasCustomerDetails(booking: HostBookingDetail) {
	const { customer } = booking;
	return Boolean(
		customer.vat_number?.trim() ||
			customer.notes?.trim() ||
			customer.address?.trim() ||
			customer.city?.trim() ||
			customer.state?.trim() ||
			customer.zip?.trim() ||
			customer.country?.trim(),
	);
}

function formatCustomerLocation(customer: HostBookingDetail['customer']) {
	const parts = [customer.address, customer.city, customer.state, customer.zip, customer.country]
		.map((part) => part?.trim())
		.filter(Boolean);
	return parts.length > 0 ? parts.join(', ') : null;
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
	const router = useRouter();
	const createConversation = useCreateConversation();

	const openMessages = () => {
		if (!booking) return;
		createConversation.mutate(
			{ property_id: booking.property_id, guest_user_id: booking.guest_user_id },
			{
				onSuccess: (conversation) => {
					onClose();
					router.push(`/dashboard/messages?conversation=${conversation.id}`);
				},
			},
		);
	};

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
					<div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" aria-hidden />
					<motion.div
						role="dialog"
						aria-modal
						aria-labelledby="booking-detail-title"
						className="relative z-10 flex max-h-[min(90vh,820px)] w-full max-w-[min(100vw-2rem,28rem)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-cream shadow-xl sm:max-w-2xl md:max-w-3xl"
						initial={{ opacity: 0, scale: 0.96, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: 10 }}
						transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
						onClick={(event) => event.stopPropagation()}
					>
						<div className="relative shrink-0 overflow-hidden border-b border-black/[0.06] px-5 py-6 sm:px-8">
							<div
								className="pointer-events-none absolute inset-0"
								style={{
									backgroundImage:
										'linear-gradient(135deg, color-mix(in srgb, var(--color-camel) 14%, transparent), transparent 48%), radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--color-camel) 18%, transparent), transparent 42%)',
								}}
							/>
							<div className="relative flex items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-3">
										<p className="text-xs uppercase tracking-[0.2em] text-camel">Booking</p>
										<StatusBadge status={booking.status} />
									</div>
									<h3
										id="booking-detail-title"
										className="mt-3 break-words font-serif text-3xl tracking-tight text-[#1A1A1A] md:text-4xl"
									>
										{booking.guest_name}
									</h3>
									<p className="mt-2 text-sm text-[#1A1A1A]/55">
										Ref {formatBookingRef(booking.id)} · Booked {formatWhen(booking.created_at)}
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<Button
										type="button"
										variant="ghostPill"
										className="gap-2 px-3 py-2 text-sm"
										onClick={openMessages}
										disabled={createConversation.isPending}
									>
										<MessageCircle className="h-4 w-4" />
										Message
									</Button>
									<Button type="button" variant="ghostPill" className="shrink-0 p-2" onClick={onClose} aria-label="Close">
										<X className="h-5 w-5" />
									</Button>
								</div>
							</div>
						</div>

						<div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 md:py-7">
							<div className="grid gap-3 sm:grid-cols-3">
								<StatTile
									icon={<CalendarRange className="h-4 w-4" />}
									label="Stay"
									value={formatDateRange(booking.start_date, booking.end_date)}
								/>
								<StatTile
									icon={<Users className="h-4 w-4" />}
									label="Guests"
									value={String(booking.guests)}
								/>
								<StatTile
									icon={<Receipt className="h-4 w-4" />}
									label="Total"
									value={
										Number.isFinite(booking.total_price)
											? formatOverviewCurrency(booking.total_price)
											: '—'
									}
								/>
							</div>

							<div className="mt-6 space-y-5">
								<Link
									href={`/${encodeURIComponent(booking.property.slug)}`}
									target="_blank"
									rel="noopener noreferrer"
									onClick={onClose}
									className="group flex items-center gap-3 rounded-2xl border border-black/[0.05] bg-white/60 px-5 py-4 transition hover:border-camel/20 hover:bg-white/80"
								>
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-camel/10 text-camel-dark">
										<Home className="h-4 w-4" />
									</div>
									<div className="min-w-0">
										<p className="text-[10px] uppercase tracking-[0.16em] text-[#1A1A1A]/45">Property</p>
										<p className="mt-1 break-words font-serif text-xl tracking-tight text-[#1A1A1A] transition group-hover:text-camel-dark">
											{booking.property_title}
										</p>
									</div>
								</Link>

								<div className="grid gap-5 lg:grid-cols-2">
									<Panel title="Stay details">
										<DetailRow icon={<CalendarRange className="h-4 w-4" />} label="Check-in" value={formatWhen(booking.check_in_iso)} />
										<DetailRow icon={<CalendarRange className="h-4 w-4" />} label="Check-out" value={formatWhen(booking.check_out_iso)} />
										<DetailRow
											icon={<Receipt className="h-4 w-4" />}
											label="Last updated"
											value={formatWhen(booking.updated_at)}
										/>
									</Panel>

									<Panel title="Guest contact">
										<DetailRow
											icon={<Users className="h-4 w-4" />}
											label="Account name"
											value={`${booking.guest.first_name} ${booking.guest.last_name}`.trim()}
										/>
										<DetailRow
											icon={<Mail className="h-4 w-4" />}
											label="Email"
											value={booking.guest.email}
											href={booking.guest.email ? `mailto:${booking.guest.email}` : undefined}
										/>
										<DetailRow
											icon={<Phone className="h-4 w-4" />}
											label="Phone"
											value={booking.guest.phone}
											href={booking.guest.phone ? `tel:${booking.guest.phone}` : undefined}
										/>
									</Panel>
								</div>

								{(hasCustomerDetails(booking) ||
									`${booking.customer.first_name} ${booking.customer.last_name}`.trim() !==
										`${booking.guest.first_name} ${booking.guest.last_name}`.trim() ||
									booking.customer.email !== booking.guest.email ||
									booking.customer.phone !== booking.guest.phone) ? (
									<Panel title="Booking profile">
										<DetailRow
											icon={<Users className="h-4 w-4" />}
											label="Name on booking"
											value={`${booking.customer.first_name} ${booking.customer.last_name}`.trim()}
										/>
										<DetailRow
											icon={<Mail className="h-4 w-4" />}
											label="Email"
											value={booking.customer.email}
											href={booking.customer.email ? `mailto:${booking.customer.email}` : undefined}
										/>
										<DetailRow
											icon={<Phone className="h-4 w-4" />}
											label="Phone"
											value={booking.customer.phone}
											href={booking.customer.phone ? `tel:${booking.customer.phone}` : undefined}
										/>
										{booking.customer.vat_number?.trim() ? (
											<DetailRow icon={<Receipt className="h-4 w-4" />} label="VAT" value={booking.customer.vat_number} />
										) : null}
										{formatCustomerLocation(booking.customer) ? (
											<DetailRow
												icon={<MapPin className="h-4 w-4" />}
												label="Address"
												value={formatCustomerLocation(booking.customer)}
											/>
										) : null}
										{booking.customer.notes?.trim() ? (
											<DetailRow icon={<StickyNote className="h-4 w-4" />} label="Notes" value={booking.customer.notes} />
										) : null}
									</Panel>
								) : null}
							</div>
						</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
