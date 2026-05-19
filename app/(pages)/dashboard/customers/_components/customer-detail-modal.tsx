'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button, Input, Textarea, useToast } from '@/components/ui';
import { useUpdateHostCustomer } from '@/features/customers/hooks/use-host-customers';
import type { HostCustomerRow, UpdateHostCustomerInput } from '@/features/customers/interfaces/host-customer.interface';

type CustomerFormState = {
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

function toFormState(customer: HostCustomerRow): CustomerFormState {
	return {
		first_name: customer.first_name,
		last_name: customer.last_name,
		email: customer.email,
		phone: customer.phone ?? '',
		vat_number: customer.vat_number ?? '',
		notes: customer.notes ?? '',
		address: customer.address ?? '',
		city: customer.city ?? '',
		state: customer.state ?? '',
		zip: customer.zip ?? '',
		country: customer.country ?? '',
	};
}

function toPayload(form: CustomerFormState): UpdateHostCustomerInput {
	const optional = (value: string) => {
		const trimmed = value.trim();
		return trimmed ? trimmed : null;
	};

	return {
		first_name: form.first_name.trim(),
		last_name: form.last_name.trim(),
		email: form.email.trim(),
		phone: optional(form.phone),
		vat_number: optional(form.vat_number),
		notes: optional(form.notes),
		address: optional(form.address),
		city: optional(form.city),
		state: optional(form.state),
		zip: optional(form.zip),
		country: optional(form.country),
	};
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<label className="block">
			<span className="text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/45">{label}</span>
			<div className="mt-1.5">{children}</div>
		</label>
	);
}

export function CustomerDetailModal({
	open,
	customer,
	onClose,
	onUpdated,
}: {
	open: boolean;
	customer: HostCustomerRow | null;
	onClose: () => void;
	onUpdated: (customer: HostCustomerRow) => void;
}) {
	const { push } = useToast();
	const { mutateAsync: saveCustomer, isPending: saving } = useUpdateHostCustomer();
	const [form, setForm] = useState<CustomerFormState | null>(null);

	useEffect(() => {
		if (customer) setForm(toFormState(customer));
	}, [customer]);

	const setField = <K extends keyof CustomerFormState>(key: K, value: CustomerFormState[K]) => {
		setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (!customer || !form) return;

		const payload = toPayload(form);
		if (!payload.first_name || !payload.last_name || !payload.email) {
			push({ title: 'First name, last name, and email are required.', tone: 'error' });
			return;
		}

		try {
			const updated = await saveCustomer({ id: customer.id, input: payload });
			onUpdated(updated);
			push({ title: 'Customer updated', tone: 'success' });
		} catch {
			push({ title: 'Could not update customer', tone: 'error' });
		}
	};

	return (
		<AnimatePresence>
			{open && customer && form ? (
				<motion.div
					className="fixed inset-0 z-[80] flex items-center justify-center p-4"
					role="presentation"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.18 }}
				>
					<div className="absolute inset-0 bg-black/45" aria-hidden />
					<motion.div
						role="dialog"
						aria-modal
						aria-labelledby="customer-detail-title"
						className="relative z-10 flex max-h-[min(90vh,800px)] w-full max-w-[min(100vw-2rem,28rem)] flex-col rounded-2xl border border-black/10 bg-white shadow-xl sm:max-w-2xl md:max-w-3xl"
						initial={{ opacity: 0, scale: 0.96, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: 10 }}
						transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/5 px-5 py-5 sm:px-8 md:py-6">
							<div className="min-w-0 flex-1">
								<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Customer</p>
								<h3
									id="customer-detail-title"
									className="mt-1 break-words font-serif text-2xl tracking-tight text-[#1A1A1A] md:text-3xl"
								>
									{`${customer.first_name} ${customer.last_name}`.trim() || 'Customer'}
								</h3>
								<p className="mt-2 text-sm text-[#1A1A1A]/60">
									{customer.booking_count} {customer.booking_count === 1 ? 'booking' : 'bookings'} ·{' '}
									{Number.isFinite(customer.total_spent) ? customer.total_spent.toFixed(2) : '—'} spent
								</p>
							</div>
							<Button type="button" variant="ghostPill" className="shrink-0 p-2" onClick={onClose} aria-label="Close">
								<X className="h-5 w-5" />
							</Button>
						</div>

						<form className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2 sm:px-8 md:pb-8" onSubmit={handleSubmit}>
							<div className="grid gap-5 sm:grid-cols-2">
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
									<Input
										value={form.vat_number}
										onChange={(event) => setField('vat_number', event.target.value)}
									/>
								</Field>
								<div className="sm:col-span-2">
									<Field label="Address">
										<Input
											value={form.address}
											onChange={(event) => setField('address', event.target.value)}
										/>
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

							<div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-black/5 pt-5">
								<Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
									Cancel
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
