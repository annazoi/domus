'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from './cn';

export type InputVariant = 'default' | 'auth' | 'settings' | 'plain' | 'compact';

const variantClasses: Record<InputVariant, string> = {
	default:
		'w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[#1A1A1A] outline-none transition hover:border-[#6B705C]/25 focus:border-[#6B705C]/40 focus:ring-2 focus:ring-[#6B705C]/12',
	auth: 'w-full rounded-sm border border-stone-200 bg-white px-4 py-3 font-light text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-stone-400 focus:ring-1 focus:ring-stone-400',
	settings:
		'w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1A1A1A] outline-none transition focus:border-[#6B705C]/45 focus:ring-2 focus:ring-[#6B705C]/15',
	plain: 'w-full bg-transparent text-sm text-[#1A1A1A] outline-none placeholder:text-[#1A1A1A]/45',
	compact: 'w-full rounded-xl border border-black/10 px-3 py-2.5 text-[#1A1A1A] outline-none transition focus:border-black/20',
};

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	variant?: InputVariant;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{ className, variant = 'default', type = 'text', ...props },
	ref,
) {
	return <input ref={ref} type={type} className={cn(variantClasses[variant], className)} {...props} />;
});

Input.displayName = 'Input';
