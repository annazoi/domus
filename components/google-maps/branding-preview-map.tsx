'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BRANDING_PREVIEW_MAP_STYLES } from './branding-preview-map-styles';

type BrandingPreviewMapProps = {
	center?: { lat: number; lng: number };
	/** Used when Maps JS API is unavailable (no browser key). */
	embedSrc?: string;
	className?: string;
	zoom?: number;
	title?: string;
};

function mapsJsReady(): boolean {
	return typeof window !== 'undefined' && Boolean(window.google?.maps?.Map);
}

/**
 * Listing location for branding previews: styled roadmap via Maps JavaScript API when
 * `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set; otherwise the classic Google Maps embed iframe
 * (iframes cannot apply JSON map styles).
 */
export function BrandingPreviewMap({
	center,
	embedSrc,
	className,
	zoom = 15,
	title = 'Property location',
}: BrandingPreviewMapProps) {
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
	const useJsMap = Boolean(apiKey && center);
	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<google.maps.Map | null>(null);
	const [scriptReady, setScriptReady] = useState(mapsJsReady);

	const initMap = useCallback(() => {
		if (!useJsMap || !center || !containerRef.current) return;
		if (mapRef.current) return;
		const maps = window.google?.maps;
		if (!maps) return;
		const map = new maps.Map(containerRef.current, {
			center,
			zoom,
			styles: BRANDING_PREVIEW_MAP_STYLES,
			mapTypeControl: false,
			streetViewControl: false,
			fullscreenControl: false,
		});
		mapRef.current = map;
		maps.event.trigger(map, 'resize');
	}, [useJsMap, center, zoom]);

	useEffect(() => {
		if (!useJsMap) return;
		if (mapsJsReady()) initMap();
	}, [useJsMap, initMap, scriptReady]);

	useEffect(() => {
		return () => {
			mapRef.current = null;
		};
	}, []);

	if (useJsMap) {
		return (
			<>
				{!mapsJsReady() && apiKey ? (
					<Script
						id="google-maps-branding-preview"
						src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}`}
						strategy="lazyOnload"
						onLoad={() => {
							setScriptReady(true);
							queueMicrotask(() => initMap());
						}}
					/>
				) : null}
				<div ref={containerRef} className={className} title={title} />
			</>
		);
	}

	if (embedSrc) {
		return (
			<iframe
				title={title}
				src={embedSrc}
				className={className}
				loading="lazy"
				referrerPolicy="no-referrer-when-downgrade"
				allowFullScreen
			/>
		);
	}

	return null;
}
