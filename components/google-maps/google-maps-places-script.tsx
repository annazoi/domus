'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

type GoogleMapsPlacesScriptProps = {
	/** Browser key with Maps JavaScript API + Places enabled. */
	apiKey: string | undefined;
	/** When false, the script tag is not rendered (e.g. defer until a tab is visible). */
	loadWhen?: boolean;
	onLoaded: () => void;
};

/**
 * Loads the Maps JavaScript API with the `places` library.
 * Calls `onLoaded` when the API is ready (including if it was already loaded earlier).
 */
export function GoogleMapsPlacesScript({
	apiKey,
	loadWhen = true,
	onLoaded,
}: GoogleMapsPlacesScriptProps) {
	const onLoadedRef = useRef(onLoaded);

	useEffect(() => {
		onLoadedRef.current = onLoaded;
	});

	useEffect(() => {
		if (typeof window !== 'undefined' && window.google?.maps?.places) {
			onLoadedRef.current();
		}
	}, []);

	if (!apiKey || !loadWhen) return null;

	return (
		<Script
			id="google-maps-places"
			src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
			strategy="lazyOnload"
			onLoad={() => onLoadedRef.current()}
		/>
	);
}
