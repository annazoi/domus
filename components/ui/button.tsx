'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

export type ButtonVariant =
	| 'primary'
	| 'primarySm'
	| 'secondary'
	| 'ghost'
	| 'ghostIcon'
	| 'iconSquare'
	| 'auth'
	| 'dangerLink'
	| 'tab'
	| 'tabActive'
	| 'chip'
	| 'quickAction'
	| 'hero'
	| 'heroDark'
	| 'pricingOutline'
	| 'pricingInverse'
	| 'outlineDark'
	| 'calendarPill'
	| 'subscriptionInactive'
	| 'sidebarOutline'
	| 'cardRow'
	| 'accountTrigger'
	| 'navLogin'
	| 'ghostPill'
	| 'custom';

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		'cursor-pointer rounded-full bg-[#1A1A1A] px-6 py-2.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-[#1A1A1A]/90 disabled:opacity-60 disabled:pointer-events-none',
	primarySm:
		'cursor-pointer rounded-full bg-[#1A1A1A] px-5 py-2.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-[#1A1A1A]/90 disabled:opacity-60 disabled:pointer-events-none',
	secondary:
		'cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-[#1A1A1A] transition hover:border-[#6B705C]/40 hover:bg-black/[0.02]',
	ghost:
		'cursor-pointer rounded-md p-2 text-[#6B705C] transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
	ghostIcon:
		'cursor-pointer rounded-md p-2 text-[#6B705C] transition hover:bg-black/5 inline-flex items-center justify-center',
	iconSquare:
		'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-black/5 bg-white text-[#1A1A1A]/70 transition hover:border-[#6B705C]/30',
	auth: 'inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-stone-900 py-3.5 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70',
	dangerLink: 'cursor-pointer text-sm text-[#1A1A1A]/70 transition hover:text-red-700',
	tab: 'block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-[#1A1A1A]/70 transition hover:bg-black/5 hover:text-[#1A1A1A]',
	tabActive: 'block w-full cursor-pointer rounded-lg bg-black/5 px-3 py-2 text-left text-sm text-[#1A1A1A]',
	chip: 'cursor-pointer inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition',
	quickAction:
		'cursor-pointer rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm transition hover:-translate-y-0.5 hover:border-[#6B705C]/40 hover:text-[#6B705C]',
	hero: 'cursor-pointer rounded-full bg-stone-50 px-8 py-4 text-sm font-medium tracking-wide text-stone-900 transition hover:bg-stone-200',
	heroDark:
		'cursor-pointer rounded-full bg-stone-900 px-10 py-5 text-sm font-medium tracking-wide text-stone-50 transition hover:bg-stone-800',
	pricingOutline:
		'w-full cursor-pointer rounded-full border border-stone-800 py-3 text-sm text-stone-900 transition hover:bg-stone-50',
	pricingInverse:
		'w-full cursor-pointer rounded-full bg-stone-50 py-3 text-sm text-stone-900 transition hover:bg-stone-200',
	outlineDark:
		'cursor-pointer rounded-full border border-[#1A1A1A] bg-[#1A1A1A] px-6 py-3 text-sm text-white transition hover:-translate-y-0.5',
	calendarPill:
		'cursor-pointer rounded-full border border-black/10 px-4 py-2 text-sm transition hover:bg-black/[0.02]',
	subscriptionInactive: 'cursor-not-allowed rounded-full bg-black/5 px-5 py-2.5 text-sm text-[#1A1A1A]/50',
	sidebarOutline:
		'w-full cursor-pointer rounded-full border border-black/10 px-5 py-2.5 text-sm transition hover:bg-black/5',
	cardRow:
		'w-full cursor-pointer rounded-xl border border-black/10 px-4 py-3 text-left text-sm transition hover:border-[#6B705C]/40',
	accountTrigger:
		'flex cursor-pointer items-center gap-2 rounded-full bg-white/80 px-2 py-1.5 text-sm transition hover:bg-white',
	navLogin:
		'cursor-pointer rounded-full border border-stone-100/30 px-5 py-2 text-sm font-medium text-stone-100 transition hover:bg-stone-100 hover:text-stone-900',
	ghostPill: 'cursor-pointer rounded-full px-5 py-2.5 text-sm text-[#1A1A1A]/70 transition hover:bg-black/5',
	custom: '',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ className, variant = 'primary', type = 'button', ...props },
	ref,
) {
	return <button ref={ref} type={type} className={cn(variantClasses[variant], className)} {...props} />;
});

Button.displayName = 'Button';

/** Class string for `<Link>` or `motion.button` that should match a button variant. */
export function buttonClassName(variant: ButtonVariant = 'primary', className?: string) {
	return cn(variantClasses[variant], className);
}
