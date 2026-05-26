'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import {
	PROPERTY_BRANDING_THEME_OPTIONS,
	brandingThemeToTemplateSlug,
} from '@/app/(pages)/templates/_constants/property-branding-theme';

type ThemesShowcaseModalProps = {
	open: boolean;
	onClose: () => void;
};

export function ThemesShowcaseModal({ open, onClose }: ThemesShowcaseModalProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKeyDown);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = prevOverflow;
		};
	}, [open, onClose]);

	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{open ? (
				<motion.div
					className="themes-modal-backdrop"
					role="presentation"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.18 }}
					onClick={onClose}
				>
					<motion.div
						role="dialog"
						aria-modal
						aria-labelledby="themes-modal-title"
						className="themes-modal-panel"
						initial={{ opacity: 0, scale: 0.96, y: 12 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: 12 }}
						transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
						onClick={(event) => event.stopPropagation()}
					>
						<header className="themes-modal-header">
							<div>
								<p className="themes-modal-eyebrow">Design</p>
								<h2 id="themes-modal-title" className="themes-modal-title">
									Property page themes
								</h2>
								<p className="themes-modal-subtitle">
									Each listing can use a full-site theme. Preview the live demo layout.
								</p>
							</div>
							<button type="button" className="themes-modal-close" onClick={onClose} aria-label="Close">
								<X className="h-5 w-5" />
							</button>
						</header>

						<div className="themes-modal-grid">
							{PROPERTY_BRANDING_THEME_OPTIONS.map((option) => (
								<article key={option.id} className="themes-modal-card">
									<div className="themes-modal-thumb relative aspect-[4/5] overflow-hidden rounded-xl bg-black/5">
										<Image
											src={option.image}
											alt={option.imageAlt}
											fill
											sizes="280px"
											className="object-cover"
										/>
									</div>
									<h3 className="themes-modal-card-title">{option.label}</h3>
									<div className="mt-2 flex flex-wrap gap-1.5">
										{option.tags.map((tag) => (
											<span
												key={tag}
												className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs text-black/55"
											>
												{tag}
											</span>
										))}
									</div>
									<p className="themes-modal-card-desc">{option.description}</p>
									<button
										type="button"
										className="themes-modal-preview-btn"
										onClick={() => {
											const slug = brandingThemeToTemplateSlug(option.id);
											window.open(`/templates/${slug}`, '_blank', 'noopener,noreferrer');
										}}
									>
										<Eye className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
										Preview theme
									</button>
								</article>
							))}
						</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>,
		document.body,
	);
}
