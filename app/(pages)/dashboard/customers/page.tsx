'use client';

import { useState } from 'react';
import { useHostCustomers } from '@/features/customers/hooks/use-host-customers';
import type { HostCustomerRow } from '@/features/customers/interfaces/host-customer.interface';
import { CustomerDetailModal } from './_components/customer-detail-modal';
import { HostCustomersList } from './_components/host-customers-list';

export default function CustomersPage() {
	const { data: customers = [], isLoading } = useHostCustomers(true);
	const [selected, setSelected] = useState<HostCustomerRow | null>(null);

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Customers</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Your guests</h1>
			</div>

			<HostCustomersList customers={customers} loading={isLoading} onSelect={setSelected} />

			<CustomerDetailModal
				open={selected !== null}
				customer={selected}
				onClose={() => setSelected(null)}
				onUpdated={(customer) => setSelected(customer)}
			/>
		</div>
	);
}
