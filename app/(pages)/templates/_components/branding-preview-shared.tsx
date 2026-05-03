'use client';

import Image from 'next/image';
import {
	Flame,
	Sparkles,
	UtensilsCrossed,
	Waves,
	Wifi,
	Wine,
} from 'lucide-react';
import { cn } from '@/components/ui';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';

export function AmenityGlyph({
	id,
	className,
}: {
	id: BrandingPreviewDemo['amenities'][number]['id'];
	className?: string;
}) {
	const iconClass = cn('h-8 w-8', className);
	switch (id) {
		case 'pool':
			return <Waves strokeWidth={1.25} className={iconClass} />;
		case 'fire':
			return <Flame strokeWidth={1.25} className={iconClass} />;
		case 'utensils':
			return <UtensilsCrossed strokeWidth={1.25} className={iconClass} />;
		case 'spa':
			return <Sparkles strokeWidth={1.25} className={iconClass} />;
		case 'wine':
			return <Wine strokeWidth={1.25} className={iconClass} />;
		case 'wifi':
			return <Wifi strokeWidth={1.25} className={iconClass} />;
		default:
			return null;
	}
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
