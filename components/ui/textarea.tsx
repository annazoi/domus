'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from './cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...props }, ref) {
	return (
		<textarea
			ref={ref}
			className={cn(
				'min-h-28 w-full rounded-xl border border-dashboard-border bg-dashboard-surface px-4 py-3 text-espresso outline-none transition placeholder:text-dashboard-muted focus:border-camel/40 focus:ring-2 focus:ring-camel/12',
				className,
			)}
			{...props}
		/>
	);
});

Textarea.displayName = 'Textarea';
