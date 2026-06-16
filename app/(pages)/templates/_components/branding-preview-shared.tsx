'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/components/ui';
import { amenityOptionByValue, type AmenityId } from '@/config/constants/dropdowns/amenities.options';
import {
	getVideoHeroEmbedUrl,
	getVideoPreviewPlayback,
	resolveVideoUrlSource,
	type VideoUrlSource,
} from '@/lib/media/video-url';

export const brandingPreviewInteractiveClass =
	'[&_button:not(:disabled)]:cursor-pointer [&_a]:cursor-pointer';

export function AmenityGlyph({
	id,
	className,
}: {
	id: AmenityId;
	className?: string;
}) {
	const Icon = amenityOptionByValue[id]?.icon;
	if (!Icon) return null;
	return <Icon strokeWidth={1.25} className={cn('h-8 w-8', className)} />;
}

export function BrandingWordmark({
	wordmark,
	logoSrc,
	logoAlt,
	className,
	logoClassName,
}: {
	wordmark: string;
	logoSrc?: string;
	logoAlt?: string;
	className?: string;
	logoClassName?: string;
}) {
	const src = logoSrc?.trim();
	const alt = logoAlt?.trim() || wordmark;
	if (src) {
		return (
			<span className={cn('relative inline-flex max-h-10 max-w-[180px] items-center', className)}>
				<Image
					src={src}
					alt={alt}
					width={180}
					height={40}
					className={cn('h-auto max-h-10 w-auto max-w-[180px] object-contain object-left', logoClassName)}
					unoptimized
				/>
			</span>
		);
	}
	return <span className={className}>{wordmark}</span>;
}

export function BrandingHostProfileLink({
	hostName,
	listingPreview,
	className,
	children,
}: {
	hostName: string;
	listingPreview?: boolean;
	className?: string;
	children: ReactNode;
}) {
	const slug = hostName.trim();
	if (!listingPreview || !slug) return <>{children}</>;

	return (
		<Link href={`/${encodeURIComponent(slug)}`} className={cn('group/host block cursor-pointer', className)}>
			{children}
		</Link>
	);
}

export function BrandingHeroMedia({
	imageSrc = '',
	videoSrc = '',
	videoSource,
	className,
	sizes = '100vw',
	priority,
	onImageClick,
}: {
	imageSrc?: string;
	videoSrc?: string;
	videoSource?: VideoUrlSource;
	className?: string;
	sizes?: string;
	priority?: boolean;
	onImageClick?: () => void;
}) {
	const video = videoSrc.trim();
	const poster = imageSrc.trim();

	if (video) {
		const source = resolveVideoUrlSource(video, videoSource);
		const playback = getVideoPreviewPlayback(video, source);
		const embedUrl = getVideoHeroEmbedUrl(video, source) ?? (playback.kind === 'embed' ? playback.embedUrl : null);

		if (embedUrl) {
			return (
				<div className={cn('relative size-full min-h-full overflow-hidden', className)}>
					{poster ? (
						<Image src={poster} alt="" fill className="object-cover" sizes={sizes} priority={priority} unoptimized />
					) : null}
					<iframe
						src={embedUrl}
						title=""
						className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[300%] w-[300%] max-w-none -translate-x-1/2 -translate-y-1/2 border-0"
						allow="autoplay; fullscreen; picture-in-picture"
						tabIndex={-1}
					/>
				</div>
			);
		}

		if (playback.kind === 'file') {
			return (
				<div className={cn('relative size-full min-h-full overflow-hidden', className)}>
					{poster ? (
						<Image src={poster} alt="" fill className="object-cover" sizes={sizes} priority={priority} unoptimized />
					) : null}
					<video
						src={playback.src}
						className="absolute inset-0 z-[1] size-full object-cover"
						autoPlay
						muted
						loop
						playsInline
						preload="metadata"
					/>
				</div>
			);
		}
	}

	const img = poster;
	if (!img) return null;

	const image = (
		<Image src={img} alt="" fill className="object-cover" sizes={sizes} priority={priority} unoptimized />
	);

	if (onImageClick) {
		return (
			<button type="button" onClick={onImageClick} className={cn('relative block cursor-pointer', className)}>
				{image}
			</button>
		);
	}

	return <div className={cn('relative', className)}>{image}</div>;
}

export function FillImg({
	src,
	className,
	sizes,
	imgClassName,
}: {
	src: string;
	className: string;
	sizes: string;
	imgClassName?: string;
}) {
	if (!src.trim()) return null;
	return (
		<div className={cn('relative overflow-hidden', className)}>
			<Image src={src} alt="" fill className={cn('object-cover', imgClassName)} sizes={sizes} unoptimized />
		</div>
	);
}
