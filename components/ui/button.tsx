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
		'cursor-pointer rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover disabled:opacity-60 disabled:pointer-events-none',
	primarySm:
		'cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover disabled:opacity-60 disabled:pointer-events-none',
	secondary:
		'cursor-pointer rounded-full border border-dashboard-border bg-dashboard-surface px-4 py-2 text-sm text-espresso transition hover:border-camel/45 hover:bg-dashboard-row-hover disabled:opacity-60 disabled:pointer-events-none',
	ghost:
		'cursor-pointer rounded-md p-2 text-camel transition hover:bg-dashboard-row-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
	ghostIcon:
		'cursor-pointer rounded-md p-2 text-camel transition hover:bg-dashboard-row-hover inline-flex items-center justify-center',
	iconSquare:
		'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-dashboard-border bg-dashboard-surface text-dashboard-muted transition hover:border-camel/35',
	auth: 'inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-stone-900 py-3.5 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70',
	dangerLink: 'cursor-pointer text-sm text-dashboard-muted transition hover:text-red-600',
	tab: 'block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-dashboard-muted transition hover:bg-dashboard-row-hover hover:text-espresso',
	tabActive: 'block w-full cursor-pointer rounded-lg bg-[color:var(--color-dashboard-nav-active)] px-3 py-2 text-left text-sm text-espresso',
	chip: 'cursor-pointer inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition',
	quickAction:
		'cursor-pointer rounded-full border border-black/15 bg-cream px-5 py-2.5 text-sm font-medium text-espresso transition hover:-translate-y-0.5 hover:border-camel hover:bg-camel hover:text-cream',
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
		'cursor-pointer rounded-full border border-dashboard-border px-4 py-2 text-sm text-espresso transition hover:bg-dashboard-row-hover',
	subscriptionInactive: 'cursor-not-allowed rounded-full bg-dashboard-row-hover px-5 py-2.5 text-sm text-dashboard-muted',
	sidebarOutline:
		'w-full cursor-pointer rounded-full border border-dashboard-border px-5 py-2.5 text-sm text-espresso transition hover:bg-dashboard-row-hover',
	cardRow:
		'w-full cursor-pointer rounded-full border border-dashboard-border px-4 py-3 text-left text-sm text-espresso transition hover:border-camel/40',
	accountTrigger:
		'flex cursor-pointer items-center gap-2 rounded-full bg-white/80 px-2 py-1.5 text-sm transition hover:bg-white',
	navLogin:
		'cursor-pointer rounded-full border border-stone-100/30 px-5 py-2 text-sm font-medium text-stone-100 transition hover:bg-stone-100 hover:text-stone-900',
	ghostPill: 'cursor-pointer rounded-full px-5 py-2.5 text-sm text-dashboard-muted transition hover:bg-dashboard-row-hover hover:text-espresso',
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
