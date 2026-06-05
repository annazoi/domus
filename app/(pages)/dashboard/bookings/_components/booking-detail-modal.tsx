'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Mail, MessageCircle, Phone, Users, X } from 'lucide-react';
import { Button, DatePickerField, Input, Select, Textarea, cn, useToast } from '@/components/ui';
import { useUpdateBooking } from '@/features/bookings/hooks/use-bookings';
import { BookingStatus } from '@/features/bookings/interfaces/booking-status';
import type { HostBookingDetail, UpdateHostBookingInput } from '@/features/bookings/interfaces/booking.interface';
import { useCreateConversation } from '@/features/messaging/hooks/use-conversations';

type BookingFormState = {
	start_date: string;
	end_date: string;
	guests: string;
	total_price: string;
	status: BookingStatus;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	vat_number: string;
	notes: string;
	address: string;
	city: string;
	state: string;
	zip: string;
	country: string;
};

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

function statusStyles(status: BookingStatus) {
	if (status === BookingStatus.CONFIRMED) {
		return 'bg-camel/12 text-camel-dark';
	}
	if (status === BookingStatus.CANCELLED) {
		return 'bg-dashboard-bg text-dashboard-muted line-through decoration-dashboard-muted/40';
	}
	return 'bg-dashboard-surface text-dashboard-muted';
}

