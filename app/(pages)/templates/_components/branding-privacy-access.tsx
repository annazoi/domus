'use client';

import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/components/ui';
import { BrandingRichTextBlock } from './branding-rich-text-block';

type BrandingPrivacyVariant = 'canvas' | 'mizu' | 'architectura';

const buttonStyles: Record<BrandingPrivacyVariant, string> = {
	canvas:
		'cursor-pointer rounded-full border border-[#fcfcfa]/30 bg-[#0a0a0a]/40 px-4 py-2 font-[family-name:var(--preview-hikari-body)] text-[10px] font-medium uppercase tracking-[0.22em] text-[#fcfcfa] backdrop-blur-md transition hover:border-[#d4a853]/50 hover:bg-[#0a0a0a]/60',
	mizu: 'cursor-pointer rounded-full border border-[#fff9f4]/25 bg-[#1a2e35]/45 px-4 py-2 font-[family-name:var(--preview-mizu-body)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#fff9f4] backdrop-blur-md transition hover:border-[#f5d4c8]/40 hover:bg-[#1a2e35]/65',
	architectura:
		'cursor-pointer font-[family-name:var(--preview-kaze-body)] text-sm font-medium text-[#2F5D44] underline decoration-[#2F5D44]/30 underline-offset-4 transition hover:text-[#244A36] hover:decoration-[#244A36]/40',
};

const modalStyles: Record<
	BrandingPrivacyVariant,
	{ panel: string; title: string; close: string; overlay: string }
> = {
	canvas: {
		overlay: 'bg-[#0a0a0a]/55',
		panel: 'max-w-lg rounded-none border border-[#0a0a0a] bg-[#fcfcfa] shadow-2xl',
		title:
			'font-[family-name:var(--preview-hikari-display)] text-2xl font-bold uppercase tracking-[0.08em] text-[#0a0a0a]',
		close:
			'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#0a0a0a]/15 text-[#0a0a0a]/55 transition hover:border-[#0a0a0a]/30 hover:text-[#0a0a0a]',
	},
	mizu: {
		overlay: 'bg-[#1a2e35]/60',
		panel: 'max-w-lg rounded-[1.75rem] border border-[#6b9a8f]/20 bg-[#fff9f4] shadow-[0_32px_80px_-24px_rgba(26,46,53,0.45)]',
		title:
			'font-[family-name:var(--preview-mizu-headline)] text-3xl tracking-tight text-[#1a2e35]',
		close:
			'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#6b9a8f]/25 text-[#1a2e35]/50 transition hover:border-[#6b9a8f]/45 hover:text-[#1a2e35]',
	},
	architectura: {
		overlay: 'bg-[#1C211C]/45',
		panel: 'max-w-lg rounded-2xl border border-[#E5E8E5] bg-white shadow-[0_32px_80px_-24px_rgba(28,33,28,0.2)]',
		title:
			'font-[family-name:var(--preview-kaze-headline)] text-2xl font-semibold tracking-[-0.02em] text-[#1C211C]',
		close:
			'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#E5E8E5] text-[#5F665F] transition hover:border-[#2F5D44]/30 hover:text-[#1C211C]',
	},
};

function BrandingPrivacyModal({
	open,
	onClose,
	html,
	variant,
}: {
	open: boolean;
	onClose: () => void;
	html: string;
	variant: BrandingPrivacyVariant;
}) {
	const [mounted, setMounted] = useState(false);
	const styles = modalStyles[variant];

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};
		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', onKeyDown);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [open, onClose]);

	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{open ? (
				<motion.div
					className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center"
					role="presentation"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					onClick={onClose}
				>
					<div className={cn('absolute inset-0', styles.overlay)} aria-hidden />
					<motion.div
						role="dialog"
						aria-modal
						aria-labelledby="branding-privacy-title"
						className={cn('relative z-10 flex max-h-[min(85vh,720px)] w-full flex-col', styles.panel)}
						initial={{ opacity: 0, y: 24, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 16, scale: 0.98 }}
						transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/8 px-6 py-5 sm:px-8">
							<h2 id="branding-privacy-title" className={styles.title}>
								Privacy
							</h2>
							<button type="button" onClick={onClose} className={styles.close} aria-label="Close privacy policy">
								<X className="h-4 w-4" strokeWidth={1.5} />
							</button>
						</div>
						<div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
							<BrandingRichTextBlock html={html} variant={variant} />
						</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>,
		document.body,
	);
}

export function BrandingPrivacyAccess({
	html,
	variant,
	className,
}: {
	html: string;
	variant: BrandingPrivacyVariant;
	className?: string;
}) {
	const content = html.trim();
	const [open, setOpen] = useState(false);

	if (!content) return null;

	return (
		<>
			<button type="button" onClick={() => setOpen(true)} className={cn(buttonStyles[variant], className)}>
				Privacy
			</button>
			<BrandingPrivacyModal open={open} onClose={() => setOpen(false)} html={content} variant={variant} />
		</>
	);
}
