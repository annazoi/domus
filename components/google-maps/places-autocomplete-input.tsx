'use client';

import { useEffect, useRef, type ChangeEvent, type ComponentPropsWithoutRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/ui/cn';
import { placeResultToSelection, type PlaceSelection } from './place-selection';
import { MapPin, Loader2 } from 'lucide-react';

type PlacesAutocompleteInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'onChange'> & {
	/** When true, attaches Google Places Autocomplete to this input. */
	placesLibraryReady: boolean;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onPlaceSelect: (place: PlaceSelection) => void;
};

/**
 * Controlled text input with optional Google Places Autocomplete when the library is loaded.
 */
export function PlacesAutocompleteInput({
	placesLibraryReady,
	onChange,
	onPlaceSelect,
	...inputProps
}: PlacesAutocompleteInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const onPlaceSelectRef = useRef(onPlaceSelect);

	useEffect(() => {
		onPlaceSelectRef.current = onPlaceSelect;
	});

	useEffect(() => {
		if (!placesLibraryReady || !inputRef.current) return;
		const g = typeof window !== 'undefined' ? window.google : undefined;
		if (!g?.maps?.places) return;

		const input = inputRef.current;
		const autocomplete = new g.maps.places.Autocomplete(input, {
			fields: ['address_components', 'geometry', 'formatted_address'],
		});

		const listener = autocomplete.addListener('place_changed', () => {
			const place = autocomplete.getPlace();
			const selection = placeResultToSelection(place);
			if (selection) {
				onPlaceSelectRef.current(selection);
			}
		});

		return () => {
			g.maps.event.removeListener(listener);
		};
	}, [placesLibraryReady]);

	return (
		<div
			className={cn(
				'places-address-field flex w-full items-center overflow-hidden rounded-xl border border-black/10 bg-white',
				'transition hover:border-camel/25 focus-within:border-camel/40 focus-within:ring-2 focus-within:ring-camel/12',
			)}
		>
			<span
				aria-hidden
				className="flex h-12 w-10 shrink-0 items-center justify-center text-dashboard-muted"
			>
				{placesLibraryReady ? (
					<MapPin className="h-4 w-4 shrink-0" strokeWidth={1.75} />
				) : (
					<Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={1.75} />
				)}
			</span>
			<Input
				ref={inputRef}
				variant="plain"
				className="min-w-0 flex-1 py-3 pr-4 text-sm shadow-none"
				{...inputProps}
				onChange={onChange}
			/>
		</div>
	);
}
