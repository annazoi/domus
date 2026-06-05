'use client';

import { useMemo } from 'react';
import { X } from 'lucide-react';
import { Button, DatePickerField, Select } from '@/components/ui';
import { useHostCustomers } from '@/features/customers/hooks/use-host-customers';
import { useProperties } from '@/features/property/hooks/use-property';

export type BookingsFilters = {
	propertyId: string;
	customerId: string;
	dateFrom: string;
	dateTo: string;
};

export const emptyBookingsFilters = (): BookingsFilters => ({
	propertyId: '',
	customerId: '',
	dateFrom: '',
	dateTo: '',
});

export function hasActiveBookingsFilters(filters: BookingsFilters) {
	return Boolean(filters.propertyId || filters.customerId || filters.dateFrom || filters.dateTo);
}

type BookingsFiltersBarProps = {
	filters: BookingsFilters;
	onChange: (filters: BookingsFilters) => void;
};

function formatCustomerLabel(firstName: string, lastName: string, email: string) {
	const name = `${firstName} ${lastName}`.trim();
	return name || email;
}

export function BookingsFiltersBar({ filters, onChange }: BookingsFiltersBarProps) {
	const { data: properties = [] } = useProperties();
	const { data: customers = [] } = useHostCustomers(true);

	const sortedProperties = useMemo(
		() => [...properties].sort((a, b) => a.title.localeCompare(b.title)),
		[properties],
	);

	const sortedCustomers = useMemo(
		() =>
			[...customers].sort((a, b) =>
				formatCustomerLabel(a.first_name, a.last_name, a.email).localeCompare(
					formatCustomerLabel(b.first_name, b.last_name, b.email),
				),
			),
		[customers],
	);

	const setField = <K extends keyof BookingsFilters>(key: K, value: BookingsFilters[K]) => {
		onChange({ ...filters, [key]: value });
	};

	const clearFilters = () => {
		onChange(emptyBookingsFilters());
	};

	return (
		<div className="dashboard-panel rounded-2xl p-4 sm:p-5">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<div className="space-y-1.5">
						<label htmlFor="bookings-filter-property" className="text-xs uppercase tracking-[0.16em] text-camel">
							Property
						</label>
						<Select
							id="bookings-filter-property"
							variant="dashboard"
							value={filters.propertyId}
							onChange={(event) => setField('propertyId', event.target.value)}
						>
							<option value="">All properties</option>
							{sortedProperties.map((property) => (
								<option key={property.id} value={property.id}>
									{property.title}
								</option>
							))}
						</Select>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="bookings-filter-customer" className="text-xs uppercase tracking-[0.16em] text-camel">
							Customer
						</label>
						<Select
							id="bookings-filter-customer"
							variant="dashboard"
							value={filters.customerId}
							onChange={(event) => setField('customerId', event.target.value)}
						>
							<option value="">All customers</option>
							{sortedCustomers.map((customer) => (
								<option key={customer.id} value={customer.id}>
									{formatCustomerLabel(customer.first_name, customer.last_name, customer.email)}
								</option>
							))}
						</Select>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="bookings-filter-from" className="text-xs uppercase tracking-[0.16em] text-camel">
							From
						</label>
						<DatePickerField
							id="bookings-filter-from"
							value={filters.dateFrom}
							onChange={(value) => setField('dateFrom', value)}
							placeholder="Start date"
							className="[&_button]:rounded-xl [&_button]:py-2.5 [&_button]:text-sm"
						/>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="bookings-filter-to" className="text-xs uppercase tracking-[0.16em] text-camel">
							To
						</label>
						<DatePickerField
							id="bookings-filter-to"
							value={filters.dateTo}
							onChange={(value) => setField('dateTo', value)}
							placeholder="End date"
							minDate={filters.dateFrom || undefined}
							className="[&_button]:rounded-xl [&_button]:py-2.5 [&_button]:text-sm"
						/>
					</div>
				</div>

				{hasActiveBookingsFilters(filters) ? (
					<Button
						type="button"
						variant="ghostPill"
						onClick={clearFilters}
						className="shrink-0 text-sm text-espresso/65"
					>
						<X className="h-3.5 w-3.5 shrink-0" aria-hidden />
						Clear filters
					</Button>
				) : null}
			</div>
		</div>
	);
}
