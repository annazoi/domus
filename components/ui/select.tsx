'use client';

import {
	Children,
	type ReactNode,
	forwardRef,
	isValidElement,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
	type SelectHTMLAttributes,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from './cn';

export type SelectVariant = 'default' | 'settings' | 'auth' | 'compact';

const surface = cn(
	'flex w-full cursor-pointer items-center rounded-xl border border-black/[0.07] bg-white text-left text-[#1A1A1A] outline-none',
	'transition-[border-color,box-shadow,background-color] duration-150 ease-out',
	'hover:border-black/11',
	'focus-visible:border-[#6B705C]/38 focus-visible:ring-1 focus-visible:ring-[#6B705C]/10',
	'disabled:cursor-not-allowed',
);

const variantTrigger: Record<SelectVariant, string> = {
	default: cn(surface, 'py-3 pl-4 pr-10', 'disabled:bg-[#F7F5F2] disabled:text-[#1A1A1A]/38'),
	settings: cn(surface, 'py-3 pl-4 pr-10 text-sm', 'focus-visible:ring-[#6B705C]/12', 'disabled:opacity-55'),
	auth: cn(
		'flex w-full cursor-pointer items-center rounded-sm border border-stone-200/95 bg-white py-3 pl-4 pr-10 text-left font-light text-stone-900 outline-none transition duration-150 ease-out',
		'hover:border-stone-300 focus-visible:border-stone-400 focus-visible:ring-1 focus-visible:ring-stone-400/25',
		'disabled:opacity-60',
	),
	compact: cn(surface, 'py-2.5 pl-3 pr-10 text-sm', 'disabled:opacity-55'),
};

const chevronTone: Record<SelectVariant, string> = {
	default: 'text-[#6B705C]/40',
	settings: 'text-[#6B705C]/46',
	auth: 'text-stone-400',
	compact: 'text-[#1A1A1A]/30',
};

type Opt = { value: string; label: string; disabled?: boolean };

function readOptions(children: ReactNode): Opt[] {
	const out: Opt[] = [];
	Children.forEach(children, (child) => {
		if (!isValidElement<{ value?: string; disabled?: boolean; children?: ReactNode }>(child)) return;
		if (child.type !== 'option') return;
		const { value = '', disabled, children: ch } = child.props;
		const label =
			typeof ch === 'string' || typeof ch === 'number'
				? String(ch)
				: Children.toArray(ch)
						.map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
						.join('') || value;
		out.push({ value, label, disabled });
	});
	return out;
}

const menu = cn(
	'absolute left-0 right-0 top-[calc(100%+0.375rem)] z-50 max-h-[min(16rem,50vh)] overflow-auto rounded-xl border border-black/[0.08] bg-white py-1 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]',
);

const row = cn(
	'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#1A1A1A] transition-colors',
	'hover:bg-[#6B705C]/[0.07] focus:bg-[#6B705C]/[0.07] focus:outline-none',
	'data-disabled:pointer-events-none data-disabled:opacity-40',
	'data-active:bg-[#6B705C]/[0.09]',
);

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { variant?: SelectVariant };

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
	{
		className,
		variant = 'default',
		disabled,
		children,
		value: valueProp,
		defaultValue,
		onChange,
		id,
		...selectAttrs
	},
	ref,
) {
	const uid = useId();
	const listId = `${uid}-list`;
	const opts = useMemo(() => readOptions(children), [children]);
	const [open, setOpen] = useState(false);
	const [hi, setHi] = useState(0);
	const rootRef = useRef<HTMLDivElement>(null);
	const isControlled = valueProp !== undefined;
	const selected = isControlled ? String(valueProp) : undefined;
	const [uncontrolled, setUncontrolled] = useState(defaultValue !== undefined ? String(defaultValue) : '');
	const current = isControlled ? selected! : uncontrolled;

	const label = opts.find((o) => o.value === current)?.label ?? '';

	const selectAt = useCallback(
		(i: number) => {
			const o = opts[i];
			if (!o || o.disabled) return;
			if (!isControlled) setUncontrolled(o.value);
			onChange?.({ target: { value: o.value } } as React.ChangeEvent<HTMLSelectElement>);
			setOpen(false);
		},
		[isControlled, onChange, opts],
	);

	useEffect(() => {
		if (!open) return;
		const close = (e: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', close);
		return () => document.removeEventListener('mousedown', close);
	}, [open]);

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (disabled) return;
		if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
			e.preventDefault();
			const i = opts.findIndex((o) => o.value === current);
			setHi(i >= 0 ? i : 0);
			setOpen(true);
			return;
		}
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			setOpen(false);
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setHi((i) => {
				if (opts.length === 0) return 0;
				let n = i;
				for (let step = 0; step < opts.length; step++) {
					n = (n + 1) % opts.length;
					if (!opts[n]?.disabled) return n;
				}
				return i;
			});
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			setHi((i) => {
				if (opts.length === 0) return 0;
				let n = i;
				for (let step = 0; step < opts.length; step++) {
					n = (n - 1 + opts.length) % opts.length;
					if (!opts[n]?.disabled) return n;
				}
				return i;
			});
		}
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			selectAt(hi);
		}
	};

	return (
		<div ref={rootRef} className={cn('relative isolate w-full', className)}>
			<select
				{...selectAttrs}
				className="sr-only"
				tabIndex={-1}
				aria-hidden
				value={current}
				onChange={() => {}}
				disabled={disabled}
			>
				{children}
			</select>
			<button
				type="button"
				ref={ref}
				id={id}
				disabled={disabled}
				role="combobox"
				aria-autocomplete="none"
				aria-expanded={open}
				aria-controls={open ? listId : undefined}
				aria-activedescendant={open ? `${uid}-opt-${hi}` : undefined}
				aria-required={selectAttrs.required}
				className={cn(variantTrigger[variant])}
				onClick={() => {
					if (disabled) return;
					setOpen((prev) => {
						if (!prev) {
							const i = opts.findIndex((o) => o.value === current);
							setHi(i >= 0 ? i : 0);
						}
						return !prev;
					});
				}}
				onKeyDown={onKeyDown}
			>
				<span className="min-w-0 flex-1 truncate">{label}</span>
				<span
					className={cn(
						'pointer-events-none absolute right-3 top-1/2 flex h-[1.125rem] w-[1.125rem] -translate-y-1/2 items-center justify-center transition-transform duration-200',
						open && 'rotate-180',
						chevronTone[variant],
						disabled && 'opacity-35',
					)}
					aria-hidden
				>
					<ChevronDown className="h-full w-full shrink-0" strokeWidth={1.5} />
				</span>
			</button>
			{open && (
				<ul id={listId} role="listbox" tabIndex={-1} className={menu}>
					{opts.map((o, i) => {
						const active = i === hi;
						const sel = o.value === current;
						return (
							<li key={o.value} role="presentation">
								<button
									type="button"
									role="option"
									aria-selected={sel}
									data-active={active ? '' : undefined}
									data-disabled={o.disabled ? '' : undefined}
									disabled={o.disabled}
									id={`${uid}-opt-${i}`}
									className={row}
									onMouseEnter={() => !o.disabled && setHi(i)}
									onClick={() => selectAt(i)}
								>
									<span className="min-w-0 flex-1 truncate">{o.label}</span>
									{sel && <Check className="h-3.5 w-3.5 shrink-0 text-[#6B705C]" strokeWidth={2} aria-hidden />}
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
});

Select.displayName = 'Select';
