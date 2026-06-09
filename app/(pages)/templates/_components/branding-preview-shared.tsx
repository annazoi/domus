'use client';

import Image from 'next/image';
import { cn } from '@/components/ui';
import { amenityOptionByValue, type AmenityId } from '@/config/constants/dropdowns/amenities.options';

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
