'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './button';

type ConfirmationDialogProps = {
	open: boolean;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmVariant?: 'primary' | 'danger';
	onConfirm: () => void;
	onCancel: () => void;
	loading?: boolean;
};

export function ConfirmationDialog({
	open,
	title,
	description,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	confirmVariant = 'primary',
	onConfirm,
	onCancel,
	loading = false,
}: ConfirmationDialogProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{open ? (
				<motion.div
					className="fixed inset-0 z-[80] flex items-center justify-center p-4"
					role="presentation"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.18 }}
					onClick={onCancel}
				>
					<div className="absolute inset-0 bg-black/45" aria-hidden />
					<motion.div
						role="dialog"
						aria-modal
						aria-labelledby="confirm-dialog-title"
						className="relative z-10 w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl"
						initial={{ opacity: 0, scale: 0.96, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: 10 }}
						transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
						onClick={(event) => event.stopPropagation()}
					>
						<h3 id="confirm-dialog-title" className="font-serif text-2xl tracking-tight text-[#1A1A1A]">
							{title}
						</h3>
						<p className="mt-2 text-sm text-[#1A1A1A]/65">{description}</p>
						<div className="mt-6 flex justify-end gap-3">
							<Button type="button" variant="ghostPill" onClick={onCancel} disabled={loading}>
								{cancelLabel}
							</Button>
							<Button
								type="button"
								variant={confirmVariant === 'danger' ? 'secondary' : 'primary'}
								className={confirmVariant === 'danger' ? 'border-red-300 text-red-700 hover:bg-red-50' : ''}
								onClick={onConfirm}
								disabled={loading}
							>
								{loading ? 'Working...' : confirmLabel}
							</Button>
						</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>,
		document.body,
	);
}