function StatusBadge({ status }: { status: BookingStatus }) {
	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize tracking-wide ${statusStyles(status)}`}
		>
			{status}
		</span>
	);
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
	return (
		<section className={cn('space-y-3', className)}>
			<h4 className="font-serif text-lg tracking-tight text-espresso">{title}</h4>
			{children}
		</section>
	);
}

function FieldGroup({ children, className }: { children: ReactNode; className?: string }) {
	return <div className={cn('grid gap-3 sm:grid-cols-2', className)}>{children}</div>;
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
	return (
		<label className={cn('block min-w-0', className)}>
			<span className="text-[10px] font-medium uppercase tracking-[0.14em] text-dashboard-muted">{label}</span>
			<div className="mt-1.5 min-w-0 rounded-lg bg-dashboard-bg px-3 py-2">{children}</div>
		</label>
	);
}

function MetaRow({ icon, label, value }: { icon: ReactNode; label: string; value: string | null | undefined }) {
	const display = value?.trim() ? value : '—';
	return (
		<div className="flex gap-3 rounded-lg bg-dashboard-bg px-3 py-2.5">
			<span className="mt-0.5 text-dashboard-muted">{icon}</span>
			<div className="min-w-0 flex-1">
				<p className="text-[10px] uppercase tracking-[0.14em] text-dashboard-muted">{label}</p>
				<p className="mt-0.5 break-words text-sm leading-snug text-espresso">{display}</p>
			</div>
		</div>
	);
}

const modalFields = cn(
	'[&_input:not(.sr-only)]:w-full [&_input:not(.sr-only)]:border-0 [&_input:not(.sr-only)]:!bg-transparent [&_input:not(.sr-only)]:px-0 [&_input:not(.sr-only)]:py-1',
	'[&_input:not(.sr-only)]:text-espresso [&_input:not(.sr-only)]:placeholder:text-dashboard-muted/50',
	'[&_input:not(.sr-only)]:shadow-none [&_input:not(.sr-only)]:focus:ring-0 [&_input:not(.sr-only)]:rounded-none',
	'[&_textarea]:w-full [&_textarea]:border-0 [&_textarea]:!bg-transparent [&_textarea]:px-0 [&_textarea]:py-1',
	'[&_textarea]:text-espresso [&_textarea]:placeholder:text-dashboard-muted/50 [&_textarea]:shadow-none [&_textarea]:focus:ring-0',
	'[&_button[role=combobox]]:w-full [&_button[role=combobox]]:border-0 [&_button[role=combobox]]:!bg-transparent',
	'[&_button[role=combobox]]:px-0 [&_button[role=combobox]]:py-1 [&_button[role=combobox]]:shadow-none',
	'[&_button[role=combobox]]:focus-visible:ring-0',
	'[&_.domus-date-picker-field_button]:w-full [&_.domus-date-picker-field_button]:border-0',
	'[&_.domus-date-picker-field_button]:!bg-transparent [&_.domus-date-picker-field_button]:px-0',
	'[&_.domus-date-picker-field_button]:py-1 [&_.domus-date-picker-field_button]:text-espresso',
	'[&_.domus-date-picker-field_button]:shadow-none [&_.domus-date-picker-field_button]:focus-visible:ring-0',
);

function formatMoney(value: number) {
	return `$${value.toFixed(2)}`;
}

function toFormState(booking: HostBookingDetail): BookingFormState {
	return {
		start_date: booking.start_date,
		end_date: booking.end_date,
		guests: String(booking.guests),
		total_price: String(booking.total_price),
		status: booking.status,
		first_name: booking.customer.first_name,
		last_name: booking.customer.last_name,
		email: booking.customer.email,
		phone: booking.customer.phone ?? '',
		vat_number: booking.customer.vat_number ?? '',
		notes: booking.customer.notes ?? '',
		address: booking.customer.address ?? '',
		city: booking.customer.city ?? '',
		state: booking.customer.state ?? '',
		zip: booking.customer.zip ?? '',
		country: booking.customer.country ?? '',
	};
}

function toPayload(form: BookingFormState): UpdateHostBookingInput | null {
	const optional = (value: string) => {
		const trimmed = value.trim();
		return trimmed ? trimmed : null;
	};

	const guests = Number.parseInt(form.guests, 10);
	const total_price = Number.parseFloat(form.total_price);
	if (!Number.isInteger(guests) || guests < 1) return null;
	if (!Number.isFinite(total_price) || total_price < 0) return null;

	const first_name = form.first_name.trim();
	const last_name = form.last_name.trim();
	const email = form.email.trim();
	if (!first_name || !last_name || !email) return null;
	if (!form.start_date || !form.end_date) return null;

	return {
		start_date: form.start_date,
		end_date: form.end_date,
		guests,
		total_price,
		status: form.status,
		customer: {
			first_name,
			last_name,
			email,
			phone: optional(form.phone),
			vat_number: optional(form.vat_number),
			notes: optional(form.notes),
			address: optional(form.address),
			city: optional(form.city),
			state: optional(form.state),
			zip: optional(form.zip),
			country: optional(form.country),
		},
	};
}

export function BookingDetailModal({
	open,
	booking,
	onClose,
	onUpdated,
}: {
	open: boolean;
	booking: HostBookingDetail | null;
	onClose: () => void;
	onUpdated?: (booking: HostBookingDetail) => void;
}) {
	const router = useRouter();
	const { push } = useToast();
	const createConversation = useCreateConversation();
	const { mutateAsync: saveBooking, isPending: saving } = useUpdateBooking();
	const [form, setForm] = useState<BookingFormState | null>(null);

	useEffect(() => {
		if (booking) setForm(toFormState(booking));
	}, [booking]);

	useEffect(() => {
		if (!open) return;
		const blockEscapeClose = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				event.stopPropagation();
			}
		};
		document.addEventListener('keydown', blockEscapeClose, true);
		return () => document.removeEventListener('keydown', blockEscapeClose, true);
	}, [open]);

	const setField = <K extends keyof BookingFormState>(key: K, value: BookingFormState[K]) => {
		setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
	};

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

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (!booking || !form) return;

		const payload = toPayload(form);
		if (!payload) {
			push({ title: 'Check the form — dates, guests, price, and guest details are required.', tone: 'error' });
			return;
		}

		try {
			const updated = await saveBooking({ id: booking.id, input: payload });
			onUpdated?.(updated);
			push({ title: 'Booking updated', tone: 'success' });
			onClose();
		} catch {
			push({ title: 'Could not update booking', tone: 'error' });
		}
	};

	const displayName = form
		? `${form.first_name} ${form.last_name}`.trim() || booking?.guest_name || 'Guest'
		: booking?.guest_name || 'Guest';
	const extrasTotal = booking?.service_orders.reduce((sum, order) => sum + order.line_total, 0) ?? 0;
	const stayTotal = Math.max(0, (booking?.total_price ?? 0) - extrasTotal);

	return (
		<AnimatePresence>
			{open && booking && form ? (
				<motion.div
					className="fixed inset-0 z-[80] flex items-center justify-center p-4"
					role="presentation"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.18 }}
				>
					<div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" aria-hidden />
					<motion.div
						role="dialog"
						aria-modal
						aria-labelledby="booking-detail-title"
						className="relative z-10 flex max-h-[min(92vh,860px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-dashboard-panel shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] lg:max-w-5xl"
						initial={{ opacity: 0, scale: 0.96, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: 10 }}
						transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
						onClick={(event) => event.stopPropagation()}
					>
						<div className="shrink-0 px-6 pb-4 pt-6 sm:px-8">
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2.5">
										<p className="text-[10px] uppercase tracking-[0.18em] text-camel">Booking</p>
										<StatusBadge status={form.status} />
									</div>
									<h3
										id="booking-detail-title"
										className="mt-2 break-words font-serif text-2xl tracking-tight text-espresso sm:text-3xl"
									>
										{displayName}
									</h3>
									<p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-dashboard-muted">
										<Link
											href={`/${encodeURIComponent(booking.property.slug)}`}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 text-espresso transition hover:text-camel-dark"
										>
											<Home className="h-3.5 w-3.5 shrink-0 text-camel" aria-hidden />
											{booking.property_title}
										</Link>
										<span aria-hidden>·</span>
										<span>Ref {formatBookingRef(booking.id)}</span>
										<span aria-hidden>·</span>
										<span>{formatWhen(booking.created_at)}</span>
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-1">
									{/* <Button
										type="button"
										variant="ghostPill"
										className="flex items-center gap-2 px-3 py-2 text-sm"
										onClick={openMessages}
										disabled={createConversation.isPending}
									>
										<MessageCircle className="h-4 w-4" />
										Message
									</Button> */}
									<Button type="button" variant="ghostPill" className="shrink-0 p-2" onClick={onClose} aria-label="Close">
										<X className="h-5 w-5" />
									</Button>
								</div>
							</div>
						</div>

						<form className={cn('flex min-h-0 flex-1 flex-col', modalFields)} onSubmit={handleSubmit}>
							<div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-8">
								<div className="grid gap-8 lg:grid-cols-2">
									<Section title="Stay details">
										<FieldGroup>
											<Field label="Check-in">
												<DatePickerField
													value={form.start_date}
													onChange={(value) => setField('start_date', value)}
													placeholder="Check-in date"
													required
												/>
											</Field>
											<Field label="Check-out">
												<DatePickerField
													value={form.end_date}
													onChange={(value) => setField('end_date', value)}
													placeholder="Check-out date"
													minDate={form.start_date}
													required
												/>
											</Field>
											<Field label="Guests">
												<Input
													type="number"
													min={1}
													step={1}
													value={form.guests}
													onChange={(event) => setField('guests', event.target.value)}
													placeholder="2"
													required
												/>
											</Field>
											<Field label="Total price">
												<Input
													type="number"
													min={0}
													step="0.01"
													value={form.total_price}
													onChange={(event) => setField('total_price', event.target.value)}
													placeholder="0.00"
													required
												/>
											</Field>
											<Field label="Status" className="sm:col-span-2">
												<Select
													value={form.status}
													onChange={(event) => setField('status', event.target.value as BookingStatus)}
												>
													<option value={BookingStatus.PENDING}>Pending</option>
													<option value={BookingStatus.CONFIRMED}>Confirmed</option>
													<option value={BookingStatus.CANCELLED}>Cancelled</option>
												</Select>
											</Field>
										</FieldGroup>
									</Section>

									<Section title="Guest account">
										<div className="space-y-2">
											<MetaRow
												icon={<Users className="h-4 w-4" />}
												label="Account name"
												value={`${booking.guest.first_name} ${booking.guest.last_name}`.trim()}
											/>
											<MetaRow icon={<Mail className="h-4 w-4" />} label="Email" value={booking.guest.email} />
											<MetaRow icon={<Phone className="h-4 w-4" />} label="Phone" value={booking.guest.phone} />
										</div>
									</Section>
								</div>

								{booking.service_orders.length > 0 ? (
									<Section title="Guest extras" className="mt-8">
										<div className="space-y-2">
											{booking.service_orders.map((order) => (
												<div
													key={order.id}
													className="flex items-start justify-between gap-3 rounded-lg bg-dashboard-bg px-3 py-2.5"
												>
														<div className="min-w-0">
															<p className="text-sm leading-snug text-espresso">{order.name}</p>
															<p className="mt-0.5 text-xs text-dashboard-muted">
																{formatMoney(order.unit_price)} × {order.quantity}
															</p>
														</div>
														<p className="shrink-0 text-sm text-camel-dark">{formatMoney(order.line_total)}</p>
													</div>
												))}
											<div className="rounded-lg bg-dashboard-bg px-3 py-2.5 text-sm">
												<div className="space-y-1.5">
													<div className="flex justify-between gap-3 text-dashboard-muted">
														<span>Stay</span>
														<span>{formatMoney(stayTotal)}</span>
													</div>
													<div className="flex justify-between gap-3 text-dashboard-muted">
														<span>Extras</span>
														<span>{formatMoney(extrasTotal)}</span>
													</div>
													<div className="flex justify-between gap-3 font-medium text-espresso">
														<span>Total</span>
														<span>{formatMoney(booking.total_price)}</span>
													</div>
												</div>
											</div>
										</div>
									</Section>
								) : null}

								<Section title="Booking profile" className="mt-8">
									<FieldGroup>
										<Field label="First name">
											<Input
												value={form.first_name}
												onChange={(event) => setField('first_name', event.target.value)}
												placeholder="First name"
												required
											/>
										</Field>
										<Field label="Last name">
											<Input
												value={form.last_name}
												onChange={(event) => setField('last_name', event.target.value)}
												placeholder="Last name"
												required
											/>
										</Field>
										<Field label="Email" className="sm:col-span-2">
											<Input
												type="email"
												value={form.email}
												onChange={(event) => setField('email', event.target.value)}
												placeholder="guest@example.com"
												required
											/>
										</Field>
										<Field label="Phone">
											<Input
												value={form.phone}
												onChange={(event) => setField('phone', event.target.value)}
												placeholder="+1 555 000 0000"
											/>
										</Field>
										<Field label="VAT number">
											<Input
												value={form.vat_number}
												onChange={(event) => setField('vat_number', event.target.value)}
												placeholder="Optional"
											/>
										</Field>
										<Field label="Address" className="sm:col-span-2">
											<Input
												value={form.address}
												onChange={(event) => setField('address', event.target.value)}
												placeholder="Street address"
											/>
										</Field>
										<Field label="City">
											<Input
												value={form.city}
												onChange={(event) => setField('city', event.target.value)}
												placeholder="City"
											/>
										</Field>
										<Field label="State">
											<Input
												value={form.state}
												onChange={(event) => setField('state', event.target.value)}
												placeholder="State or region"
											/>
										</Field>
										<Field label="ZIP">
											<Input
												value={form.zip}
												onChange={(event) => setField('zip', event.target.value)}
												placeholder="Postal code"
											/>
										</Field>
										<Field label="Country">
											<Input
												value={form.country}
												onChange={(event) => setField('country', event.target.value)}
												placeholder="Country"
											/>
										</Field>
										<Field label="Notes" className="sm:col-span-2">
											<Textarea
												value={form.notes}
												onChange={(event) => setField('notes', event.target.value)}
												placeholder="Internal notes about this booking…"
												className="min-h-24"
											/>
										</Field>
									</FieldGroup>
								</Section>
							</div>

							<div className="flex shrink-0 flex-wrap justify-end gap-3 bg-dashboard-panel px-6 py-4 shadow-[0_-12px_32px_-20px_rgba(0,0,0,0.12)] sm:px-8">
								<Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
									Close
								</Button>
								<Button type="submit" variant="primary" disabled={saving}>
									{saving ? 'Saving…' : 'Save changes'}
								</Button>
							</div>
						</form>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
