'use client';

import { forwardRef, useRef, type InputHTMLAttributes } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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

/** Hides the native browser spinners; NumberStepper replaces them. */
const hideNativeSpinners =
	'pr-10 [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none';

const stepperButton =
	'flex h-1/2 w-full cursor-pointer items-center justify-center rounded-md text-dashboard-muted transition-colors hover:bg-camel/15 hover:text-camel active:bg-camel/25 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-dashboard-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-camel/60';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	variant?: InputVariant;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{ className, variant = 'default', type = 'text', ...props },
	ref,
) {
	const wrapperRef = useRef<HTMLDivElement>(null);

	if (type !== 'number') {
		return <input ref={ref} type={type} className={cn(variantClasses[variant], className)} {...props} />;
	}

	const locked = Boolean(props.disabled || props.readOnly);

	const step = (direction: 'up' | 'down') => {
		const input = wrapperRef.current?.querySelector('input');
		if (!input || locked) return;
		if (direction === 'up') input.stepUp();
		else input.stepDown();
		// stepUp/stepDown bypass React's value tracking, so a bubbling input event triggers onChange.
		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.dispatchEvent(new Event('change', { bubbles: true }));
	};

	return (
		<div ref={wrapperRef} className="relative w-full">
			<input
				ref={ref}
				type="number"
				className={cn(variantClasses[variant], hideNativeSpinners, className)}
				{...props}
			/>
			<div className="absolute inset-y-1.5 right-1.5 flex w-6 flex-col gap-px">
				<button
					type="button"
					tabIndex={-1}
					aria-label="Increase"
					disabled={locked}
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => step('up')}
					className={stepperButton}
				>
					<ChevronUp className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
				</button>
				<button
					type="button"
					tabIndex={-1}
					aria-label="Decrease"
					disabled={locked}
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => step('down')}
					className={stepperButton}
				>
					<ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
				</button>
			</div>
		</div>
	);
});

Input.displayName = 'Input';
