'use client';

import { useEffect, useRef, type ChangeEvent, type ComponentPropsWithoutRef } from 'react';
import { Input } from '@/components/ui/input';
import { placeResultToSelection, type PlaceSelection } from './place-selection';

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

	return <Input ref={inputRef} variant="default" {...inputProps} onChange={onChange} />;
}
