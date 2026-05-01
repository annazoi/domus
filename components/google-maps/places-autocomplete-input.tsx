'use client';

import { useEffect, useRef, type ChangeEvent, type ComponentPropsWithoutRef } from 'react';
import { Input } from '@/components/ui/input';
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
		<div className="relative">
			<span
				aria-hidden
				className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[13px] text-[#6B705C]/70"
			>
				{placesLibraryReady ? <MapPin className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
			</span>
			<Input
				ref={inputRef}
				variant="default"
				className="pl-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
				{...inputProps}
				onChange={onChange}
			/>
		</div>
	);
}
