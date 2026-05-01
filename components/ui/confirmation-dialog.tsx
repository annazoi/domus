'use client';

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
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="presentation" onClick={onCancel}>
			<div className="absolute inset-0 bg-black/45" aria-hidden />
			<div
				role="dialog"
				aria-modal
				aria-labelledby="confirm-dialog-title"
				className="relative z-10 w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl"
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
			</div>
		</div>
	);
}
