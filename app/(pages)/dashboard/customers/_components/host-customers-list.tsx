'use client';

import { Button, Skeleton } from '@/components/ui';
import type { HostCustomerRow } from '@/features/customers/interfaces/host-customer.interface';
import { CUSTOMER_SEARCH_MIN_LENGTH } from '../_utils/filter-host-customers';
import { CustomerTotalSpent } from './customer-total-spent';

type HostCustomersListProps = {
	customers: HostCustomerRow[];
	loading: boolean;
	searchQuery?: string;
	onSelect: (customer: HostCustomerRow) => void;
};

export function HostCustomersList({ customers, loading, searchQuery = '', onSelect }: HostCustomersListProps) {
	if (loading) {
		return (
			<div className="overflow-hidden rounded-2xl bg-white/80">
				{Array.from({ length: 4 }).map((_, index) => (
					<div
						key={index}
						className="flex flex-col gap-3 border-b border-black/5 px-5 py-5 md:flex-row md:flex-wrap md:items-center md:gap-x-8 md:px-8 lg:px-10"
					>
						<Skeleton className="h-5 w-40 bg-black/10 md:h-6" />
						<Skeleton className="h-4 flex-1 min-w-[12rem] bg-black/10" />
						<Skeleton className="h-4 w-24 bg-black/10" />
						<Skeleton className="h-4 w-28 bg-black/10 md:ml-auto" />
					</div>
				))}
			</div>
		);
	}

	if (customers.length === 0) {
		const hasActiveSearch = searchQuery.trim().length >= CUSTOMER_SEARCH_MIN_LENGTH;
		return (
			<div className="rounded-2xl bg-white/80 p-8 text-center">
				<p className="font-serif text-2xl">{hasActiveSearch ? 'No matching customers' : 'No customers yet'}</p>
				<p className="mt-2 text-sm text-[#1A1A1A]/60">
					{hasActiveSearch
						? 'Try a different name, email, phone number, or location.'
						: 'Customers appear after guests book your properties with billing details on file.'}
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl bg-white/80">
			{customers.map((customer) => {
				const name = `${customer.first_name} ${customer.last_name}`.trim() || 'Customer';
				const location = [customer.city, customer.country].filter(Boolean).join(', ');
				return (
					<Button
						type="button"
						key={customer.id}
						variant="custom"
						className="cursor-pointer flex h-auto w-full flex-col items-start gap-2 border-b border-black/5 px-5 py-5 text-left font-normal transition hover:bg-black/[0.02] last:border-b-0 md:flex-row md:flex-wrap md:items-baseline md:gap-x-8 md:gap-y-2 md:px-8 md:py-6 lg:gap-x-12 lg:px-10"
						onClick={() => onSelect(customer)}
					>
						<div className="min-w-0 shrink-0 md:max-w-[14rem]">
							<p className="text-lg font-medium leading-snug md:text-xl">{name}</p>
							<p className="mt-0.5 truncate text-sm text-[#1A1A1A]/65 md:text-base">{customer.email}</p>
							{customer.phone ? (
								<p className="mt-0.5 text-sm text-[#1A1A1A]/55">{customer.phone}</p>
							) : null}
						</div>
						<p className="min-w-0 flex-1 text-base leading-snug text-[#1A1A1A]/70 md:text-lg">
							{location || '—'}
						</p>
						<span className="shrink-0 text-sm text-[#1A1A1A]/70 md:text-base">
							{customer.booking_count} {customer.booking_count === 1 ? 'booking' : 'bookings'}
						</span>
						<CustomerTotalSpent
							amount={customer.total_spent}
							className="shrink-0 text-sm font-medium text-camel md:ml-auto md:text-base"
						/>
					</Button>
				);
			})}
		</div>
	);
}
