'use client';

import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import type { HostCustomerRow } from '@/features/customers/interfaces/host-customer.interface';
import { CustomerBookingsList } from './customer-bookings-list';
import { CustomerEditForm } from './customer-edit-form';
import { CustomerTotalSpent } from './customer-total-spent';

export const CUSTOMER_DETAIL_TAB = {
	BOOKINGS: 'bookings',
	PROFILE: 'profile',
} as const;

export type CustomerDetailTab = (typeof CUSTOMER_DETAIL_TAB)[keyof typeof CUSTOMER_DETAIL_TAB];

const tabs: { id: CustomerDetailTab; label: string }[] = [
	{ id: CUSTOMER_DETAIL_TAB.BOOKINGS, label: 'Bookings' },
	{ id: CUSTOMER_DETAIL_TAB.PROFILE, label: 'Profile' },
];

export function CustomerDetailView({
	customer,
	activeTab,
	onTabChange,
	onBack,
	onUpdated,
}: {
	customer: HostCustomerRow;
	activeTab: CustomerDetailTab;
	onTabChange: (tab: CustomerDetailTab) => void;
	onBack: () => void;
	onUpdated?: (customer: HostCustomerRow) => void;
}) {
	const name = `${customer.first_name} ${customer.last_name}`.trim() || 'Customer';
	const location = [customer.city, customer.country].filter(Boolean).join(', ');

	return (
		<motion.div
			className="space-y-6"
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
		>
			<Button
				type="button"
				variant="ghostPill"
				onClick={onBack}
				className="group -ml-2 flex items-center gap-2 px-3 py-2 text-sm text-[#1A1A1A]/60 transition hover:text-[#1A1A1A]"
			>
				<ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
				All customers
			</Button>

			<div className="rounded-2xl border border-black/[0.04] bg-white/80 px-5 py-6 sm:px-8 md:py-8">
				<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div className="min-w-0">
						<p className="text-xs uppercase tracking-[0.2em] text-camel">Customer</p>
						<h2 className="mt-1 break-words font-serif text-3xl tracking-tight text-[#1A1A1A] md:text-4xl">
							{name}
						</h2>
						<p className="mt-2 text-sm text-[#1A1A1A]/60">{customer.email}</p>
						{customer.phone ? <p className="mt-0.5 text-sm text-[#1A1A1A]/55">{customer.phone}</p> : null}
						{location ? <p className="mt-1 text-sm text-[#1A1A1A]/50">{location}</p> : null}
					</div>
					<div className="flex shrink-0 flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-[#1A1A1A]/65">
						<span>
							{customer.booking_count} {customer.booking_count === 1 ? 'booking' : 'bookings'}
						</span>
						<span className="text-[#1A1A1A]/25">·</span>
						<CustomerTotalSpent amount={customer.total_spent} className="font-medium text-camel" />
					</div>
				</div>

				<nav
					className="mt-8 flex gap-1 border-b border-black/5"
					role="tablist"
					aria-label="Customer sections"
				>
					{tabs.map((tab) => {
						const selected = activeTab === tab.id;
						return (
							<Button
								key={tab.id}
								type="button"
								role="tab"
								aria-selected={selected}
								id={`customer-tab-${tab.id}`}
								variant="custom"
								onClick={() => onTabChange(tab.id)}
								className={`relative rounded-none border-0 bg-transparent px-4 py-3 text-sm font-medium transition ${
									selected
										? 'text-[#1A1A1A] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-camel'
										: 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]/80 cursor-pointer'
								}`}
							>
								{tab.label}
							</Button>
						);
					})}
				</nav>
			</div>

			<div
				role="tabpanel"
				id={`customer-panel-${activeTab}`}
				aria-labelledby={`customer-tab-${activeTab}`}
			>
				{activeTab === CUSTOMER_DETAIL_TAB.BOOKINGS ? (
					<CustomerBookingsList customerId={customer.id} />
				) : (
					<CustomerEditForm customer={customer} onUpdated={onUpdated} />
				)}
			</div>
		</motion.div>
	);
}
