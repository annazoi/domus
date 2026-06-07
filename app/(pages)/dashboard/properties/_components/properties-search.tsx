'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui';
import { PROPERTIES_SEARCH_MIN_LENGTH } from '@/features/property/services/property.services';

type PropertiesSearchProps = {
	value: string;
	onChange: (query: string) => void;
};

export function hasActivePropertiesSearch(query: string) {
	return query.trim().length >= PROPERTIES_SEARCH_MIN_LENGTH;
}

export function PropertiesSearch({ value, onChange }: PropertiesSearchProps) {
	const trimmed = value.trim();

	return (
		<div className="relative">
			<label htmlFor="properties-search" className="sr-only">
				Search properties
			</label>
			<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/40" aria-hidden />
			<Input
				id="properties-search"
				type="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Search by title, slug, city, address, or reference…"
				className="dashboard-panel min-h-12 rounded-2xl py-3 pl-11 pr-11 text-base"
				autoComplete="off"
			/>
			{value ? (
				<button
					type="button"
					onClick={() => onChange('')}
					className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-espresso/45 transition hover:bg-dashboard-row-hover hover:text-espresso"
					aria-label="Clear search"
				>
					<X className="h-4 w-4" />
				</button>
			) : null}
			{trimmed.length > 0 && trimmed.length < PROPERTIES_SEARCH_MIN_LENGTH ? (
				<p className="mt-2 text-xs text-espresso/45">
					Type at least {PROPERTIES_SEARCH_MIN_LENGTH} characters to search.
				</p>
			) : null}
		</div>
	);
}
