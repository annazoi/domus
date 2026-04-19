'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from './cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...props }, ref) {
	return (
		<textarea
			ref={ref}
			className={cn(
				'min-h-28 w-full rounded-xl border border-black/10 px-4 py-3 text-[#1A1A1A] outline-none transition focus:border-black/20',
				className,
			)}
			{...props}
		/>
	);
});

Textarea.displayName = 'Textarea';
