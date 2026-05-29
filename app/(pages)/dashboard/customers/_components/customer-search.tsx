'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui';
import type { HostCustomerRow } from '@/features/customers/interfaces/host-customer.interface';
import {
	CUSTOMER_SEARCH_MIN_LENGTH,
	getCustomerDisplayName,
	searchHostCustomers,
} from '../_utils/filter-host-customers';

type CustomerSearchProps = {
	customers: HostCustomerRow[];
	value: string;
	onChange: (query: string) => void;
	onSelectCustomer: (customer: HostCustomerRow) => void;
};

export function CustomerSearch({ customers, value, onChange, onSelectCustomer }: CustomerSearchProps) {
	const listboxId = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);

	const trimmed = value.trim();
	const searchEnabled = trimmed.length >= CUSTOMER_SEARCH_MIN_LENGTH;

	const suggestions = useMemo(
		() => searchHostCustomers(customers, value),
		[customers, value],
	);

	useEffect(() => {
		setActiveIndex(-1);
	}, [value, suggestions.length]);

	useEffect(() => {
		const handlePointerDown = (event: MouseEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('pointerdown', handlePointerDown);
		return () => document.removeEventListener('pointerdown', handlePointerDown);
	}, []);

	const selectCustomer = (customer: HostCustomerRow) => {
		onSelectCustomer(customer);
		onChange(getCustomerDisplayName(customer));
		setIsOpen(false);
		setActiveIndex(-1);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (!searchEnabled || suggestions.length === 0) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			setIsOpen(true);
			setActiveIndex((index) => (index + 1) % suggestions.length);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			setIsOpen(true);
			setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
			return;
		}

		if (event.key === 'Enter' && activeIndex >= 0) {
			event.preventDefault();
			selectCustomer(suggestions[activeIndex]);
			return;
		}

		if (event.key === 'Escape') {
			setIsOpen(false);
			setActiveIndex(-1);
		}
	};

	return (
		<div ref={rootRef} className="relative">
			<label htmlFor="customer-search" className="sr-only">
				Search customers
			</label>
			<div className="relative">
				<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/40" aria-hidden />
				<Input
					id="customer-search"
					type="search"
					value={value}
					onChange={(event) => {
						onChange(event.target.value);
						setIsOpen(true);
					}}
					onFocus={() => {
						if (searchEnabled) setIsOpen(true);
					}}
					onKeyDown={handleKeyDown}
					placeholder="Search by name, email, phone, or location…"
					className="min-h-12 rounded-2xl border-black/[0.06] bg-white/80 py-3 pl-11 pr-11 text-base shadow-sm backdrop-blur-sm"
					autoComplete="off"
					role="combobox"
					aria-expanded={isOpen && searchEnabled}
					aria-controls={listboxId}
					aria-autocomplete="list"
				/>
				{value ? (
					<button
						type="button"
						onClick={() => {
							onChange('');
							setIsOpen(false);
							setActiveIndex(-1);
						}}
						className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#1A1A1A]/45 transition hover:bg-black/[0.04] hover:text-[#1A1A1A]"
						aria-label="Clear search"
					>
						<X className="h-4 w-4" />
					</button>
				) : null}
			</div>

			{trimmed.length > 0 && trimmed.length < CUSTOMER_SEARCH_MIN_LENGTH ? (
				<p className="mt-2 text-xs text-[#1A1A1A]/45">
					Type at least {CUSTOMER_SEARCH_MIN_LENGTH} characters to search.
				</p>
			) : null}

			{isOpen && searchEnabled ? (
				<div
					id={listboxId}
					role="listbox"
					className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-lg"
				>
					{suggestions.length === 0 ? (
						<p className="px-4 py-3 text-sm text-[#1A1A1A]/45">No customers found.</p>
					) : (
						suggestions.map((customer, index) => {
							const name = getCustomerDisplayName(customer);
							const location = [customer.city, customer.country].filter(Boolean).join(', ');
							return (
								<button
									key={customer.id}
									type="button"
									role="option"
									aria-selected={activeIndex === index}
									onMouseEnter={() => setActiveIndex(index)}
									onClick={() => selectCustomer(customer)}
									className={`flex w-full flex-col gap-0.5 border-b border-black/[0.04] px-4 py-3 text-left last:border-b-0 ${
										activeIndex === index ? 'bg-camel/10' : 'hover:bg-black/[0.02]'
									}`}
								>
									<span className="font-medium text-[#1A1A1A]">{name}</span>
									<span className="text-sm text-[#1A1A1A]/55">{customer.email}</span>
									{location ? <span className="text-xs text-[#1A1A1A]/45">{location}</span> : null}
								</button>
							);
						})
					)}
				</div>
			) : null}
		</div>
	);
}
