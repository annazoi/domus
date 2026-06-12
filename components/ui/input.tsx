'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from './cn';

export type InputVariant = 'default' | 'auth' | 'settings' | 'plain' | 'compact';

const variantClasses: Record<InputVariant, string> = {
	default:
		'w-full rounded-xl border border-dashboard-border bg-dashboard-surface px-4 py-3 text-espresso outline-none transition hover:border-camel/25 focus:border-camel/40 focus:ring-2 focus:ring-camel/12',
	auth: 'w-full rounded-sm border border-dashboard-border bg-dashboard-surface px-4 py-3 font-light text-espresso outline-none transition placeholder:text-dashboard-muted/50 hover:border-camel/35 focus:border-camel focus:ring-4 focus:ring-camel/20 focus:outline-none',
	settings:
		'w-full rounded-xl border border-dashboard-border bg-dashboard-surface px-4 py-3 text-sm text-espresso outline-none transition focus:border-camel/45 focus:ring-2 focus:ring-camel/15',
	plain: 'w-full bg-transparent text-sm text-espresso outline-none placeholder:text-dashboard-muted',
	compact:
		'w-full rounded-xl border border-dashboard-border bg-dashboard-surface px-3 py-2.5 text-espresso outline-none transition focus:border-camel/40 focus:ring-2 focus:ring-camel/12',
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
