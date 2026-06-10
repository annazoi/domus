'use client';

import { Play } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { VideoGalleryLightbox, cn, type ImageGalleryOriginRect } from '@/components/ui';
import {
	getVideoUrlSourceLabel,
	getVideoUrlThumbnail,
	resolveVideoUrlSource,
} from '@/lib/media/video-url';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';

type BrandingVideoSectionProps = {
	videos: BrandingPreviewDemo['videos'];
	variant: 'canvas' | 'mizu' | 'architectura';
	eyebrow?: string;
};

const variantStyles = {
	canvas: {
		eyebrow: 'font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.35em] text-[#0a0a0a]/40',
		grid: 'grid gap-4 sm:grid-cols-2',
		card: 'group relative aspect-[16/10] overflow-hidden border border-[#0a0a0a]/10 bg-[#0a0a0a]/5',
		caption:
			'absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0a0a]/75 to-transparent px-4 py-4 font-[family-name:var(--preview-hikari-body)] text-xs text-[#fcfcfa]/85',
		play: 'flex h-14 w-14 items-center justify-center rounded-full border border-[#fcfcfa]/30 bg-[#0a0a0a]/45 text-[#fcfcfa] backdrop-blur-sm transition group-hover:scale-105 group-hover:bg-[#d4a853] group-hover:text-[#0a0a0a]',
		label:
			'absolute left-3 top-3 rounded-full bg-[#fcfcfa]/90 px-2.5 py-1 font-[family-name:var(--preview-hikari-body)] text-[9px] font-medium uppercase tracking-[0.18em] text-[#0a0a0a]',
	},
	mizu: {
		eyebrow:
			'font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.28em] text-[#4d7c6f]',
		grid: 'grid gap-4 sm:grid-cols-2',
		card: 'group relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-[#2a4549]/15 ring-1 ring-[#6b9a8f]/15',
		caption:
			'absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a2e35]/80 to-transparent px-4 py-4 font-[family-name:var(--preview-mizu-body)] text-xs text-[#fff9f4]/90',
		play: 'flex h-14 w-14 items-center justify-center rounded-full bg-[#fff9f4]/15 text-[#fff9f4] ring-1 ring-[#fff9f4]/25 backdrop-blur-sm transition group-hover:scale-105 group-hover:bg-[#c4785a]',
		label:
			'absolute left-3 top-3 rounded-full bg-[#fff9f4]/90 px-2.5 py-1 font-[family-name:var(--preview-mizu-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1a2e35]',
	},
	architectura: {
		eyebrow:
			'font-[family-name:var(--preview-kaze-body)] text-[10px] font-medium uppercase tracking-[0.35em] text-[#6b8f9e]',
		grid: 'grid gap-4 sm:grid-cols-2',
		card: 'group relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#1c2430]/5 ring-1 ring-[#1c2430]/8',
		caption:
			'absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1c2430]/80 to-transparent px-4 py-4 font-[family-name:var(--preview-kaze-body)] text-xs text-[#fafbfc]/90',
		play: 'flex h-14 w-14 items-center justify-center rounded-full bg-[#fafbfc]/15 text-[#fafbfc] ring-1 ring-[#fafbfc]/25 backdrop-blur-sm transition group-hover:scale-105 group-hover:bg-[#6b8f9e]',
		label:
			'absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-[family-name:var(--preview-kaze-body)] text-[9px] font-medium uppercase tracking-[0.18em] text-[#1c2430]',
	},
} as const;

function VideoTile({
	video,
	index,
	styles,
	onOpen,
}: {
	video: BrandingPreviewDemo['videos'][number];
	index: number;
	styles: (typeof variantStyles)[keyof typeof variantStyles];
	onOpen: (index: number, origin: ImageGalleryOriginRect) => void;
}) {
	const tileRef = useRef<HTMLButtonElement>(null);
	const source = resolveVideoUrlSource(video.src, video.source);
	const thumbnailUrl = getVideoUrlThumbnail(video.src, source);

	return (
		<button
			ref={tileRef}
			type="button"
			onClick={() => {
				if (!tileRef.current) return;
				const rect = tileRef.current.getBoundingClientRect();
				onOpen(index, {
					top: rect.top,
					left: rect.left,
					width: rect.width,
					height: rect.height,
				});
			}}
			className={cn('cursor-pointer text-left', styles.card)}
		>
			{thumbnailUrl ? (
				<img src={thumbnailUrl} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
			) : (
				<video
					src={video.src}
					className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
					muted
					playsInline
					preload="metadata"
				/>
			)}
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
			<span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
				<span className={styles.play}>
					<Play className="h-5 w-5 fill-current" />
				</span>
			</span>
			<span className={styles.label}>{getVideoUrlSourceLabel(source)}</span>
			{video.description ? <p className={styles.caption}>{video.description}</p> : null}
		</button>
	);
}

export function BrandingVideoSection({ videos, variant, eyebrow = 'Video tour' }: BrandingVideoSectionProps) {
	const styles = variantStyles[variant];
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [galleryIndex, setGalleryIndex] = useState(0);
	const [galleryOrigin, setGalleryOrigin] = useState<ImageGalleryOriginRect | null>(null);
	const galleryItems = useMemo(
		() => videos.map((video) => ({ src: video.src, source: video.source })),
		[videos],
	);

	const openGallery = useCallback((index: number, origin: ImageGalleryOriginRect) => {
		setGalleryIndex(index);
		setGalleryOrigin(origin);
		setGalleryOpen(true);
	}, []);

	if (videos.length === 0) return null;

	return (
		<section>
			<p className={styles.eyebrow}>{eyebrow}</p>
			<div className={cn('mt-5', styles.grid, videos.length === 1 && 'sm:grid-cols-1')}>
				{videos.map((video, index) => (
					<VideoTile key={`${video.src}-${index}`} video={video} index={index} styles={styles} onOpen={openGallery} />
				))}
			</div>
			<VideoGalleryLightbox
				videos={galleryItems}
				open={galleryOpen}
				initialIndex={galleryIndex}
				originRect={galleryOrigin}
				onClose={() => setGalleryOpen(false)}
			/>
		</section>
	);
}
