'use client';

import { Bath, BedDouble, Clock3, Home, Users } from 'lucide-react';
import { cn } from '@/components/ui';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';

type BrandingStayDetailsSectionProps = {
	stay: BrandingPreviewDemo['stay'];
	variant: 'canvas' | 'mizu' | 'architectura';
	eyebrow?: string;
};

const variantStyles = {
	canvas: {
		eyebrow: 'font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.35em] text-[#0a0a0a]/40',
		grid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3',
		card: 'border border-[#0a0a0a]/10 bg-[#fcfcfa] px-4 py-4',
		label: 'font-[family-name:var(--preview-hikari-body)] text-[9px] uppercase tracking-[0.22em] text-[#0a0a0a]/40',
		value: 'mt-1 font-[family-name:var(--preview-hikari-display)] text-sm font-semibold uppercase tracking-wider text-[#0a0a0a]',
		icon: 'h-4 w-4 text-[#d4a853]',
	},
	mizu: {
		eyebrow:
			'font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.28em] text-[#4d7c6f]',
		grid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3',
		card: 'rounded-2xl border border-[#6b9a8f]/15 bg-[#fff9f4] px-4 py-4',
		label: 'font-[family-name:var(--preview-mizu-body)] text-[9px] font-semibold uppercase tracking-wider text-[#1a2e35]/45',
		value: 'mt-1 font-[family-name:var(--preview-mizu-body)] text-sm font-medium text-[#1a2e35]',
		icon: 'h-4 w-4 text-[#4d7c6f]',
	},
	architectura: {
		eyebrow:
			'font-[family-name:var(--preview-kaze-body)] text-[10px] font-medium uppercase tracking-[0.35em] text-[#6b8f9e]',
		grid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3',
		card: 'rounded-xl border border-[#1c2430]/8 bg-white/60 px-4 py-4 backdrop-blur-sm',
		label: 'font-[family-name:var(--preview-kaze-body)] text-[9px] font-medium uppercase tracking-[0.22em] text-[#1c2430]/40',
		value: 'mt-1 font-[family-name:var(--preview-kaze-body)] text-sm font-medium text-[#1c2430]',
		icon: 'h-4 w-4 text-[#6b8f9e]',
	},
} as const;

function pluralize(count: number, singular: string, plural: string) {
	return `${count} ${count === 1 ? singular : plural}`;
}

export function BrandingStayDetailsSection({
	stay,
	variant,
	eyebrow = 'The stay',
}: BrandingStayDetailsSectionProps) {
	const styles = variantStyles[variant];
	const items = [
		stay.propertyType ? { icon: Home, label: 'Property type', value: stay.propertyType } : null,
		stay.roomType ? { icon: Home, label: 'Room type', value: stay.roomType } : null,
		stay.maxGuests > 0 ? { icon: Users, label: 'Guests', value: pluralize(stay.maxGuests, 'guest', 'guests') } : null,
		stay.bedrooms > 0 ? { icon: BedDouble, label: 'Bedrooms', value: pluralize(stay.bedrooms, 'bedroom', 'bedrooms') } : null,
		stay.beds > 0 ? { icon: BedDouble, label: 'Beds', value: pluralize(stay.beds, 'bed', 'beds') } : null,
		stay.bathrooms > 0 ? { icon: Bath, label: 'Bathrooms', value: pluralize(stay.bathrooms, 'bathroom', 'bathrooms') } : null,
		stay.checkIn ? { icon: Clock3, label: 'Check-in', value: stay.checkIn } : null,
		stay.checkOut ? { icon: Clock3, label: 'Check-out', value: stay.checkOut } : null,
	].filter(Boolean) as Array<{ icon: typeof Home; label: string; value: string }>;

	if (items.length === 0) return null;

	return (
		<section>
			<p className={styles.eyebrow}>{eyebrow}</p>
			<div className={cn('mt-5', styles.grid)}>
				{items.map((item) => {
					const Icon = item.icon;
					return (
						<div key={`${item.label}-${item.value}`} className={styles.card}>
							<div className="flex items-center gap-2">
								<Icon className={styles.icon} strokeWidth={1.5} aria-hidden />
								<p className={styles.label}>{item.label}</p>
							</div>
							<p className={styles.value}>{item.value}</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}
