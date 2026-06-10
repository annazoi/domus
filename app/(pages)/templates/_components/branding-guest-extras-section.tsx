'use client';

import Image from 'next/image';
import { cn } from '@/components/ui';
import type { BrandingPreviewDemo } from '../_utils/branding-preview-demo';

type BrandingGuestExtrasSectionProps = {
	guestExtras: BrandingPreviewDemo['guestExtras'];
	variant: 'canvas' | 'mizu' | 'architectura';
	eyebrow?: string;
};

const variantStyles = {
	canvas: {
		eyebrow: 'font-[family-name:var(--preview-hikari-body)] text-[10px] uppercase tracking-[0.35em] text-[#0a0a0a]/40',
		grid: 'grid gap-4 sm:grid-cols-2',
		card: 'flex gap-4 border border-[#0a0a0a]/10 bg-[#fcfcfa] p-4',
		image: 'relative h-20 w-20 shrink-0 overflow-hidden bg-[#0a0a0a]/5',
		name: 'font-[family-name:var(--preview-hikari-display)] text-sm font-semibold uppercase tracking-wider text-[#0a0a0a]',
		description: 'mt-1 font-[family-name:var(--preview-hikari-body)] text-sm leading-relaxed text-[#0a0a0a]/60',
		price: 'mt-2 font-[family-name:var(--preview-hikari-body)] text-sm font-medium text-[#d4a853]',
	},
	mizu: {
		eyebrow:
			'font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.28em] text-[#4d7c6f]',
		grid: 'grid gap-4 sm:grid-cols-2',
		card: 'flex gap-4 rounded-[1.25rem] border border-[#6b9a8f]/15 bg-[#fff9f4] p-4',
		image: 'relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#2a4549]/10',
		name: 'font-[family-name:var(--preview-mizu-headline)] text-lg text-[#1a2e35]',
		description: 'mt-1 font-[family-name:var(--preview-mizu-body)] text-sm leading-relaxed text-[#1a2e35]/65',
		price: 'mt-2 font-[family-name:var(--preview-mizu-body)] text-sm font-medium text-[#c4785a]',
	},
	architectura: {
		eyebrow:
			'font-[family-name:var(--preview-kaze-body)] text-[10px] font-medium uppercase tracking-[0.35em] text-[#6b8f9e]',
		grid: 'grid gap-4 sm:grid-cols-2',
		card: 'flex gap-4 rounded-xl border border-[#1c2430]/8 bg-white/60 p-4 backdrop-blur-sm',
		image: 'relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#1c2430]/5',
		name: 'font-[family-name:var(--preview-kaze-headline)] text-lg text-[#1c2430]',
		description: 'mt-1 font-[family-name:var(--preview-kaze-body)] text-sm leading-relaxed text-[#1c2430]/60',
		price: 'mt-2 font-[family-name:var(--preview-kaze-body)] text-sm font-medium text-[#6b8f9e]',
	},
} as const;

export function BrandingGuestExtrasSection({
	guestExtras,
	variant,
	eyebrow = 'Guest extras',
}: BrandingGuestExtrasSectionProps) {
	const styles = variantStyles[variant];
	if (guestExtras.length === 0) return null;

	return (
		<section>
			<p className={styles.eyebrow}>{eyebrow}</p>
			<div className={cn('mt-5', styles.grid)}>
				{guestExtras.map((extra) => (
					<div key={extra.id} className={styles.card}>
						{extra.imageSrc ? (
							<div className={styles.image}>
								<Image src={extra.imageSrc} alt="" fill className="object-cover" sizes="80px" unoptimized />
							</div>
						) : null}
						<div className="min-w-0">
							<p className={styles.name}>{extra.name}</p>
							{extra.description ? <p className={styles.description}>{extra.description}</p> : null}
							{extra.price ? <p className={styles.price}>{extra.price}</p> : null}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
