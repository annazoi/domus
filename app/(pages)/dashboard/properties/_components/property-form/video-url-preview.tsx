'use client';

import { Play } from 'lucide-react';
import {
	getVideoUrlSourceLabel,
	getVideoUrlThumbnail,
	resolveVideoUrlSource,
	type VideoUrlSource,
} from '@/lib/media/video-url';

type VideoUrlPreviewProps = {
	url: string;
	source: VideoUrlSource;
	sourceLabel?: boolean;
	className?: string;
};

export function VideoUrlPreview({ url, source, sourceLabel = true, className = '' }: VideoUrlPreviewProps) {
	const resolvedSource = resolveVideoUrlSource(url, source);
	const thumbnailUrl = getVideoUrlThumbnail(url, resolvedSource);

	return (
		<>
			{thumbnailUrl ? (
				<img src={thumbnailUrl} alt="" className={`h-full w-full object-cover ${className}`.trim()} />
			) : (
				<video
					src={url}
					className={`h-full w-full object-cover ${className}`.trim()}
					muted
					playsInline
					preload="metadata"
				/>
			)}
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
			<span className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
				<Play className="h-5 w-5 fill-current" />
			</span>
			{sourceLabel ? (
				<span className="absolute left-3 top-3 rounded-full bg-dashboard-surface/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-espresso">
					{getVideoUrlSourceLabel(resolvedSource)}
				</span>
			) : null}
			<span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10px] text-white/90">
				{url}
			</span>
		</>
	);
}
