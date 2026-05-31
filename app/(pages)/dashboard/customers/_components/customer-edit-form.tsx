'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
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

export function CustomerEditForm({
	customer,
	onUpdated,
}: {
	customer: HostCustomerRow;
	onUpdated?: (customer: HostCustomerRow) => void;
}) {
	const { push } = useToast();
	const { mutateAsync: saveCustomer, isPending: saving } = useUpdateHostCustomer();
	const [form, setForm] = useState<CustomerFormState>(() => toFormState(customer));

	useEffect(() => {
		setForm(toFormState(customer));
	}, [customer]);

	const setField = <K extends keyof CustomerFormState>(key: K, value: CustomerFormState[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

		const payload = toPayload(form);
		if (!payload.first_name || !payload.last_name || !payload.email) {
			push({ title: 'First name, last name, and email are required.', tone: 'error' });
			return;
		}

		try {
			const updated = await saveCustomer({ id: customer.id, input: payload });
			onUpdated?.(updated);
			push({ title: 'Customer updated', tone: 'success' });
		} catch {
			push({ title: 'Could not update customer', tone: 'error' });
		}
	};

	return (
		<form className="dashboard-panel rounded-2xl px-5 py-6 sm:px-8 md:py-8" onSubmit={handleSubmit}>
			<div className="grid gap-5 sm:grid-cols-2">
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
				<div className="sm:col-span-2">
					<Field label="Email">
						<Input
							type="email"
							value={form.email}
							onChange={(event) => setField('email', event.target.value)}
							placeholder="guest@example.com"
							required
						/>
					</Field>
				</div>
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
				<div className="sm:col-span-2">
					<Field label="Address">
						<Input
							value={form.address}
							onChange={(event) => setField('address', event.target.value)}
							placeholder="Street address"
						/>
					</Field>
				</div>
				<Field label="City">
					<Input value={form.city} onChange={(event) => setField('city', event.target.value)} placeholder="City" />
				</Field>
				<Field label="State">
					<Input
						value={form.state}
						onChange={(event) => setField('state', event.target.value)}
						placeholder="State or region"
					/>
				</Field>
				<Field label="ZIP">
					<Input value={form.zip} onChange={(event) => setField('zip', event.target.value)} placeholder="Postal code" />
				</Field>
				<Field label="Country">
					<Input value={form.country} onChange={(event) => setField('country', event.target.value)} placeholder="Country" />
				</Field>
				<div className="sm:col-span-2">
					<Field label="Notes">
						<Textarea
							value={form.notes}
							onChange={(event) => setField('notes', event.target.value)}
							placeholder="Internal notes about this guest…"
						/>
					</Field>
				</div>
			</div>

			<div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-black/5 pt-5">
				<Button type="submit" variant="primary" disabled={saving}>
					{saving ? 'Saving…' : 'Save changes'}
				</Button>
			</div>
		</form>
	);
}
