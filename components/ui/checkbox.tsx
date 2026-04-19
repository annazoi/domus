'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from './cn';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ className, ...props }, ref) {
	return <input ref={ref} type="checkbox" className={cn('h-4 w-4 rounded border-black/20', className)} {...props} />;
});

Checkbox.displayName = 'Checkbox';
