'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Link2, Trash2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

export type RichTextLinkDialogProps = {
	open: boolean;
	initialUrl: string;
	selectionPreview?: string;
	hasExistingLink?: boolean;
	onApply: (url: string) => void;
	onRemove: () => void;
	onCancel: () => void;
};

function stripProtocol(url: string) {
	return url.replace(/^https?:\/\//i, '');
}

function previewHref(raw: string) {
	const trimmed = raw.trim();
	if (!trimmed) return '';
	if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
	return `https://${trimmed}`;
}

export function RichTextLinkDialog({
	open,
	initialUrl,
	selectionPreview,
	hasExistingLink = false,
	onApply,
	onRemove,
	onCancel,
}: RichTextLinkDialogProps) {
	const titleId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [mounted, setMounted] = useState(false);
	const [url, setUrl] = useState(initialUrl);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!open) return;
		setUrl(hasExistingLink ? stripProtocol(initialUrl) : initialUrl ? stripProtocol(initialUrl) : '');
		const frame = requestAnimationFrame(() => inputRef.current?.focus());
		return () => cancelAnimationFrame(frame);
	}, [open, initialUrl, hasExistingLink]);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onCancel();
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [open, onCancel]);

	if (!mounted) return null;

	const preview = previewHref(url);
	const trimmedSelection = selectionPreview?.trim() ?? '';
	const canApply = url.trim().length > 0;

	return createPortal(
		<AnimatePresence>
			{open ? (
				<motion.div
					className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
					role="presentation"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.16 }}
					onClick={onCancel}
				>
					<div className="absolute inset-0 bg-espresso/35 backdrop-blur-[2px]" aria-hidden />
					<motion.div
						role="dialog"
						aria-modal
						aria-labelledby={titleId}
						className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_80px_-32px_rgb(61_50_41/0.45)]"
						initial={{ opacity: 0, y: 16, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 12, scale: 0.98 }}
						transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
						onClick={(event) => event.stopPropagation()}
					>
						<div className="h-1 bg-gradient-to-r from-camel/20 via-camel to-camel/20" aria-hidden />
						<div className="p-6">
							<div className="flex items-start gap-4">
								<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-camel/20 bg-cream/80 text-camel">
									<Link2 className="h-5 w-5" strokeWidth={1.75} />
								</div>
								<div className="min-w-0 flex-1 pt-0.5">
									<h3 id={titleId} className="font-serif text-xl tracking-tight text-espresso">
										{hasExistingLink ? 'Edit link' : 'Add link'}
									</h3>
									<p className="mt-1 text-sm leading-relaxed text-espresso/55">
										{trimmedSelection
											? 'Link the selected text to a destination.'
											: 'Paste a URL or type an address — https is added automatically.'}
									</p>
								</div>
							</div>

							{trimmedSelection ? (
								<div className="mt-5 rounded-xl border border-black/6 bg-dashboard-inset/60 px-4 py-3">
									<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-espresso/40">Selected text</p>
									<p className="mt-1 truncate font-medium text-espresso">&ldquo;{trimmedSelection}&rdquo;</p>
								</div>
							) : null}

							<div className="mt-5 space-y-2">
								<label htmlFor={`${titleId}-url`} className="text-xs font-medium uppercase tracking-[0.18em] text-espresso/45">
									Destination
								</label>
								<div className="relative">
									<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-espresso/35">
										https://
									</span>
									<Input
										ref={inputRef}
										id={`${titleId}-url`}
										variant="compact"
										type="url"
										inputMode="url"
										autoComplete="off"
										spellCheck={false}
										placeholder="your-site.com/page"
										value={url}
										onChange={(event) => setUrl(event.target.value)}
										onKeyDown={(event) => {
											if (event.key === 'Enter') {
												event.preventDefault();
												if (canApply) onApply(url);
											}
										}}
										className="pl-[4.75rem] pr-4"
									/>
								</div>
								{preview ? (
									<a
										href={preview}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex max-w-full items-center gap-1.5 truncate text-xs text-camel transition hover:text-camel-dark"
									>
										<ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
										<span className="truncate">{preview}</span>
									</a>
								) : (
									<p className="text-xs text-espresso/35">Leave empty and remove to unlink text.</p>
								)}
							</div>

							<div className="mt-6 flex flex-wrap items-center gap-2">
								{hasExistingLink ? (
									<Button
										type="button"
										variant="custom"
										className="mr-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-red-700/80 transition hover:bg-red-50"
										onClick={onRemove}
									>
										<Trash2 className="h-4 w-4" strokeWidth={1.75} />
										Remove link
									</Button>
								) : (
									<span className="mr-auto" />
								)}
								<Button type="button" variant="ghostPill" onClick={onCancel}>
									Cancel
								</Button>
								<Button type="button" variant="primary" disabled={!canApply} onClick={() => onApply(url)}>
									{hasExistingLink ? 'Update link' : 'Insert link'}
								</Button>
							</div>
						</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>,
		document.body,
	);
}

export function normalizeRichTextLinkUrl(raw: string): string {
	const trimmed = raw.trim();
	if (!trimmed) return '';
	if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
	return `https://${trimmed.replace(/^https?:\/\//i, '')}`;
}
