'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Mail, MessageCircle, Phone, Users, X } from 'lucide-react';
import { Button, Input, Select, Textarea, useToast } from '@/components/ui';
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
		return 'border-camel/20 bg-camel/10 text-camel-dark';
	}
	if (status === BookingStatus.CANCELLED) {
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

function Panel({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white/60">
			<div className="border-b border-black/[0.05] px-5 py-4 md:px-6">
				<h4 className="font-serif text-xl tracking-tight text-[#1A1A1A]">{title}</h4>
			</div>
			<div className="space-y-0 px-5 py-4 md:px-6">{children}</div>
		</section>
	);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<label className="block">
			<span className="text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/45">{label}</span>
			<div className="mt-1.5">{children}</div>
		</label>
	);
}

function ReadOnlyRow({ icon, label, value }: { icon: ReactNode; label: string; value: string | null | undefined }) {
	const display = value?.trim() ? value : '—';
	return (
		<div className="flex gap-3 border-b border-black/[0.05] py-4 last:border-b-0">
			<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.03] text-[#1A1A1A]/45">
				{icon}
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-[10px] uppercase tracking-[0.14em] text-[#1A1A1A]/40">{label}</p>
				<p className="mt-1 break-words text-base leading-snug text-[#1A1A1A]">{display}</p>
			</div>
		</div>
	);
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
		} catch {
			push({ title: 'Could not update booking', tone: 'error' });
		}
	};

	const displayName = form
		? `${form.first_name} ${form.last_name}`.trim() || booking?.guest_name || 'Guest'
		: booking?.guest_name || 'Guest';

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
										<StatusBadge status={form.status} />
									</div>
									<h3
										id="booking-detail-title"
										className="mt-3 break-words font-serif text-3xl tracking-tight text-[#1A1A1A] md:text-4xl"
									>
										{displayName}
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

						<form className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 md:py-7" onSubmit={handleSubmit}>
							<Link
								href={`/${encodeURIComponent(booking.property.slug)}`}
								target="_blank"
								rel="noopener noreferrer"
								className="group mb-6 flex items-center gap-3 rounded-2xl border border-black/[0.05] bg-white/60 px-5 py-4 transition hover:border-camel/20 hover:bg-white/80"
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
									<div className="grid gap-4 sm:grid-cols-2">
										<Field label="Check-in">
											<Input
												type="date"
												value={form.start_date}
												onChange={(event) => setField('start_date', event.target.value)}
												required
											/>
										</Field>
										<Field label="Check-out">
											<Input
												type="date"
												value={form.end_date}
												onChange={(event) => setField('end_date', event.target.value)}
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
												required
											/>
										</Field>
										<div className="sm:col-span-2">
											<Field label="Status">
												<Select
													value={form.status}
													onChange={(event) => setField('status', event.target.value as BookingStatus)}
												>
													<option value={BookingStatus.PENDING}>Pending</option>
													<option value={BookingStatus.CONFIRMED}>Confirmed</option>
													<option value={BookingStatus.CANCELLED}>Cancelled</option>
												</Select>
											</Field>
										</div>
									</div>
								</Panel>

								<Panel title="Guest account">
									<ReadOnlyRow
										icon={<Users className="h-4 w-4" />}
										label="Account name"
										value={`${booking.guest.first_name} ${booking.guest.last_name}`.trim()}
									/>
									<ReadOnlyRow icon={<Mail className="h-4 w-4" />} label="Email" value={booking.guest.email} />
									<ReadOnlyRow icon={<Phone className="h-4 w-4" />} label="Phone" value={booking.guest.phone} />
								</Panel>
							</div>

							<div className="mt-5">
								<Panel title="Booking profile">
									<div className="grid gap-4 sm:grid-cols-2">
										<Field label="First name">
											<Input
												value={form.first_name}
												onChange={(event) => setField('first_name', event.target.value)}
												required
											/>
										</Field>
										<Field label="Last name">
											<Input
												value={form.last_name}
												onChange={(event) => setField('last_name', event.target.value)}
												required
											/>
										</Field>
										<div className="sm:col-span-2">
											<Field label="Email">
												<Input
													type="email"
													value={form.email}
													onChange={(event) => setField('email', event.target.value)}
													required
												/>
											</Field>
										</div>
										<Field label="Phone">
											<Input value={form.phone} onChange={(event) => setField('phone', event.target.value)} />
										</Field>
										<Field label="VAT number">
											<Input value={form.vat_number} onChange={(event) => setField('vat_number', event.target.value)} />
										</Field>
										<div className="sm:col-span-2">
											<Field label="Address">
												<Input value={form.address} onChange={(event) => setField('address', event.target.value)} />
											</Field>
										</div>
										<Field label="City">
											<Input value={form.city} onChange={(event) => setField('city', event.target.value)} />
										</Field>
										<Field label="State">
											<Input value={form.state} onChange={(event) => setField('state', event.target.value)} />
										</Field>
										<Field label="ZIP">
											<Input value={form.zip} onChange={(event) => setField('zip', event.target.value)} />
										</Field>
										<Field label="Country">
											<Input value={form.country} onChange={(event) => setField('country', event.target.value)} />
										</Field>
										<div className="sm:col-span-2">
											<Field label="Notes">
												<Textarea value={form.notes} onChange={(event) => setField('notes', event.target.value)} />
											</Field>
										</div>
									</div>
								</Panel>
							</div>

							<div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-black/5 pt-5">
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
